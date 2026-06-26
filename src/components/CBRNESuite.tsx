import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Droplet, Wind, Zap, Skull, CheckCircle2, AlertTriangle, RefreshCcw } from 'lucide-react';

export const CBRNESuite: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { applyAction, logs } = useStore();
  const [deconLevel, setDeconLevel] = useState(0);

  const handleDecon = () => {
    setDeconLevel(prev => Math.min(100, prev + 25));
    if (deconLevel + 25 >= 100) applyAction('DECON_COMPLETE');
  };

  return (
    <div className="fixed inset-0 bg-medical-dark/95 z-[150] flex items-center justify-center p-8 backdrop-blur-3xl">
      <div className="bg-medical-dark border border-white/10 rounded-[3rem] w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col h-[80vh]">

        <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/5">
           <div className="flex items-center gap-6">
              <div className="p-4 bg-medical-yellow/20 rounded-2xl">
                 <ShieldAlert className="text-medical-yellow w-8 h-8" />
              </div>
              <div>
                 <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">HAZMAT <span className="text-medical-yellow">CBRNE</span> Operations</h2>
                 <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Counter-Terrorism & Industrial Incident Response</p>
              </div>
           </div>
           <button onClick={onClose} className="px-8 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10">Return</button>
        </div>

        <div className="flex-1 p-12 grid grid-cols-12 gap-12 overflow-y-auto">

           <div className="col-span-5 space-y-8">
              <div className="bg-black/40 p-8 rounded-3xl border border-white/5 space-y-8">
                 <div className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <RefreshCcw size={14} className="text-medical-yellow" /> Decontamination Status
                 </div>
                 <div className="relative h-4 bg-white/5 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-medical-yellow" animate={{ width: `${deconLevel}%` }} />
                 </div>
                 <div className="flex justify-between items-end">
                    <div className="text-5xl font-black font-mono text-white italic">{deconLevel}%</div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{deconLevel < 100 ? 'IN PROGRESS' : 'SECURE'}</div>
                 </div>
                 <button onClick={handleDecon} className="w-full py-4 bg-medical-yellow text-medical-dark font-black rounded-xl uppercase tracking-widest text-[10px]">Perform Scrub Phase</button>
              </div>

              <div className="bg-medical-red/5 p-8 rounded-3xl border border-medical-red/20 space-y-4">
                 <div className="flex items-center gap-3 text-medical-red">
                    <Skull size={20} />
                    <span className="text-sm font-black uppercase italic">Nerve Agent Exposure</span>
                 </div>
                 <p className="text-xs text-slate-400 leading-relaxed italic">"SLUDGEM" Protocol active: Salivation, Lacrimation, Urination, Defecation, GI Upset, Emesis, Miosis.</p>
              </div>
           </div>

           <div className="col-span-7 grid grid-cols-2 gap-6 content-start">
              <CBRNEAction
                icon={<Zap className="text-medical-blue" />}
                label="Mark I Kit"
                detail="Atropine / 2-PAM"
                onClick={() => { applyAction('ATROPINE_CBRNE'); applyAction('PRALIDOXIME_2PAM'); }}
              />
              <CBRNEAction
                icon={<Wind className="text-medical-cyan" />}
                label="Suctioning"
                detail="Manage Secretions"
                onClick={() => applyAction('SUCTION')}
              />
              <CBRNEAction
                icon={<AlertTriangle className="text-medical-yellow" />}
                label="Valium"
                detail="Seizure Control"
                onClick={() => applyAction('MIDAZOLAM')}
              />
              <CBRNEAction
                icon={<Droplet className="text-medical-red" />}
                label="Cyanokit"
                detail="Hydroxocobalamin"
                onClick={() => applyAction('CYANOKIT')}
              />
           </div>

        </div>

      </div>
    </div>
  );
};

const CBRNEAction = ({ icon, label, detail, onClick }: any) => (
   <button
     onClick={onClick}
     className="p-8 bg-white/5 hover:bg-white/10 border border-white/10 rounded-3xl transition-all text-left flex flex-col gap-3 group"
   >
      <div className="p-3 bg-white/5 rounded-xl self-start group-hover:scale-110 transition-transform">
         {icon}
      </div>
      <div>
         <div className="text-lg font-black text-white uppercase italic leading-tight">{label}</div>
         <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">{detail}</div>
      </div>
   </button>
);
