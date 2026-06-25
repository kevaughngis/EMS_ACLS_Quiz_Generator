import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, Sphere } from '@react-three/drei';

const HeartModel = () => {
  return (
    <group scale={2}>
      {/* Simple representative heart model for study mode */}
      <Sphere args={[0.5, 32, 32]}>
        <meshStandardMaterial color="#ff1744" roughness={0.3} />
      </Sphere>
      <group position={[0.4, 0.4, 0]}>
        <Sphere args={[0.2, 32, 32]}>
            <meshStandardMaterial color="#0066cc" />
        </Sphere>
      </group>
    </group>
  );
};

const AnatomyLesson = ({ title, description, onClose }: any) => {
  return (
    <div className="fixed inset-0 z-50 bg-medical-dark/95 flex p-8">
      <div className="w-1/2 h-full">
        <Canvas shadows>
            <Stage environment="city" intensity={0.5}>
                <HeartModel />
            </Stage>
            <OrbitControls autoRotate />
        </Canvas>
      </div>
      <div className="w-1/2 p-12 flex flex-col justify-center">
        <h2 className="text-4xl font-bold text-medical-cyan mb-6">{title}</h2>
        <div className="text-xl text-white/80 leading-relaxed mb-8">
          {description}
        </div>
        <button
          onClick={onClose}
          className="self-start px-8 py-3 bg-medical-cyan text-medical-dark font-bold rounded-lg"
        >
          BACK TO SIMULATOR
        </button>
      </div>
    </div>
  );
};

export default AnatomyLesson;
