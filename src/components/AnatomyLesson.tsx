import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, Sphere, Cylinder, Torus } from '@react-three/drei';

const HeartModel = () => {
  return (
    <group scale={2}>
      {/* Right Atrium */}
      <Sphere args={[0.35, 32, 32]} position={[-0.3, 0.2, 0]}>
        <meshStandardMaterial color="#3355ff" roughness={0.4} />
      </Sphere>
      {/* Left Atrium */}
      <Sphere args={[0.3, 32, 32]} position={[0.3, 0.3, -0.1]}>
        <meshStandardMaterial color="#ff4444" roughness={0.4} />
      </Sphere>

      {/* Left Ventricle (The main pump) */}
      <Sphere args={[0.5, 32, 32]} position={[0.2, -0.2, 0]} scale={[1, 1.4, 1]}>
        <meshStandardMaterial color="#ff1744" roughness={0.3} metalness={0.1} />
      </Sphere>

      {/* Right Ventricle */}
      <Sphere args={[0.4, 32, 32]} position={[-0.2, -0.1, 0.1]} scale={[1, 1.2, 0.8]}>
        <meshStandardMaterial color="#dd2c00" roughness={0.4} />
      </Sphere>

      {/* Aorta */}
      <group position={[0.1, 0.5, -0.2]} rotation={[0, 0, -0.2]}>
        <Torus args={[0.3, 0.1, 16, 32, Math.PI]} rotation={[Math.PI/2, 0, 0]}>
            <meshStandardMaterial color="#ff5252" />
        </Torus>
        <Cylinder args={[0.1, 0.1, 0.8]} position={[0.3, -0.4, 0]}>
             <meshStandardMaterial color="#ff5252" />
        </Cylinder>
      </group>

      {/* Vena Cava */}
      <Cylinder args={[0.08, 0.08, 1]} position={[-0.5, 0.4, 0]}>
        <meshStandardMaterial color="#448aff" />
      </Cylinder>
    </group>
  );
};

const AnatomyLesson = ({ title, description, onBack }: { title: string, description: string, onBack: () => void }) => {
  return (
    <div className="fixed inset-0 z-50 bg-medical-dark/95 flex p-8 animate-in fade-in zoom-in duration-300">
      <div className="w-1/2 h-full">
        <Canvas shadows camera={{ position: [0, 0, 5], fov: 45 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <Stage environment="hospital" intensity={0.6}>
                <HeartModel />
            </Stage>
            <OrbitControls autoRotate autoRotateSpeed={0.5} enableZoom={false} />
        </Canvas>
      </div>
      <div className="w-1/2 p-12 flex flex-col justify-center">
        <h2 className="text-5xl font-bold text-medical-cyan mb-8 tracking-tight">{title}</h2>
        <div className="text-2xl text-white/90 leading-relaxed mb-12 font-light">
          {description}
        </div>
        <button
          onClick={onBack}
          className="self-start px-12 py-4 bg-medical-cyan text-medical-dark font-black rounded-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(0,242,255,0.3)] uppercase tracking-widest"
        >
          BACK TO SIMULATOR
        </button>
      </div>
    </div>
  );
};

export default AnatomyLesson;
