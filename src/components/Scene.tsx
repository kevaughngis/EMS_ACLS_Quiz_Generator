import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Plane, Grid, Cylinder, Box, Html, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../store/useStore';

interface PatientModelProps {
  onAssess: (part: string) => void;
}

export const PatientModel: React.FC<PatientModelProps> = ({ onAssess }) => {
  const { patientState, activePatientIndex, secondaryPatientState, scenario, floatingEvents } = useStore();
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
      {/* Eyes - Dynamic blinking and state-based dilation */}
      <group position={[0, 0.15, 1.1]}>
         {/* L Eye */}
         <mesh position={[-0.08, 0.05, 0.18]}>
            <sphereGeometry args={[0.02, 16, 16]} />
            <meshStandardMaterial color="white" />
            <mesh position={[0, 0, 0.015]}>
                <sphereGeometry args={[0.01, 8, 8]} />
                <meshStandardMaterial color="#3e2723" />
            </mesh>
         </mesh>
         {/* R Eye */}
         <mesh position={[0.08, 0.05, 0.18]}>
            <sphereGeometry args={[0.02, 16, 16]} />
            <meshStandardMaterial color="white" />
            <mesh position={[0, 0, 0.015]}>
                <sphereGeometry args={[0.01, 8, 8]} />
                <meshStandardMaterial color="#3e2723" />
            </mesh>
         </mesh>
      </group>

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

      {/* Pulse Points */}
      <PulsePoint position={[-0.15, 0.1, 1.15]} label="CAROTID PULSE" onAssess={() => onAssess('CAROTID_PULSE')} />
      <PulsePoint position={[0.7, -0.1, -0.1]} label="RADIAL PULSE" onAssess={() => onAssess('RADIAL_PULSE')} />

      {/* Patient Monitor Cables / Leads */}
      <group position={[-0.4, 0.3, 0.6]}>
          <Cylinder args={[0.01, 0.01, 0.05]} position={[0, 0, 0]}>
              <meshStandardMaterial color="#fff" />
          </Cylinder>
          <Cylinder args={[0.01, 0.01, 0.05]} position={[0.1, 0.05, 0]}>
              <meshStandardMaterial color="#ef4444" />
          </Cylinder>
          <Cylinder args={[0.01, 0.01, 0.05]} position={[0.2, 0, 0]}>
              <meshStandardMaterial color="#22c55e" />
          </Cylinder>
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

      {/* Pelvis & Detailed Gown */}
      <mesh position={[0, -0.1, -0.6]} castShadow>
          <boxGeometry args={[0.9, 0.4, 0.5]} />
          <meshStandardMaterial {...gownMat} />
      </mesh>

      {/* Detailed Legs with Articulated Look */}
      <group position={[-0.3, -0.05, -1.5]}>
         {/* Thigh */}
         <group position={[0, 0.05, 0.5]}>
            <mesh castShadow>
               <capsuleGeometry args={[0.16, 0.7, 4, 16]} />
               <meshStandardMaterial color="#1e293b" />
            </mesh>
         </group>
         {/* Knee Joint */}
         <mesh position={[0, 0.05, 0.1]}>
             <sphereGeometry args={[0.14, 16, 16]} />
             <meshStandardMaterial color="#0f172a" />
         </mesh>
         {/* Lower Leg */}
         <group position={[0, 0.05, -0.4]} rotation={[0.1, 0, 0]}>
            <mesh castShadow>
               <capsuleGeometry args={[0.14, 0.7, 4, 16]} />
               <meshStandardMaterial color="#1e293b" />
            </mesh>
         </group>
      </group>

      <group position={[0.3, -0.05, -1.5]}>
         {/* Thigh */}
         <group position={[0, 0.05, 0.5]}>
            <mesh castShadow>
               <capsuleGeometry args={[0.16, 0.7, 4, 16]} />
               <meshStandardMaterial color="#1e293b" />
            </mesh>
         </group>
         {/* Knee Joint */}
         <mesh position={[0, 0.05, 0.1]}>
             <sphereGeometry args={[0.14, 16, 16]} />
             <meshStandardMaterial color="#0f172a" />
         </mesh>
         {/* Lower Leg */}
         <group position={[0, 0.05, -0.4]} rotation={[0.1, 0, 0]}>
            <mesh castShadow>
               <capsuleGeometry args={[0.14, 0.7, 4, 16]} />
               <meshStandardMaterial color="#1e293b" />
            </mesh>
         </group>
      </group>

      {/* Interaction Labels */}
      {hovered && (
        <Html position={[0, 0.8, 0]} center>
          <div className="bg-medical-dark/90 text-medical-cyan px-3 py-1 rounded-full border border-medical-cyan/50 text-[10px] font-black uppercase tracking-widest whitespace-nowrap backdrop-blur-md">
            ASSESS {hovered}
          </div>
        </Html>
      )}

      {/* Floating Events */}
      {floatingEvents.map(event => (
        <FloatingEvent key={event.id} text={event.text} />
      ))}
    </group>
  );
};

