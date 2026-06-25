import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Baby, Activity, AlertCircle, ShieldAlert, Heart, Droplets } from 'lucide-react';

export const MaternalSuite: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { applyAction, logs, patientState } = useStore();
  const [massageActive, setMassageActive] = useState(false);
  const [tone, setTone] = useState(60);

  // Mock tone tracking for UI feedback
  useEffect(() => {
    const interval = setInterval(() => {
        setTone(prev => Math.max(20, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleMassage = () => {
    setMassageActive(true);
    setTone(prev => Math.min(100, prev + 10));
    applyAction('FUNDAL_MASSAGE');
    setTimeout(() => setMassageActive(false), 500);
  };

  return (
    <div className="fixed inset-0 bg-medical-dark/95 z-[150] flex items-center justify-center p-8 backdrop-blur-2xl">
      <div className="bg-medical-dark border border-white/10 rounded-[3rem] w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col h-[80vh]">

        <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/5">
           <div className="flex items-center gap-6">
              <div className="p-4 bg-medical-red/20 rounded-2xl">
                 <Baby className="text-medical-red w-8 h-8" />
              </div>
              <div>
                 <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">Obstetric <span className="text-medical-red">Crisis</span> Suite</h2>
                 <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">High-Stakes Maternal Simulation</p>
              </div>
           </div>
           <button onClick={onClose} className="px-8 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10">Return to Mission</button>
        </div>

        <div className="flex-1 p-12 grid grid-cols-12 gap-12 overflow-y-auto">

           <div className="col-span-4 space-y-8">
              <div className="bg-black/40 p-8 rounded-3xl border border-white/5 space-y-6">
                 <div className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Activity size={14} className="text-medical-red" /> Uterine Tone
                 </div>
                 <div className="relative h-4 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full ${tone < 40 ? 'bg-medical-red' : 'bg-medical-green'}`}
                      animate={{ width: `${tone}%` }}
                    />
                 </div>
                 <div className="flex justify-between items-end">
                    <div className="text-5xl font-black font-mono text-white italic">{tone}%</div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{tone < 40 ? 'BOGGY' : 'FIRM'}</div>
                 </div>
              </div>

              <div className="bg-medical-red/5 p-8 rounded-3xl border border-medical-red/20 space-y-4">
                 <div className="flex items-center gap-3 text-medical-red">
                    <Droplets size={20} />
                    <span className="text-sm font-black uppercase italic">Active Hemorrhage</span>
                 </div>
                 <p className="text-xs text-slate-400 leading-relaxed">PPH detected. Uterine atony is the suspected cause. Immediate intervention required to prevent hypovolemic shock.</p>
              </div>
           </div>

           <div className="col-span-8 space-y-8">
              <div className="grid grid-cols-2 gap-6">
                 <button
                   onClick={handleMassage}
                   className={`h-40 rounded-3xl border-2 transition-all flex flex-col items-center justify-center gap-4 relative overflow-hidden group ${massageActive ? 'bg-medical-red border-white scale-95' : 'bg-white/5 border-white/10 hover:border-medical-red/40'}`}
                 >
                    <div className="p-3 bg-white/5 rounded-xl group-hover:scale-110 transition-transform">
                       <Heart className={massageActive ? 'text-white' : 'text-medical-red'} />
                    </div>
                    <span className={`text-xs font-black uppercase tracking-widest ${massageActive ? 'text-white' : 'text-slate-400'}`}>Perform Fundal Massage</span>
                 </button>

                 <button
                   onClick={() => applyAction('OXYTOCIN')}
                   className="h-40 rounded-3xl border-2 border-white/10 bg-white/5 hover:border-medical-blue/40 transition-all flex flex-col items-center justify-center gap-4 group"
                 >
                    <div className="p-3 bg-medical-blue/20 rounded-xl group-hover:scale-110 transition-transform">
                       <Droplets className="text-medical-blue" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">Administer Oxytocin</span>
                 </button>

                 <button
                   onClick={() => applyAction('MAGNESIUM_SULFATE')}
                   className="h-40 rounded-3xl border-2 border-white/10 bg-white/5 hover:border-medical-yellow/40 transition-all flex flex-col items-center justify-center gap-4 group"
                 >
                    <div className="p-3 bg-medical-yellow/20 rounded-xl group-hover:scale-110 transition-transform">
                       <ShieldAlert className="text-medical-yellow" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">Start Mag Sulfate</span>
                 </button>

                 <button
                   onClick={() => applyAction('TXA')}
                   className="h-40 rounded-3xl border-2 border-white/10 bg-white/5 hover:border-medical-red/40 transition-all flex flex-col items-center justify-center gap-4 group"
                 >
                    <div className="p-3 bg-medical-red/20 rounded-xl group-hover:scale-110 transition-transform">
                       <AlertCircle className="text-medical-red" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">Administer TXA</span>
                 </button>
              </div>

              <div className="bg-white/5 rounded-3xl p-8 border border-white/5 h-64 overflow-y-auto space-y-3">
                 <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Obstetric Event Log</div>
                 {logs.filter(l => l.includes('FUNDAL') || l.includes('OXYTOCIN') || l.includes('MAGNESIUM') || l.includes('PPH')).map((log, i) => (
                    <div key={i} className="text-xs font-bold text-slate-300 flex items-center gap-3">
                       <div className="w-1 h-1 rounded-full bg-medical-red" />
                       {log}
                    </div>
                 ))}
              </div>
           </div>

        </div>

      </div>
    </div>
  );
};
