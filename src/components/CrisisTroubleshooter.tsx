import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Wrench, Zap, Wind, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const CrisisTroubleshooter: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { activeCrisis } = useStore();
  const [fixing, setFixing] = useState(false);
  const [progress, setProgress] = useState(0);

  if (!activeCrisis) return null;

  const handleFix = () => {
    setFixing(true);
  };

  useEffect(() => {
    let interval: any;
    if (fixing) {
      interval = setInterval(() => {
        setProgress(p => {
            if (p >= 100) {
                clearInterval(interval);
                return 100;
            }
            return p + 2;
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [fixing]);

  return (
    <div className="fixed inset-0 bg-red-950/90 z-[160] flex items-center justify-center p-12 backdrop-blur-md">
      <div className="bg-medical-dark border-4 border-medical-yellow/20 rounded-[3rem] w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col">

        <div className="p-12 bg-white/5 border-b border-white/5 flex items-center gap-6">
           <div className="p-4 bg-medical-yellow/20 rounded-2xl animate-pulse">
              <AlertTriangle className="text-medical-yellow w-8 h-8" />
           </div>
           <div>
              <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">Equipment <span className="text-medical-yellow">Failure</span></h2>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Technical Troubleshooting Required</p>
           </div>
        </div>

        <div className="flex-1 p-16 flex flex-col items-center justify-center text-center gap-12">
           <div className="space-y-4">
              <div className="text-2xl font-black text-white uppercase italic">{activeCrisis.label}</div>
              <p className="text-slate-400 max-w-md mx-auto leading-relaxed">{activeCrisis.description}</p>
           </div>

           <div className="w-full max-w-md">
              {progress >= 100 ? (
                 <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-medical-green/10 border border-medical-green/40 p-8 rounded-3xl flex flex-col items-center gap-4">
                    <CheckCircle2 size={48} className="text-medical-green" />
                    <div className="text-sm font-black text-medical-green uppercase">System Operational</div>
                    <button onClick={onClose} className="mt-4 px-12 py-4 bg-medical-green text-medical-dark font-black rounded-xl uppercase tracking-widest text-[10px]">Resume Mission</button>
                 </motion.div>
              ) : (
                 <div className="space-y-8">
                    <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/5">
                       <motion.div className="h-full bg-medical-yellow" style={{ width: `${progress}%` }} />
                    </div>

                    <button
                      onMouseDown={handleFix}
                      onMouseUp={() => setFixing(false)}
                      onMouseLeave={() => setFixing(false)}
                      className={`px-16 py-8 rounded-3xl font-black uppercase tracking-[0.2em] transition-all flex items-center gap-4 mx-auto ${fixing ? 'bg-medical-yellow text-medical-dark scale-95' : 'bg-white/5 text-medical-yellow border-2 border-medical-yellow/40 hover:bg-medical-yellow/10'}`}
                    >
                       <Wrench size={24} /> Hold to Repair
                    </button>
                 </div>
              )}
           </div>
        </div>

      </div>
    </div>
  );
};
