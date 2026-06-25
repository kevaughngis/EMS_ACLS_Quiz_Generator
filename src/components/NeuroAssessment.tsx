import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Eye, MessageCircle, Move, ChevronRight, CheckCircle2 } from 'lucide-react';

export const NeuroAssessment: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { applyAction } = useStore();
  const [mode, setMode] = useState<'GCS' | 'NIHSS'>('GCS');

  const [gcs, setGcs] = useState({ eyes: 0, verbal: 0, motor: 0 });
  const [completed, setCompleted] = useState(false);

  const calculateGCS = () => {
    const total = gcs.eyes + gcs.verbal + gcs.motor;
    return total || '---';
  };

  const handleFinish = () => {
    applyAction(`NEURO_SCORE_${mode}_${calculateGCS()}`);
    setCompleted(true);
    setTimeout(onClose, 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/98 z-[120] flex items-center justify-center p-12 backdrop-blur-3xl">
      <div className="bg-[#0a0f1d] border border-white/10 rounded-[3rem] w-full max-w-5xl h-[80vh] flex flex-col overflow-hidden shadow-2xl">

        <div className="p-12 bg-white/5 border-b border-white/5 flex justify-between items-end">
           <div>
              <div className="flex items-center gap-3 text-medical-blue font-black uppercase tracking-widest text-[10px] mb-2">
                 <Brain size={14} /> Clinical Neurology
              </div>
              <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">Neuro <span className="text-medical-blue">Assessment</span></h2>
           </div>
           <div className="flex gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/5">
              <button onClick={() => setMode('GCS')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'GCS' ? 'bg-medical-blue text-white shadow-lg' : 'text-white/40 hover:text-white'}`}>GCS</button>
              <button onClick={() => setMode('NIHSS')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'NIHSS' ? 'bg-medical-blue text-white shadow-lg' : 'text-white/40 hover:text-white'}`}>NIHSS</button>
           </div>
        </div>

        <div className="flex-1 p-16 flex gap-12 overflow-hidden">

           <div className="flex-1 space-y-12">
              <AnimatePresence mode="wait">
                 {mode === 'GCS' ? (
                    <motion.div key="gcs" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
                       <GCSCategory label="Eye Opening" icon={<Eye/>} value={gcs.eyes} max={4}
                         options={['No response', 'To pain', 'To speech', 'Spontaneous']}
                         onChange={(v) => setGcs({...gcs, eyes: v})}
                       />
                       <GCSCategory label="Verbal Response" icon={<MessageCircle/>} value={gcs.verbal} max={5}
                         options={['No response', 'Incomprehensible', 'Inappropriate', 'Confused', 'Oriented']}
                         onChange={(v) => setGcs({...gcs, verbal: v})}
                       />
                       <GCSCategory label="Motor Response" icon={<Move/>} value={gcs.motor} max={6}
                         options={['No response', 'Extension', 'Flexion', 'Withdraws', 'Localizes', 'Obeys']}
                         onChange={(v) => setGcs({...gcs, motor: v})}
                       />
                    </motion.div>
                 ) : (
                    <motion.div key="nihss" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col items-center justify-center h-full text-center">
                       <div className="p-12 bg-white/5 rounded-[3rem] border border-white/5">
                          <Brain size={48} className="text-medical-blue mx-auto mb-6" />
                          <h3 className="text-xl font-black text-white uppercase italic mb-4">NIH Stroke Scale</h3>
                          <p className="text-slate-500 max-w-sm mb-8">Perform cranial nerve exam and motor assessment via the 3D interaction layer.</p>
                          <button className="px-10 py-4 bg-medical-blue text-white font-black rounded-2xl hover:scale-105 transition-transform uppercase tracking-widest text-[10px]">Begin NIHSS Protocol</button>
                       </div>
                    </motion.div>
                 )}
              </AnimatePresence>
           </div>

           <div className="w-80 flex flex-col">
              <div className="bg-medical-blue/10 border border-medical-blue/20 rounded-[2.5rem] p-10 flex-1 flex flex-col items-center justify-center text-center">
                 <div className="text-[10px] font-black text-medical-blue uppercase tracking-[0.2em] mb-4">Total GCS Score</div>
                 <div className="text-9xl font-black text-white tabular-nums drop-shadow-[0_0_30px_rgba(0,102,204,0.3)]">{calculateGCS()}</div>
                 <div className="mt-8 text-xs font-bold text-slate-400 uppercase italic">
                    {calculateGCS() <= 8 ? "Severe: Intubation Suggested" : (calculateGCS() <= 12 ? "Moderate Impairment" : "Mild/Minor Impairment")}
                 </div>
              </div>

              <div className="mt-8">
                 {completed ? (
                    <div className="bg-medical-green/20 border border-medical-green/40 py-5 rounded-2xl flex items-center justify-center gap-3 text-medical-green font-black uppercase text-xs">
                       Assessment Logged <CheckCircle2 size={16}/>
                    </div>
                 ) : (
                    <button
                      onClick={handleFinish}
                      className="w-full py-6 bg-white text-medical-dark font-black rounded-3xl hover:bg-medical-blue hover:text-white transition-all uppercase tracking-widest text-xs shadow-xl active:scale-95"
                    >
                       Confirm Scoring
                    </button>
                 )}
              </div>
           </div>

        </div>
      </div>
    </div>
  );
};

const GCSCategory = ({ label, icon, value, max, options, onChange }: any) => (
  <div className="space-y-4">
     <div className="flex items-center gap-3">
        <div className="text-medical-blue">{icon}</div>
        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{label}</span>
     </div>
     <div className="flex gap-2">
        {options.map((opt: string, i: number) => (
           <button
             key={opt}
             onClick={() => onChange(i + 1)}
             className={`flex-1 py-3 px-4 rounded-xl text-[8px] font-black uppercase tracking-tighter transition-all border ${value === i+1 ? 'bg-medical-blue border-medical-blue text-white shadow-lg' : 'bg-white/5 border-white/5 text-white/30 hover:border-white/20'}`}
           >
              {opt}
           </button>
        ))}
     </div>
  </div>
);
