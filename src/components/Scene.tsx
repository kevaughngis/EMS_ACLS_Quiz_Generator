import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Plane, Grid } from '@react-three/drei';
import * as THREE from 'three';

interface PatientModelProps {
  onAssess: (part: string) => void;
}

export const PatientModel: React.FC<PatientModelProps> = ({ onAssess }) => {
  const bodyRef = useRef<THREE.Group>(null);
  const chestRef = useRef<THREE.Mesh>(null);

  // Subtle breathing animation
  useFrame((state) => {
    if (chestRef.current) {
      const t = state.clock.getElapsedTime();
      // Only "breathe" if not in cardiac arrest (simulated by checking if we should be breathing)
      // For now, keep it simple and just do a very subtle movement
      const breathScale = 1 + Math.sin(t * 1.2) * 0.015;
      chestRef.current.scale.set(1, breathScale, 1);
    }
  });

  const skinMaterial = <meshStandardMaterial color="#e5c1a1" roughness={0.4} metalness={0.1} />;
  const gownMaterial = <meshStandardMaterial color="#7dd3fc" roughness={0.8} />;
  const pantsMaterial = <meshStandardMaterial color="#334155" roughness={0.9} />;

  return (
    <group ref={bodyRef}>
      {/* Torso / Chest */}
      <mesh
        ref={chestRef}
        position={[0, 0.45, 0.1]}
        onClick={(e) => { e.stopPropagation(); onAssess('CHEST'); }}
        castShadow
      >
        <boxGeometry args={[1.1, 0.5, 1.6]} />
        {gownMaterial}
      </mesh>

      {/* Head */}
      <group position={[0, 0.6, 1.2]} onClick={(e) => { e.stopPropagation(); onAssess('HEAD'); }}>
        <mesh castShadow>
            <sphereGeometry args={[0.24, 32, 32]} />
            {skinMaterial}
        </mesh>
        {/* Simple Nose for orientation */}
        <mesh position={[0, 0, 0.22]}>
            <boxGeometry args={[0.04, 0.08, 0.04]} />
            {skinMaterial}
        </mesh>
      </group>

      {/* Arms */}
      <mesh position={[-0.75, 0.4, 0.2]} rotation={[0, 0.05, -0.1]} castShadow>
        <boxGeometry args={[0.25, 0.25, 1.4]} />
        {skinMaterial}
      </mesh>
      <mesh position={[0.75, 0.4, 0.2]} rotation={[0, -0.05, 0.1]} castShadow>
        <boxGeometry args={[0.25, 0.25, 1.4]} />
        {skinMaterial}
      </mesh>

      {/* Hands */}
      <mesh position={[-0.8, 0.35, 1.0]} castShadow>
          <sphereGeometry args={[0.1, 16, 16]} />
          {skinMaterial}
      </mesh>
      <mesh position={[0.8, 0.35, 1.0]} castShadow>
          <sphereGeometry args={[0.1, 16, 16]} />
          {skinMaterial}
      </mesh>

      {/* Legs */}
      <mesh position={[-0.3, 0.35, -1.6]} rotation={[0.05, 0, 0]} castShadow>
        <boxGeometry args={[0.35, 0.35, 1.8]} />
        {pantsMaterial}
      </mesh>
      <mesh position={[0.3, 0.35, -1.6]} rotation={[0.05, 0, 0]} castShadow>
        <boxGeometry args={[0.35, 0.35, 1.8]} />
        {pantsMaterial}
      </mesh>

      {/* Feet */}
      <mesh position={[-0.3, 0.3, -2.5]} castShadow>
          <boxGeometry args={[0.2, 0.25, 0.4]} />
          {skinMaterial}
      </mesh>
      <mesh position={[0.3, 0.3, -2.5]} castShadow>
          <boxGeometry args={[0.2, 0.25, 0.4]} />
          {skinMaterial}
      </mesh>
    </group>
  );
};

