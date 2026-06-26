import { Suspense, useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { PatientModel, MedicalRoom } from './Scene';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';

interface SimulationViewProps {
  onAssess: (part: string) => void;
}

const SimulationView: React.FC<SimulationViewProps> = ({ onAssess }) => {
  const applyAction = useStore((state) => state.applyAction);
  const { team, assignTeamTask, secondaryPatientState, activePatientIndex } = useStore();
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [view, setView] = useState<'STANDARD' | 'AIRWAY' | 'SIDE'>('STANDARD');

  return (
    <div className="w-full h-full absolute inset-0 z-0 bg-[#0a192f]">
      <Canvas shadows gl={{ antialias: true, stencil: true }}>
        <CameraController view={view} />
        <OrbitControls
          makeDefault
          enablePan={false}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.05}
          minDistance={2}
          maxDistance={12}
        />

        <Suspense fallback={null}>
          <group position={activePatientIndex === 1 ? [-2, 0, 0] : [0, 0, 0]}>
            <PatientModel onAssess={onAssess} />
          </group>
          {secondaryPatientState && (
            <group position={activePatientIndex === 0 ? [2, 0, 0] : [0, 0, 0]}>
               <PatientModel onAssess={onAssess} />
            </group>
          )}
          <MedicalRoom
            onEquipmentClick={(type) => applyAction(`INTERACT_${type}`)}
            onTeamClick={(id) => setSelectedMember(id)}
          />
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
        <ambientLight intensity={0.5} />
      </Canvas>

      {/* Camera Switcher */}
      <div className="absolute bottom-24 right-6 flex flex-col gap-2 z-[60]">
        <ViewBtn active={view === 'STANDARD'} label="Standard" onClick={() => setView('STANDARD')} />
        <ViewBtn active={view === 'AIRWAY'} label="Airway" onClick={() => setView('AIRWAY')} />
        <ViewBtn active={view === 'SIDE'} label="Side" onClick={() => setView('SIDE')} />
      </div>

      <AnimatePresence>
        {selectedMember && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900/95 border border-blue-500/30 p-6 rounded-2xl backdrop-blur-xl z-[70] min-w-[300px] shadow-2xl"
          >
             <div className="text-xs font-black text-blue-400 uppercase tracking-widest mb-4 border-b border-blue-500/20 pb-2">
                Delegate Task: {team.find(m => m.id === selectedMember)?.role}
             </div>
             <div className="grid grid-cols-1 gap-2">
                <TaskButton
                  label="Establish 2nd IV"
                  onClick={() => { assignTeamTask(selectedMember!, 'ESTABLISHING IV'); setSelectedMember(null); }}
                />
                <TaskButton
                  label="Check Blood Pressure"
                  onClick={() => { assignTeamTask(selectedMember!, 'CHECKING BP'); setSelectedMember(null); }}
                />
                <TaskButton
                  label="Prepare Epinephrine"
                  onClick={() => { assignTeamTask(selectedMember!, 'PREPARING EPI'); setSelectedMember(null); }}
                />
                <TaskButton
                  label="Check Pulse"
                  onClick={() => { assignTeamTask(selectedMember!, 'CHECKING PULSE'); setSelectedMember(null); }}
                />
             </div>
             <button
               onClick={() => setSelectedMember(null)}
               className="w-full mt-4 py-2 text-[10px] font-bold text-white/40 hover:text-white transition-colors uppercase tracking-widest"
             >
               Cancel
             </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CameraController = ({ view }: { view: string }) => {
  const { activePatientIndex } = useStore();
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);

  const targets = {
    STANDARD: { pos: [5, 4, 6], lookAt: [0, 0, 0] },
    AIRWAY: { pos: [0, 1.5, 2.5], lookAt: [0, 0.4, 1.1] },
    SIDE: { pos: [-3, 2, 0], lookAt: [0, 0, 0] }
  };

  useFrame((state) => {
    const target = targets[view as keyof typeof targets];
    const patientOffset = activePatientIndex === 1 ? -2 : 0;

    state.camera.position.lerp(new THREE.Vector3(target.pos[0] + patientOffset, target.pos[1], target.pos[2]), 0.05);
    // Smoothly focus on the patient
    const lookAtPos = new THREE.Vector3(target.lookAt[0] + patientOffset, target.lookAt[1], target.lookAt[2]);
    state.camera.lookAt(lookAtPos);
  });

  return <PerspectiveCamera makeDefault ref={cameraRef} fov={45} />;
};

const ViewBtn = ({ label, onClick, active }: any) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${active ? 'bg-medical-cyan text-medical-dark border-medical-cyan' : 'bg-black/40 text-white/40 border-white/10 hover:border-white/20'}`}
  >
    {label}
  </button>
);

const TaskButton = ({ label, onClick }: any) => (
    <button
        onClick={onClick}
        className="w-full py-3 px-4 bg-white/5 border border-white/10 rounded-xl text-left text-xs font-bold text-white/80 hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all"
    >
        {label}
    </button>
);

export default SimulationView;
