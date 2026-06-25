import { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import { PatientModel, MedicalRoom } from './Scene';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';

interface SimulationViewProps {
  onAssess: (part: string) => void;
}

const SimulationView: React.FC<SimulationViewProps> = ({ onAssess }) => {
  const applyAction = useStore((state) => state.applyAction);
  const { team, assignTeamTask } = useStore();
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

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
      </Canvas>

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

const TaskButton = ({ label, onClick }: any) => (
    <button
        onClick={onClick}
        className="w-full py-3 px-4 bg-white/5 border border-white/10 rounded-xl text-left text-xs font-bold text-white/80 hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all"
    >
        {label}
    </button>
);

export default SimulationView;
