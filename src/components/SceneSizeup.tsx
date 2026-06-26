import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, ShieldAlert, MapPin, ClipboardList, CheckCircle2, UserCheck } from 'lucide-react';

export const SceneSizeup: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { scenario, speak } = useStore();
  const [phase, setPhase] = useState<'DISPATCH' | 'SIZEUP'>('DISPATCH');

  useEffect(() => {
    if (phase === 'DISPATCH' && scenario) {
        speak(`Unit 12, respond to ${scenario.title}. Reports of an unresponsive patient.`, 'SYSTEM');
    }
  }, [phase, scenario, speak]);
  const [checks, setChecks] = useState<string[]>([]);

  const sizeupSteps = [
    { id: 'bsi', label: 'BSI / Scene Safety', icon: <ShieldAlert className="text-medical-yellow" /> },
    { id: 'moi', label: 'MOI / NOI Determination', icon: <MapPin className="text-medical-cyan" /> },
    { id: 'patients', label: 'Number of Patients', icon: <UserCheck className="text-medical-green" /> },
    { id: 'als', label: 'Additional Resources (ALS)', icon: <Radio className="text-medical-blue" /> },
  ];

  const toggleCheck = (id: string) => {
    const step = sizeupSteps.find(s => s.id === id);
    if (checks.includes(id)) {
        setChecks(prev => prev.filter(c => c !== id));
    } else {
        setChecks(prev => [...prev, id]);
        if (step) speak(`${step.label} checked and secure.`);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950 z-[200] flex flex-col items-center justify-center p-12 overflow-hidden font-mono">
      <AnimatePresence mode="wait">
         {phase === 'DISPATCH' ? (
            <motion.div
               key="dispatch"
               initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }}
               className="w-full max-w-4xl text-center space-y-12"
            >
               <div className="inline-block p-6 bg-white/5 border border-white/10 rounded-full animate-pulse">
                  <Radio size={48} className="text-medical-cyan" />
               </div>
               <div className="space-y-4">
                  <div className="text-xs font-black text-medical-cyan uppercase tracking-[0.5em]">Emergency Dispatch Transmitting</div>
                  <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter leading-tight">
                     "Unit 12, respond to {scenario?.title}. <br/> Reports of an unresponsive patient. Time out {new Date().toLocaleTimeString()}."
                  </h2>
               </div>
               <button
                 onClick={() => setPhase('SIZEUP')}
                 className="px-16 py-6 bg-medical-cyan text-medical-dark font-black rounded-3xl hover:scale-105 active:scale-95 transition-all uppercase tracking-[0.2em] shadow-[0_0_50px_rgba(0,229,255,0.3)]"
               >
                  Arrive On Scene
               </button>
            </motion.div>
         ) : (
            <motion.div
               key="sizeup"
               initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
               className="w-full max-w-5xl space-y-12"
            >
               <div className="text-center space-y-4">
                  <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter italic">Scene <span className="text-medical-yellow">Size-up</span></h3>
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Verify all critical safety parameters before patient contact</p>
               </div>

               <div className="grid grid-cols-2 gap-6">
                  {sizeupSteps.map(step => (
                     <button
                       key={step.id}
                       onClick={() => toggleCheck(step.id)}
                       className={`p-8 rounded-[2.5rem] border-2 transition-all flex items-center gap-8 ${checks.includes(step.id) ? 'bg-medical-yellow/10 border-medical-yellow text-medical-yellow' : 'bg-white/5 border-white/5 text-white/40 hover:border-white/10'}`}
                     >
                        <div className={`p-4 rounded-2xl ${checks.includes(step.id) ? 'bg-medical-yellow/20' : 'bg-white/5'}`}>
                           {step.icon}
                        </div>
                        <div className="flex-1 text-left">
                           <div className="text-lg font-black uppercase italic tracking-tight">{step.label}</div>
                           <div className="text-[8px] font-bold opacity-50 uppercase mt-1 tracking-widest">{checks.includes(step.id) ? 'Verified' : 'Pending Check'}</div>
                        </div>
                        {checks.includes(step.id) && <CheckCircle2 size={24} />}
                     </button>
                  ))}
               </div>

               <div className="pt-8 flex justify-center">
                  <button
                    onClick={onComplete}
                    disabled={checks.length < 4}
                    className="px-24 py-8 bg-white text-medical-dark font-black rounded-3xl hover:bg-medical-yellow transition-all uppercase tracking-[0.3em] shadow-2xl disabled:opacity-20 disabled:grayscale"
                  >
                     Patient Contact
                  </button>
               </div>
            </motion.div>
         )}
      </AnimatePresence>

      <div className="absolute top-10 left-12 flex gap-4">
         <div className="w-1.5 h-1.5 rounded-full bg-medical-red animate-ping"></div>
         <div className="text-[10px] font-black text-white opacity-20 uppercase tracking-widest italic">Live Operations Link: SECURE</div>
      </div>
    </div>
  );
};
