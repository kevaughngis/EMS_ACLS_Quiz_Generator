import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import { PatientModel, MedicalRoom } from './Scene';
import { useStore } from '../store/useStore';

interface SimulationViewProps {
  onAssess: (part: string) => void;
}

const SimulationView: React.FC<SimulationViewProps> = ({ onAssess }) => {
  const applyAction = useStore((state) => state.applyAction);

  return (
    <div className="w-full h-full absolute inset-0 z-0 bg-[#0a192f]">
      <Canvas shadows gl={{ antialias: true }}>
        <PerspectiveCamera makeDefault position={[5, 4, 6]} fov={45} />
        <OrbitControls
          enablePan={false}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.05}
          minDistance={4}
          maxDistance={12}
          autoRotate={false}
        />

        <Suspense fallback={null}>
          <PatientModel onAssess={onAssess} />
          <MedicalRoom onEquipmentClick={(type) => applyAction(`INTERACT_${type}`)} />
          <ContactShadows
            position={[0, -0.01, 0]}
            opacity={0.6}
            scale={12}
            blur={2.5}
            far={10}
            resolution={512}
            color="#000000"
          />
          <Environment preset="night" />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default SimulationView;
