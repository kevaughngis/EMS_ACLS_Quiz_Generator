import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Plane, Grid, Cylinder, Box, Html, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../store/useStore';

interface PatientModelProps {
  onAssess: (part: string) => void;
}

export const PatientModel: React.FC<PatientModelProps> = ({ onAssess }) => {
  const { patientState, activePatientIndex, secondaryPatientState, scenario } = useStore();
  const [hovered, setHovered] = useState<string | null>(null);
  const chestRef = useRef<THREE.Group>(null);

  const currentState = activePatientIndex === 0 ? patientState : secondaryPatientState;

  useFrame((state) => {
    if (chestRef.current) {
      const t = state.clock.getElapsedTime();
      const breathScale = 1 + Math.sin(t * 1.5) * 0.02;
      chestRef.current.scale.set(1, breathScale, 1);
    }
  });

  const getSkinColor = () => {
    if (!currentState) return "#f3c1ad";
    const spo2 = currentState.vitals.spo2;
    const map = currentState.vitals.map;

    // Mix colors based on clinical state
    const base = new THREE.Color("#f3c1ad");
    const cyanotic = new THREE.Color("#64b5f6"); // Blue tint
    const pallid = new THREE.Color("#e2e8f0");   // Grey/Pale tint

    if (spo2 < 85) base.lerp(cyanotic, (85 - spo2) / 40);
    if (map < 60) base.lerp(pallid, (60 - map) / 40);

    return `#${base.getHexString()}`;
  };

  const skinMat = { color: getSkinColor(), roughness: 0.3 };
  const gownMat = { color: "#93c5fd", roughness: 0.8 };

  return (
    <group position={[0, 0.4, 0]}>
      {/* Torso & Chest Interaction Zone */}
      <group ref={chestRef}>
        <mesh
          onPointerOver={(e) => { e.stopPropagation(); setHovered('CHEST'); }}
          onPointerOut={() => setHovered(null)}
          onClick={(e) => { e.stopPropagation(); onAssess('CHEST'); }}
          castShadow
        >
          <boxGeometry args={[1.0, 0.5, 1.4]} />
          <meshStandardMaterial {...gownMat} transparent opacity={0.9} color={hovered === 'CHEST' ? '#bfdbfe' : '#93c5fd'} />
        </mesh>

        {/* Specialized Hotspots - Hidden but interactive */}
        {/* Fundus (OB) */}
        <mesh
          position={[0, 0.3, -0.4]}
          onPointerOver={(e) => { e.stopPropagation(); setHovered('OB_FUNDUS'); }}
          onPointerOut={() => setHovered(null)}
          onClick={(e) => { e.stopPropagation(); onAssess('OB_FUNDUS'); }}
        >
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="red" transparent opacity={hovered === 'OB_FUNDUS' ? 0.3 : 0} />
        </mesh>

        {/* Pericardium (Cardiology) */}
        <mesh
          position={[0, 0.3, 0.2]}
          onPointerOver={(e) => { e.stopPropagation(); setHovered('HEART_SITE'); }}
          onPointerOut={() => setHovered(null)}
          onClick={(e) => { e.stopPropagation(); onAssess('HEART_SITE'); }}
        >
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="pink" transparent opacity={hovered === 'HEART_SITE' ? 0.3 : 0} />
        </mesh>
      </group>

      {/* Head & Airway Interaction Zone */}
      <group
        position={[0, 0.15, 1.1]}
        onPointerOver={() => setHovered('HEAD')}
        onPointerOut={() => setHovered(null)}
        onClick={() => onAssess('HEAD')}
      >
        <mesh castShadow>
          <sphereGeometry args={[0.22, 32, 32]} />
          <meshStandardMaterial {...skinMat} color={hovered === 'HEAD' ? '#ffe4e6' : '#f3c1ad'} />
        </mesh>
        {/* Face details */}
        <mesh position={[0, -0.05, 0.2]}>
          <boxGeometry args={[0.03, 0.06, 0.03]} />
          <meshStandardMaterial {...skinMat} />
        </mesh>
      </group>

      {/* Arms & IV Access Sites */}
      <group position={[-0.7, 0, 0.3]} rotation={[0, 0.1, -0.1]}>
         <mesh castShadow onClick={() => onAssess('LEFT_ARM')}>
            <capsuleGeometry args={[0.1, 1.0, 4, 16]} />
            <meshStandardMaterial {...skinMat} color={hovered === 'LEFT_ARM' ? '#ffe4e6' : '#f3c1ad'} />
         </mesh>
      </group>
      <group position={[0.7, 0, 0.3]} rotation={[0, -0.1, 0.1]}>
         <mesh castShadow onClick={() => onAssess('RIGHT_ARM')}>
            <capsuleGeometry args={[0.1, 1.0, 4, 16]} />
            <meshStandardMaterial {...skinMat} color={hovered === 'RIGHT_ARM' ? '#ffe4e6' : '#f3c1ad'} />
         </mesh>
      </group>

      {/* Legs */}
      <group position={[-0.3, -0.05, -1.5]}>
         <mesh castShadow>
            <capsuleGeometry args={[0.15, 1.5, 4, 16]} />
            <meshStandardMaterial color="#1e293b" />
         </mesh>
      </group>
      <group position={[0.3, -0.05, -1.5]}>
         <mesh castShadow>
            <capsuleGeometry args={[0.15, 1.5, 4, 16]} />
            <meshStandardMaterial color="#1e293b" />
         </mesh>
      </group>

      {/* Interaction Labels */}
      {hovered && (
        <Html position={[0, 0.8, 0]} center>
          <div className="bg-medical-dark/90 text-medical-cyan px-3 py-1 rounded-full border border-medical-cyan/50 text-[10px] font-black uppercase tracking-widest whitespace-nowrap backdrop-blur-md">
            ASSESS {hovered}
          </div>
        </Html>
      )}
    </group>
  );
};

