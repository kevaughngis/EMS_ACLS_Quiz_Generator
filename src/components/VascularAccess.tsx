import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Syringe, Target, Activity, CheckCircle2, AlertTriangle, Zap } from 'lucide-react';

interface AccessSite {
  id: string;
  label: string;
  type: 'IV' | 'IO' | 'EJ';
  difficulty: number; // 0 to 1
  location: string;
}

const ACCESS_SITES: AccessSite[] = [
  { id: 'iv_ac_l', label: 'Antecubital IV', type: 'IV', difficulty: 0.2, location: 'Left Arm' },
  { id: 'iv_ac_r', label: 'Antecubital IV', type: 'IV', difficulty: 0.2, location: 'Right Arm' },
  { id: 'iv_hand_l', label: 'Hand IV', type: 'IV', difficulty: 0.5, location: 'Left Hand' },
  { id: 'io_tibia_l', label: 'Tibial IO', type: 'IO', difficulty: 0.1, location: 'Left Tibia' },
  { id: 'io_humerus_r', label: 'Humeral IO', type: 'IO', difficulty: 0.3, location: 'Right Humerus' },
  { id: 'ej_r', label: 'External Jugular', type: 'EJ', difficulty: 0.7, location: 'Right Neck' },
];

export const VascularAccess: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { patientState, applyAction } = useStore();
  const [selectedSite, setSelectedSite] = useState<AccessSite | null>(null);
  const [attempting, setAttempting] = useState(false);
  const [result, setResult] = useState<'SUCCESS' | 'FAILURE' | null>(null);

  const handleAttempt = () => {
    if (!selectedSite) return;
    setAttempting(true);

    // Logic: Difficulty increases if MAP is low
    const perfusionModifier = (patientState?.vitals.map || 70) < 60 ? 0.4 : 0;
    const failChance = selectedSite.difficulty + perfusionModifier;

    setTimeout(() => {
        setAttempting(false);
        if (Math.random() > failChance) {
            setResult('SUCCESS');
            applyAction(`${selectedSite.type}_START_${selectedSite.id.toUpperCase()}`);
            setTimeout(onClose, 2000);
        } else {
            setResult('FAILURE');
            setTimeout(() => setResult(null), 2000);
        }
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/98 z-[120] flex items-center justify-center p-12 backdrop-blur-3xl">
      <div className="bg-medical-dark border border-white/10 rounded-[3rem] w-full max-w-6xl h-[80vh] flex overflow-hidden shadow-2xl">

        {/* Anatomical Selection Sidebar */}
        <div className="w-[450px] bg-black/40 border-r border-white/5 flex flex-col p-12 overflow-y-auto scrollbar-thin">
           <div className="flex items-center gap-3 text-medical-cyan font-black uppercase tracking-[0.3em] text-[10px] mb-8">
              <Target size={14} /> Vascular Sites
           </div>

           <div className="space-y-4">
              {ACCESS_SITES.map(site => (
                 <button
                   key={site.id}
                   onClick={() => setSelectedSite(site)}
                   className={`w-full p-6 rounded-2xl border-2 transition-all text-left flex flex-col gap-2 ${selectedSite?.id === site.id ? 'bg-medical-cyan border-medical-cyan text-medical-dark shadow-xl' : 'bg-white/5 border-white/5 text-white/40 hover:border-white/10'}`}
                 >
                    <div className="flex justify-between items-center">
                       <span className="text-xs font-black uppercase italic">{site.label}</span>
                       <span className="text-[8px] font-bold opacity-60 uppercase">{site.type}</span>
                    </div>
                    <div className="text-[10px] font-medium opacity-80">{site.location}</div>
                 </button>
              ))}
           </div>
        </div>

        {/* Procedure Viewport */}
        <div className="flex-1 flex flex-col p-16 relative items-center justify-center text-center">
           <AnimatePresence mode="wait">
              {selectedSite ? (
                 <motion.div
                    key={selectedSite.id}
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md space-y-12"
                 >
                    <div className="space-y-4">
                       <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter">Site: <span className="text-medical-cyan">{selectedSite.label}</span></h2>
                       <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Preparation: Chlorhexidine Scrub & Flush Ready</p>
                    </div>

                    <div className="relative h-64 w-64 mx-auto flex items-center justify-center">
                       <div className="absolute inset-0 border-4 border-dashed border-white/5 rounded-full animate-[spin_30s_linear_infinite]"></div>

                       <AnimatePresence>
                          {attempting ? (
                             <motion.div
                               initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                               className="flex flex-col items-center gap-4"
                             >
                                <Zap className="text-medical-cyan animate-bounce" size={48} />
                                <div className="text-[10px] font-black text-medical-cyan uppercase animate-pulse">Advancing Needle...</div>
                             </motion.div>
                          ) : result === 'SUCCESS' ? (
                             <motion.div
                               initial={{ scale: 0 }} animate={{ scale: 1 }}
                               className="text-medical-green flex flex-col items-center gap-4"
                             >
                                <CheckCircle2 size={64} />
                                <div className="text-lg font-black uppercase italic">Flashback Confirmed</div>
                             </motion.div>
                          ) : result === 'FAILURE' ? (
                             <motion.div
                               initial={{ scale: 0 }} animate={{ scale: 1 }}
                               className="text-medical-red flex flex-col items-center gap-4"
                             >
                                <AlertTriangle size={64} />
                                <div className="text-lg font-black uppercase italic">Infiltration / Missed</div>
                             </motion.div>
                          ) : (
                             <div className="w-40 h-40 bg-white/5 rounded-full border-4 border-white/10 flex items-center justify-center shadow-inner">
                                <Syringe size={48} className="text-white/20" />
                             </div>
                          )}
                       </AnimatePresence>
                    </div>

                    {!attempting && !result && (
                       <button
                         onClick={handleAttempt}
                         className="w-full py-8 bg-white text-medical-dark font-black rounded-3xl hover:bg-medical-cyan transition-all uppercase tracking-[0.2em] shadow-2xl active:scale-95"
                       >
                          Attempt Cannulation
                       </button>
                    )}

                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex items-center justify-between">
                       <div className="text-[8px] font-black text-slate-500 uppercase">Estimated Success Rate</div>
                       <div className={`text-xs font-black ${(selectedSite.difficulty > 0.5 || (patientState?.vitals.map || 70) < 60) ? 'text-medical-yellow' : 'text-medical-green'}`}>
                          {Math.max(10, Math.floor((1 - selectedSite.difficulty - ((patientState?.vitals.map || 70) < 60 ? 0.3 : 0)) * 100))}%
                       </div>
                    </div>
                 </motion.div>
              ) : (
                 <div className="text-center space-y-6">
                    <Target size={64} className="text-slate-800 mx-auto" />
                    <h3 className="text-xl font-black text-white/20 uppercase tracking-[0.3em]">Select an access site to begin</h3>
                 </div>
              )}
           </AnimatePresence>

           <button onClick={onClose} className="absolute top-0 right-0 p-4 text-slate-500 hover:text-white transition-colors">✕</button>
        </div>

      </div>
    </div>
  );
};
