import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Plane, Grid, Cylinder, Box, Html, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../store/useStore';

interface PatientModelProps {
  onAssess: (part: string) => void;
}

export const PatientModel: React.FC<PatientModelProps> = ({ onAssess }) => {
  const [hovered, setHovered] = useState<string | null>(null);
  const chestRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (chestRef.current) {
      const t = state.clock.getElapsedTime();
      const breathScale = 1 + Math.sin(t * 1.5) * 0.02;
      chestRef.current.scale.set(1, breathScale, 1);
    }
  });

  const skinMat = { color: "#f3c1ad", roughness: 0.3 };
  const gownMat = { color: "#93c5fd", roughness: 0.8 };

  return (
    <group position={[0, 0.4, 0]}>
      {/* Torso & Chest Interaction Zone */}
      <group ref={chestRef}>
        <mesh
          onPointerOver={() => setHovered('CHEST')}
          onPointerOut={() => setHovered(null)}
          onClick={() => onAssess('CHEST')}
          castShadow
        >
          <boxGeometry args={[1.0, 0.5, 1.4]} />
          <meshStandardMaterial {...gownMat} color={hovered === 'CHEST' ? '#bfdbfe' : '#93c5fd'} />
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

const TeamMemberModel = ({ position, name, role, color }: any) => (
    <group position={position}>
        <Cylinder args={[0.3, 0.4, 1.7]} position={[0, 0.85, 0]}>
            <meshStandardMaterial color={color} />
        </Cylinder>
        <Sphere args={[0.25]} position={[0, 1.9, 0]}>
            <meshStandardMaterial color="#f3c1ad" />
        </Sphere>
        <Html position={[0, 2.3, 0]} center>
            <div className="bg-black/80 px-2 py-0.5 rounded border border-white/20 text-[8px] font-black text-white whitespace-nowrap uppercase tracking-widest">
                {role}: {name}
            </div>
        </Html>
    </group>
);

export const MedicalRoom = ({ onEquipmentClick }: { onEquipmentClick: (type: string) => void }) => {
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
      <TeamMemberModel position={[-1.5, 0, 1.5]} role="NURSE" name={team[0].name} color="#1e40af" />
      <TeamMemberModel position={[1.5, 0, 1.5]} role="RT" name={team[1].name} color="#15803d" />

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
    </>
  );
};