const TeamMemberModel = ({ position, name, role, color, onClick }: any) => {
    const [hovered, setHovered] = useState(false);

    return (
        <group
            position={position}
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
        >
            <Cylinder args={[0.3, 0.4, 1.7]} position={[0, 0.85, 0]}>
                <meshStandardMaterial color={hovered ? '#60a5fa' : color} />
            </Cylinder>
            <Sphere args={[0.25]} position={[0, 1.9, 0]}>
                <meshStandardMaterial color="#f3c1ad" />
            </Sphere>
            <Html position={[0, 2.3, 0]} center>
                <div className="bg-black/80 px-2 py-0.5 rounded border border-white/20 text-[8px] font-black text-white whitespace-nowrap uppercase tracking-widest">
                    {role}: {name}
                </div>
            </Html>
            {hovered && (
                <Html position={[0, 0.5, 0]} center>
                    <div className="bg-medical-cyan text-medical-dark px-2 py-1 rounded text-[10px] font-bold whitespace-nowrap uppercase shadow-lg">
                        ASSIGN TASK
                    </div>
                </Html>
            )}
        </group>
    );
};

export const MedicalRoom = ({
    onEquipmentClick,
    onTeamClick
}: {
    onEquipmentClick: (type: string) => void,
    onTeamClick: (memberId: string) => void
}) => {
  const { environment, team } = useStore();

  return (
    <>
      <ambientLight intensity={environment === 'AMBULANCE' ? 0.2 : 0.3} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow shadow-mapSize={[2048, 2048]} />
      <pointLight position={[-3, 2, -2]} color={environment === 'ER' ? "#ff3d00" : "#0ea5e9"} intensity={2} />

      <group position={[0, -0.01, 0]}>
        <Plane args={[100, 100]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <meshStandardMaterial color={environment === 'AMBULANCE' ? "#1e1b4b" : "#020617"} roughness={0.1} metalness={0.8} />
        </Plane>
        <Grid infiniteGrid fadeDistance={40} cellColor="#1e293b" sectionColor={environment === 'ER' ? "#dc2626" : "#334155"} />
      </group>

      {/* Team Members */}
      <TeamMemberModel
        position={[-1.5, 0, 1.5]}
        role="NURSE"
        name={team[0].name}
        color="#1e40af"
        onClick={() => onTeamClick(team[0].id)}
      />
      <TeamMemberModel
        position={[1.5, 0, 1.5]}
        role="RT"
        name={team[1].name}
        color="#15803d"
        onClick={() => onTeamClick(team[1].id)}
      />

      {/* Ambulance Walls */}
      {environment === 'AMBULANCE' && (
        <group>
            <Box args={[6, 3, 0.2]} position={[0, 1.5, -3]}>
                <meshStandardMaterial color="#334155" />
            </Box>
            <Box args={[0.2, 3, 8]} position={[-3, 1.5, 0]}>
                <meshStandardMaterial color="#334155" />
            </Box>
            <Box args={[0.2, 3, 8]} position={[3, 1.5, 0]}>
                <meshStandardMaterial color="#334155" />
            </Box>
        </group>
      )}

      {/* Hospital Bed - More High Fidelity */}
      <group position={[0, 0, -0.5]}>
        <Box args={[1.6, 0.2, 4.0]} position={[0, 0.4, 0]} castShadow receiveShadow>
            <meshStandardMaterial color="#f8fafc" />
        </Box>
        <Box args={[1.7, 0.1, 4.2]} position={[0, 0.25, 0]} castShadow>
            <meshStandardMaterial color="#64748b" metalness={1} roughness={0.2} />
        </Box>
        {/* Rails */}
        <Box args={[0.05, 0.4, 3.0]} position={[0.8, 0.6, 0]}>
             <meshStandardMaterial color="#94a3b8" metalness={1} />
        </Box>
        <Box args={[0.05, 0.4, 3.0]} position={[-0.8, 0.6, 0]}>
             <meshStandardMaterial color="#94a3b8" metalness={1} />
        </Box>
      </group>

      {/* Advanced Defibrillator Unit */}
      <group position={[-1.8, 0, -0.5]} onClick={() => onEquipmentClick('DEFIBRILLATOR')}>
          <Box args={[0.6, 1.2, 0.6]} position={[0, 0.6, 0]} castShadow>
              <meshStandardMaterial color="#f1f5f9" />
          </Box>
          <Box args={[0.5, 0.4, 0.4]} position={[0, 1.4, 0]} castShadow>
              <meshStandardMaterial color="#fbbf24" />
          </Box>
          {/* Screen */}
          <Box args={[0.4, 0.25, 0.01]} position={[0, 1.4, 0.21]}>
              <meshStandardMaterial color="#000" emissive="#4ade80" emissiveIntensity={0.2} />
          </Box>
      </group>

      {/* IV Infusion Pump */}
      <group position={[1.5, 0, 0.8]}>
          <Cylinder args={[0.03, 0.03, 2.5]} position={[0, 1.25, 0]} castShadow>
              <meshStandardMaterial color="#cbd5e1" metalness={1} />
          </Cylinder>
          <Box args={[0.2, 0.4, 0.2]} position={[0, 1.8, 0]} onClick={() => onEquipmentClick('IV_PUMP')}>
              <meshStandardMaterial color="#e2e8f0" />
          </Box>
      </group>

      {/* Ventilator Cart */}
      <group position={[1.8, 0, -1.0]} onClick={() => onEquipmentClick('VENTILATOR')}>
          <Box args={[0.6, 1.1, 0.6]} position={[0, 0.55, 0]} castShadow>
              <meshStandardMaterial color="#e2e8f0" />
          </Box>
          <Box args={[0.5, 0.5, 0.3]} position={[0, 1.4, 0]} castShadow>
              <meshStandardMaterial color="#334155" />
          </Box>
          <Box args={[0.4, 0.3, 0.01]} position={[0, 1.4, 0.16]}>
              <meshStandardMaterial color="#000" emissive="#00e5ff" emissiveIntensity={0.5} />
          </Box>
      </group>
    </>
  );
};
