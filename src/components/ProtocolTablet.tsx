import React, { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';
import { Tablet, ChevronRight, CheckCircle2, Circle, AlertCircle } from 'lucide-react';

export const ProtocolTablet: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { scenario, logs } = useStore();

  const steps = useMemo(() => {
    if (scenario?.protocol === 'ACLS') {
      return [
        { id: 1, label: 'Unresponsive / Pulse Check', match: 'ASSESS_CHEST', completed: logs.some(l => l.includes('ASSESS_CHEST')) },
        { id: 2, label: 'Start CPR / Oxygen', match: 'CPR_COMPRESSION', completed: logs.some(l => l.includes('CPR_COMPRESSION')) },
        { id: 3, label: 'Rhythm Check / Shock?', match: 'DEFIBRILLATION', completed: logs.some(l => l.includes('DEFIBRILLATION')) },
        { id: 4, label: 'Epinephrine 1mg Q3-5min', match: 'EPINEPHRINE', completed: logs.some(l => l.includes('EPINEPHRINE')) },
        { id: 5, label: 'Advanced Airway', match: 'INTUBATE_SUCCESS', completed: logs.some(l => l.includes('INTUBATE_SUCCESS')) },
        { id: 6, label: 'Consider Reversible Causes', match: 'CONSULT', completed: logs.some(l => l.includes('CONSULT')) },
      ];
    }
    return [
        { id: 1, label: 'Initial Assessment', match: 'ASSESS', completed: true },
        { id: 2, label: 'Stabilization Branch', match: '', completed: false },
    ];
  }, [scenario, logs]);

  const activeStepIdx = steps.findIndex(s => !s.completed);

  return (
    <div className="fixed bottom-32 right-96 z-[120] w-[400px] h-[600px] bg-slate-900 border-8 border-slate-950 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col font-sans">
      <div className="bg-medical-dark p-6 border-b border-white/5 flex justify-between items-center">
         <div className="flex items-center gap-2 text-medical-cyan">
            <Tablet size={16}/>
            <span className="text-[10px] font-black uppercase tracking-widest italic">Protocol <span className="opacity-50">Companion</span></span>
         </div>
         <button onClick={onClose} className="text-slate-500 hover:text-white">✕</button>
      </div>

      <div className="flex-1 bg-black/20 p-8 space-y-4 overflow-y-auto scrollbar-thin">
         <div className="mb-6">
            <div className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Active Algorithm</div>
            <div className="text-xl font-black text-white italic uppercase">{scenario?.protocol} Algorithm</div>
         </div>

         {steps.map((step, i) => (
            <motion.div
              key={step.id}
              initial={false}
              animate={{
                  opacity: i === activeStepIdx ? 1 : (step.completed ? 0.6 : 0.3),
                  scale: i === activeStepIdx ? 1.02 : 1
              }}
              className={`p-5 rounded-2xl border transition-all flex items-center gap-4 ${i === activeStepIdx ? 'bg-medical-cyan/10 border-medical-cyan shadow-lg shadow-medical-cyan/10' : 'bg-white/5 border-white/5'}`}
            >
               <div className={`${step.completed ? 'text-medical-green' : (i === activeStepIdx ? 'text-medical-cyan animate-pulse' : 'text-slate-700')}`}>
                  {step.completed ? <CheckCircle2 size={18}/> : <Circle size={18}/>}
               </div>
               <div className="flex-1">
                  <div className={`text-[10px] font-black uppercase tracking-tight ${step.completed ? 'text-medical-green/60' : 'text-white'}`}>{step.label}</div>
                  {i === activeStepIdx && <div className="text-[8px] font-bold text-medical-cyan uppercase mt-1">Next Priority</div>}
               </div>
               {i === activeStepIdx && <ChevronRight size={14} className="text-medical-cyan" />}
            </motion.div>
         ))}

         {activeStepIdx === -1 && (
            <div className="bg-medical-green/10 border border-medical-green/20 p-6 rounded-2xl text-center">
                <CheckCircle2 className="text-medical-green mx-auto mb-2" />
                <div className="text-[10px] font-black text-medical-green uppercase">Algorithm Cycle Complete</div>
            </div>
         )}
      </div>

      <div className="p-6 bg-medical-dark border-t border-white/5 text-[8px] font-bold text-slate-500 uppercase tracking-widest text-center">
         AI-Guided Logic Engine v1.0
      </div>
    </div>
  );
};
