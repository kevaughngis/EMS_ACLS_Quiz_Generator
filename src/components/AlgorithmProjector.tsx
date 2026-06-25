import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, ArrowRight, CheckCircle2, Circle, AlertCircle } from 'lucide-react';

interface Step {
  id: string;
  text: string;
  type: 'decision' | 'action' | 'rhythm';
  next?: string[];
  active?: boolean;
}

const ALGORITHMS: Record<string, Step[]> = {
  'VF_VT': [
    { id: '1', text: 'Start CPR - Give Oxygen - Attach Monitor/Defib', type: 'action', next: ['2'] },
    { id: '2', text: 'Check Rhythm: Shockable?', type: 'decision', next: ['3', '4'] },
    { id: '3', text: 'Shock - Resume CPR 2 min - IV/IO Access', type: 'action', next: ['2'] },
    { id: '4', text: 'PEA/Asystole -> Go to PEA branch', type: 'action' }
  ],
  'PEA_ASYSTOLE': [
    { id: '1', text: 'Epinephrine ASAP - CPR 2 min - IV/IO', type: 'action', next: ['2'] },
    { id: '2', text: 'Check Rhythm: Shockable?', type: 'decision', next: ['3', '4'] },
    { id: '3', text: 'Go to VF/pVT branch', type: 'action' },
    { id: '4', text: 'Resume CPR 2 min - Treat Reversible Causes', type: 'action', next: ['2'] }
  ],
  'BRADYCARDIA': [
    { id: '1', text: 'Identify/Treat Underlying Cause', type: 'action', next: ['2'] },
    { id: '2', text: 'Persistent Bradyarrhythmia causing symptoms?', type: 'decision', next: ['3', '4'] },
    { id: '3', text: 'Atropine - Transcutaneous Pacing - Dopamine/Epi', type: 'action' },
    { id: '4', text: 'Monitor and Observe', type: 'action' }
  ],
  'TACHYCARDIA': [
    { id: '1', text: 'Identify/Treat Underlying Cause', type: 'action', next: ['2'] },
    { id: '2', text: 'Persistent Tachyarrhythmia causing symptoms?', type: 'decision', next: ['3', '4'] },
    { id: '3', text: 'Synchronized Cardioversion - Adenosine', type: 'action' },
    { id: '4', text: 'Vagal Maneuvers - Adenosine - Beta Blockers', type: 'action' }
  ]
};

export const AlgorithmProjector: React.FC = () => {
  const { logs, patientState } = useStore();
  const [activeAlgo, setActiveAlgo] = useState<'VF_VT' | 'PEA_ASYSTOLE' | 'BRADYCARDIA' | 'TACHYCARDIA'>('VF_VT');
  const [currentStepId, setCurrentStepId] = useState('1');

  // Logic to auto-advance based on rhythm or logs
  useEffect(() => {
     if (!patientState) return;

     const hr = patientState.vitals.hr;
     const rhythm = patientState.rhythm;

     if (hr === 0) {
        if ((rhythm === 'VF' || rhythm === 'VT') && activeAlgo !== 'VF_VT') {
            setActiveAlgo('VF_VT');
            setCurrentStepId('1');
        } else if (rhythm !== 'VF' && rhythm !== 'VT' && activeAlgo !== 'PEA_ASYSTOLE') {
            setActiveAlgo('PEA_ASYSTOLE');
            setCurrentStepId('1');
        }
     } else if (hr < 50 && activeAlgo !== 'BRADYCARDIA') {
        setActiveAlgo('BRADYCARDIA');
        setCurrentStepId('1');
     } else if (hr > 150 && activeAlgo !== 'TACHYCARDIA') {
        setActiveAlgo('TACHYCARDIA');
        setCurrentStepId('1');
     }

     // Advanced logic to detect logs and move steps
     const lastAction = logs[logs.length - 1];
     if (lastAction?.includes('DEFIBRILLATE')) {
        setCurrentStepId('3');
     } else if (lastAction?.includes('EPINEPHRINE')) {
        setCurrentStepId('1');
     }
  }, [patientState, logs]);

  return (
    <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[50] pointer-events-none">
       <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-3 bg-medical-dark/80 backdrop-blur-md border-b-2 border-medical-blue p-4 rounded-t-3xl shadow-2xl">
             <div className="p-2 bg-medical-blue/20 rounded-xl">
                <Network className="text-medical-blue w-5 h-5" />
             </div>
             <span className="text-xs font-black text-white uppercase tracking-[0.3em]">Live Algorithm <span className="text-medical-blue">Tracker</span></span>
          </div>

          <div className="flex gap-4 items-start">
             {ALGORITHMS[activeAlgo].map((step, idx) => {
                const isActive = step.id === currentStepId;
                const isPassed = parseInt(step.id) < parseInt(currentStepId);

                return (
                   <React.Fragment key={step.id}>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`w-48 p-4 rounded-2xl border-2 transition-all ${
                          isActive
                            ? 'bg-medical-blue border-white shadow-[0_0_30px_rgba(56,189,248,0.5)] scale-110'
                            : isPassed
                               ? 'bg-medical-dark/60 border-medical-green/40 opacity-40'
                               : 'bg-medical-dark/80 border-white/10 opacity-60'
                        }`}
                      >
                         <div className="flex justify-between items-start mb-2">
                            <span className={`text-[8px] font-black uppercase ${isActive ? 'text-medical-dark' : 'text-slate-500'}`}>Step {step.id}</span>
                            {isActive && <div className="w-2 h-2 rounded-full bg-white animate-pulse" />}
                            {isPassed && <CheckCircle2 size={12} className="text-medical-green" />}
                         </div>
                         <p className={`text-[10px] font-bold leading-tight ${isActive ? 'text-medical-dark' : 'text-slate-300'}`}>
                            {step.text}
                         </p>
                      </motion.div>
                      {idx < ALGORITHMS[activeAlgo].length - 1 && (
                         <div className="pt-8 opacity-20">
                            <ArrowRight size={16} className="text-white" />
                         </div>
                      )}
                   </React.Fragment>
                );
             })}
          </div>

          <div className="bg-medical-dark/80 backdrop-blur px-6 py-2 rounded-full border border-white/5 flex gap-8">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-medical-yellow" />
                <span className="text-[9px] font-black text-slate-400 uppercase">H&T Evaluation Required</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-medical-blue" />
                <span className="text-[9px] font-black text-slate-400 uppercase">Next Pulse Check: 1:45</span>
             </div>
          </div>
       </div>
    </div>
  );
};