export const MedicalRoom = ({ onEquipmentClick }: { onEquipmentClick: (type: string) => void }) => {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={1} castShadow />
      <spotLight position={[-5, 8, 2]} angle={0.3} penumbra={1} intensity={1.5} castShadow />

      {/* Floor with Grid */}
      <group position={[0, -0.01, 0]}>
        <Plane args={[50, 50]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <meshStandardMaterial color="#1a202c" />
        </Plane>
        <Grid
            infiniteGrid
            fadeDistance={30}
            cellColor="#2d3748"
            sectionColor="#4a5568"
            cellSize={1}
            sectionSize={5}
        />
      </group>

      {/* Hospital Bed */}
      <group position={[0, 0.05, 0]}>
        {/* Mattress */}
        <mesh position={[0, 0.2, -0.5]} receiveShadow castShadow>
            <boxGeometry args={[1.8, 0.3, 4.2]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.9} />
        </mesh>
        {/* Frame */}
        <mesh position={[0, 0, -0.5]} receiveShadow castShadow>
            <boxGeometry args={[1.9, 0.15, 4.4]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Wheels */}
        {[[-0.8, -0.1, 1.5], [0.8, -0.1, 1.5], [-0.8, -0.1, -2.5], [0.8, -0.1, -2.5]].map((pos, i) => (
            <mesh key={i} position={pos as [number, number, number]} rotation={[0, 0, Math.PI/2]}>
                <cylinderGeometry args={[0.1, 0.1, 0.1, 16]} />
                <meshStandardMaterial color="#1e293b" />
            </mesh>
        ))}
      </group>

      {/* IV Pole */}
      <group position={[1.5, 0, 1]}>
          <mesh position={[0, 1.2, 0]} castShadow>
              <cylinderGeometry args={[0.03, 0.03, 2.4]} />
              <meshStandardMaterial color="#cbd5e1" metalness={1} roughness={0.1} />
          </mesh>
          <mesh position={[0, 2.2, 0]} rotation={[Math.PI/2, 0, 0]}>
              <torusGeometry args={[0.2, 0.01, 16, 32]} />
              <meshStandardMaterial color="#cbd5e1" />
          </mesh>
      </group>

      {/* Monitor Station */}
      <group position={[-1.8, 0, 1.2]}>
          <mesh position={[0, 1.0, 0]} castShadow>
              <cylinderGeometry args={[0.04, 0.04, 2.0]} />
              <meshStandardMaterial color="#475569" metalness={0.5} />
          </mesh>
          <mesh
            position={[0.2, 1.8, 0]}
            rotation={[0, Math.PI/6, 0]}
            onClick={(e) => { e.stopPropagation(); onEquipmentClick('MONITOR'); }}
            castShadow
          >
            <boxGeometry args={[0.9, 0.7, 0.1]} />
            <meshStandardMaterial color="#0f172a" emissive="#0ea5e9" emissiveIntensity={0.5} />
          </mesh>
      </group>

      {/* Defibrillator Cart */}
      <group position={[-1.4, 0, -0.5]}>
          <mesh position={[0, 0.4, 0]} castShadow>
              <boxGeometry args={[0.6, 0.8, 0.6]} />
              <meshStandardMaterial color="#f1f5f9" />
          </mesh>
          <mesh
            position={[0, 0.9, 0]}
            onClick={(e) => { e.stopPropagation(); onEquipmentClick('DEFIBRILLATOR'); }}
            castShadow
          >
            <boxGeometry args={[0.45, 0.35, 0.4]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.2} roughness={0.5} />
          </mesh>
          {/* Paddles */}
          <mesh position={[0.15, 1.05, 0.1]} castShadow>
              <boxGeometry args={[0.1, 0.1, 0.1]} />
              <meshStandardMaterial color="#1e293b" />
          </mesh>
          <mesh position={[-0.15, 1.05, 0.1]} castShadow>
              <boxGeometry args={[0.1, 0.1, 0.1]} />
              <meshStandardMaterial color="#1e293b" />
          </mesh>
      </group>
    </>
  );
};