const FloatingEvent = ({ text }: { text: string }) => {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (ref.current) {
        ref.current.position.y += 0.01;
        ref.current.position.z += Math.sin(state.clock.elapsedTime * 5) * 0.002;
    }
  });

  return (
    <group ref={ref} position={[0, 1.2, 0]}>
        <Html center>
            <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.2 }}
                className="bg-medical-cyan/20 border border-medical-cyan/50 px-4 py-2 rounded-xl backdrop-blur-md text-white font-black text-xs whitespace-nowrap uppercase italic tracking-tighter"
            >
                {text}
            </motion.div>
        </Html>
    </group>
  );
};

const PulsePoint = ({ position, label, onAssess }: any) => {
    const [hovered, setHovered] = useState(false);

    return (
        <mesh
            position={position}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
            onClick={(e) => { e.stopPropagation(); onAssess(); }}
        >
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial
                color={hovered ? "#ff3d00" : "#ffffff"}
                transparent
                opacity={hovered ? 0.8 : 0.2}
                emissive={hovered ? "#ff3d00" : "#000000"}
                emissiveIntensity={2}
            />
            {hovered && (
                <Html center position={[0, 0.1, 0]}>
                    <div className="bg-medical-red text-white px-2 py-0.5 rounded text-[8px] font-black whitespace-nowrap uppercase tracking-widest shadow-lg">
                        {label}
                    </div>
                </Html>
            )}
        </mesh>
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
  const { environment, team, theme } = useStore();

  const getLightColor = () => {
    if (theme === 'TACTICAL') return "#22c55e";
    if (theme === 'EMERGENCY') return "#ef4444";
    return environment === 'ER' ? "#ff3d00" : "#0ea5e9";
  };

  return (
    <>
      <ambientLight intensity={theme === 'TACTICAL' ? 0.05 : environment === 'AMBULANCE' ? 0.2 : 0.3} />
      <directionalLight position={[5, 10, 5]} intensity={theme === 'TACTICAL' ? 0.5 : 1.5} castShadow shadow-mapSize={[2048, 2048]} />
      <pointLight position={[-3, 2, -2]} color={getLightColor()} intensity={theme === 'TACTICAL' ? 5 : 2} />

      <group position={[0, -0.01, 0]}>
        <Plane args={[100, 100]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <meshStandardMaterial
            color={theme === 'TACTICAL' ? '#064e3b' : environment === 'AMBULANCE' ? "#1e1b4b" : "#020617"}
            roughness={0.1}
            metalness={0.8}
          />
        </Plane>
        <Grid
            infiniteGrid
            fadeDistance={40}
            cellColor={theme === 'TACTICAL' ? '#065f46' : "#1e293b"}
            sectionColor={theme === 'TACTICAL' ? '#10b981' : theme === 'EMERGENCY' ? '#b91c1c' : environment === 'ER' ? "#dc2626" : "#334155"}
        />
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

      {/* High-Fidelity Hospital Bed */}
      <group position={[0, 0, -0.5]}>
        {/* Mattress */}
        <Box args={[1.6, 0.25, 4.0]} position={[0, 0.6, 0]} castShadow receiveShadow>
            <meshStandardMaterial color="#f8fafc" roughness={0.8} />
        </Box>
        {/* Bed Base / Frame */}
        <Box args={[1.7, 0.15, 4.2]} position={[0, 0.45, 0]} castShadow>
            <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.2} />
        </Box>
        {/* Under-frame Mechanics */}
        <Box args={[1.2, 0.4, 3.0]} position={[0, 0.2, 0]}>
            <meshStandardMaterial color="#334155" metalness={0.9} />
        </Box>
        {/* Casters / Wheels */}
        {[[-0.7, 0.1, 1.8], [0.7, 0.1, 1.8], [-0.7, 0.1, -1.8], [0.7, 0.1, -1.8]].map((pos, i) => (
            <group key={i} position={pos as [number, number, number]}>
                <Cylinder args={[0.12, 0.12, 0.05]} rotation={[0, 0, Math.PI/2]}>
                    <meshStandardMaterial color="#1e293b" />
                </Cylinder>
            </group>
        ))}
        {/* Side Rails (Articulated Look) */}
        {[0.82, -0.82].map((x, i) => (
            <group key={i} position={[x, 0.7, 0.2]}>
                <Box args={[0.03, 0.4, 1.8]} radius={0.02}>
                    <meshStandardMaterial color="#94a3b8" metalness={1} />
                </Box>
                <Box args={[0.03, 0.4, 1.0]} position={[0, 0, -1.5]} radius={0.02}>
                    <meshStandardMaterial color="#94a3b8" metalness={1} />
                </Box>
            </group>
        ))}
        {/* Headboard */}
        <Box args={[1.7, 0.6, 0.1]} position={[0, 0.8, 2.05]}>
            <meshStandardMaterial color="#cbd5e1" roughness={0.5} />
        </Box>
        {/* Footboard */}
        <Box args={[1.7, 0.4, 0.1]} position={[0, 0.7, -2.05]}>
            <meshStandardMaterial color="#cbd5e1" roughness={0.5} />
        </Box>
      </group>

      {/* High-Fidelity Defibrillator Unit */}
      <group position={[-1.8, 0, -0.5]} onClick={() => onEquipmentClick('DEFIBRILLATOR')}>
          {/* Main Body */}
          <Box args={[0.7, 1.3, 0.7]} position={[0, 0.65, 0]} castShadow>
              <meshStandardMaterial color="#f8fafc" roughness={0.4} />
          </Box>
          {/* Interface Head */}
          <Box args={[0.6, 0.5, 0.5]} position={[0, 1.45, 0]} castShadow>
              <meshStandardMaterial color="#fbbf24" roughness={0.2} />
          </Box>
          {/* Screen Bezel */}
          <Box args={[0.5, 0.35, 0.05]} position={[0, 1.45, 0.23]}>
              <meshStandardMaterial color="#1e293b" />
          </Box>
          {/* Active Display */}
          <Box args={[0.45, 0.3, 0.01]} position={[0, 1.45, 0.26]}>
              <meshStandardMaterial color="#000" emissive="#4ade80" emissiveIntensity={0.6} />
          </Box>
          {/* Control Knobs */}
          <group position={[0.2, 1.3, 0.26]}>
              <Cylinder args={[0.04, 0.04, 0.05]} rotation={[Math.PI/2, 0, 0]}>
                  <meshStandardMaterial color="#ef4444" />
              </Cylinder>
          </group>
          {/* Paddles / Cables (Simplified) */}
          <Box args={[0.15, 0.15, 0.1]} position={[-0.35, 1.45, 0.1]}>
              <meshStandardMaterial color="#334155" />
          </Box>
          <Box args={[0.15, 0.15, 0.1]} position={[0.35, 1.45, 0.1]}>
              <meshStandardMaterial color="#334155" />
          </Box>
      </group>

      {/* High-Fidelity IV Infusion Pump System */}
      <group position={[1.5, 0, 0.8]}>
          <Cylinder args={[0.03, 0.03, 2.5]} position={[0, 1.25, 0]} castShadow>
              <meshStandardMaterial color="#cbd5e1" metalness={1} />
          </Cylinder>
          <group position={[0, 1.6, 0]} onClick={() => onEquipmentClick('IV_PUMP')}>
              {/* Pump Housing */}
              <Box args={[0.25, 0.5, 0.25]}>
                  <meshStandardMaterial color="#f8fafc" />
              </Box>
              {/* Pump Display */}
              <Box args={[0.18, 0.12, 0.01]} position={[0, 0.1, 0.13]}>
                  <meshStandardMaterial color="#000" emissive="#0ea5e9" emissiveIntensity={0.4} />
              </Box>
              {/* Dial/Control */}
              <Cylinder args={[0.04, 0.04, 0.03]} position={[0, -0.1, 0.13]} rotation={[Math.PI/2, 0, 0]}>
                  <meshStandardMaterial color="#64748b" />
              </Cylinder>
          </group>
          {/* IV Bag Hanging */}
          <group position={[0.1, 2.2, 0]}>
              <Box args={[0.15, 0.3, 0.05]} radius={0.05}>
                  <meshStandardMaterial color="#fff" transparent opacity={0.4} />
              </Box>
              <Cylinder args={[0.01, 0.01, 0.2]} position={[0, -0.2, 0]}>
                  <meshStandardMaterial color="#fff" />
              </Cylinder>
          </group>
      </group>

      {/* High-Fidelity Ventilator Station */}
      <group position={[1.8, 0, -1.0]} onClick={() => onEquipmentClick('VENTILATOR')}>
          {/* Base / Pedestal */}
          <Cylinder args={[0.35, 0.4, 0.2]} position={[0, 0.1, 0]}>
              <meshStandardMaterial color="#1e293b" metalness={0.8} />
          </Cylinder>
          <Cylinder args={[0.05, 0.05, 1.2]} position={[0, 0.7, 0]}>
              <meshStandardMaterial color="#94a3b8" metalness={1} />
          </Cylinder>
          {/* Main Unit Body */}
          <Box args={[0.6, 0.6, 0.6]} position={[0, 1.4, 0]} castShadow>
              <meshStandardMaterial color="#f1f5f9" />
          </Box>
          {/* Tilted Screen Interface */}
          <group position={[0, 1.6, 0.2]} rotation={[-Math.PI / 8, 0, 0]}>
              <Box args={[0.5, 0.4, 0.05]}>
                  <meshStandardMaterial color="#334155" />
              </Box>
              <Box args={[0.45, 0.35, 0.01]} position={[0, 0, 0.03]}>
                  <meshStandardMaterial color="#000" emissive="#00e5ff" emissiveIntensity={0.8} />
              </Box>
          </group>
          {/* Humidifier / Exhalation Block */}
          <Box args={[0.3, 0.3, 0.2]} position={[0, 1.0, 0.2]}>
              <meshStandardMaterial color="#cbd5e1" transparent opacity={0.6} />
          </Box>
      </group>
    </>
  );
};
