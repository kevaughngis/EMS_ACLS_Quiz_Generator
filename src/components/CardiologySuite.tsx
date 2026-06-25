import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Zap, Droplets, Target, ShieldAlert, Heart } from 'lucide-react';

export const CardiologySuite: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { applyAction, logs, patientState } = useStore();
  const [activeProcedure, setActiveProcedure] = useState<'NONE' | 'PACING' | 'PERICARDIOCENTESIS'>('NONE');
  const [pacingRate, setPacingRate] = useState(70);
  const [pacingOutput, setPacingOutput] = useState(0);
  const [fluidDrained, setFluidDrained] = useState(0);

  const startPacing = () => {
    applyAction(`TV_PACING_START_${pacingRate}_${pacingOutput}`);
  };

  const handleDrain = () => {
    setFluidDrained(prev => Math.min(500, prev + 50));
    applyAction('PERICARDIOCENTESIS_DRAIN');
  };

  return (
    <div className="fixed inset-0 bg-medical-dark/95 z-[150] flex items-center justify-center p-8 backdrop-blur-3xl">
      <div className="bg-medical-dark border border-white/10 rounded-[3rem] w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col h-[80vh]">

        <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/5">
           <div className="flex items-center gap-6">
              <div className="p-4 bg-medical-red/20 rounded-2xl">
                 <Heart className="text-medical-red w-8 h-8" />
              </div>
              <div>
                 <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">Advanced <span className="text-medical-red">Cardiology</span></h2>
                 <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Interventional Electrophysiology & Structural Care</p>
              </div>
           </div>
           <button onClick={onClose} className="px-8 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10">Exit Suite</button>
        </div>

        <div className="flex-1 p-12 grid grid-cols-12 gap-12 overflow-y-auto">

           <div className="col-span-4 space-y-4">
              <button
                onClick={() => setActiveProcedure('PACING')}
                className={`w-full p-8 rounded-3xl border-2 transition-all flex flex-col gap-4 ${activeProcedure === 'PACING' ? 'bg-medical-yellow/10 border-medical-yellow shadow-lg' : 'bg-white/5 border-white/5 hover:border-white/10'}`}
              >
                 <Zap className={activeProcedure === 'PACING' ? 'text-medical-yellow' : 'text-slate-500'} />
                 <div className="text-left">
                    <div className="text-lg font-black text-white uppercase italic">Transvenous Pacing</div>
                    <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Emergency Bradycardia Management</div>
                 </div>
              </button>

              <button
                onClick={() => setActiveProcedure('PERICARDIOCENTESIS')}
                className={`w-full p-8 rounded-3xl border-2 transition-all flex flex-col gap-4 ${activeProcedure === 'PERICARDIOCENTESIS' ? 'bg-medical-red/10 border-medical-red shadow-lg' : 'bg-white/5 border-white/5 hover:border-white/10'}`}
              >
                 <Droplets className={activeProcedure === 'PERICARDIOCENTESIS' ? 'text-medical-red' : 'text-slate-500'} />
                 <div className="text-left">
                    <div className="text-lg font-black text-white uppercase italic">Pericardiocentesis</div>
                    <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Cardiac Tamponade Relief</div>
                 </div>
              </button>
           </div>

           <div className="col-span-8 bg-black/20 rounded-[3rem] p-12 border border-white/5 relative overflow-hidden">
              <AnimatePresence mode="wait">
                 {activeProcedure === 'PACING' && (
                    <motion.div key="pacing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
                       <div className="flex justify-between items-center">
                          <h3 className="text-3xl font-black text-white uppercase italic">Lead <span className="text-medical-yellow">Placement</span></h3>
                          <div className="flex gap-2">
                             <div className="w-2 h-2 rounded-full bg-medical-green animate-pulse" />
                             <span className="text-[10px] font-black text-slate-500 uppercase">Signal: Stable</span>
                          </div>
                       </div>

                       <div className="grid grid-cols-2 gap-12">
                          <div className="space-y-6">
                             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Pacing Rate (BPM)</label>
                             <input type="range" min="40" max="120" value={pacingRate} onChange={(e) => setPacingRate(parseInt(e.target.value))} className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-medical-yellow" />
                             <div className="text-4xl font-black font-mono text-white">{pacingRate}</div>
                          </div>
                          <div className="space-y-6">
                             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Output (mA)</label>
                             <input type="range" min="0" max="20" step="0.5" value={pacingOutput} onChange={(e) => setPacingOutput(parseFloat(e.target.value))} className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-medical-yellow" />
                             <div className="text-4xl font-black font-mono text-white">{pacingOutput}</div>
                          </div>
                       </div>

                       <button onClick={startPacing} className="w-full py-8 bg-medical-yellow text-medical-dark font-black rounded-2xl uppercase tracking-[0.3em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all">Engage Pacer</button>
                    </motion.div>
                 )}

                 {activeProcedure === 'PERICARDIOCENTESIS' && (
                    <motion.div key="peri" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12 h-full flex flex-col">
                       <div className="flex justify-between items-center">
                          <h3 className="text-3xl font-black text-white uppercase italic">Subxiphoid <span className="text-medical-red">Aspiration</span></h3>
                          <div className="flex gap-2 text-medical-red">
                             <ShieldAlert size={16} />
                             <span className="text-[10px] font-black uppercase">Tamponade Risk: High</span>
                          </div>
                       </div>

                       <div className="flex-1 flex flex-col items-center justify-center gap-8">
                          <div className="relative w-48 h-48 bg-white/5 rounded-full flex items-center justify-center border-4 border-dashed border-white/10">
                             <motion.div
                               animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                               transition={{ repeat: Infinity, duration: 2 }}
                               className="absolute inset-0 bg-medical-red/20 rounded-full"
                             />
                             <Target size={48} className="text-white opacity-20" />
                          </div>

                          <div className="w-full max-w-md space-y-4">
                             <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase">
                                <span>Fluid Aspirated</span>
                                <span>{fluidDrained} mL</span>
                             </div>
                             <div className="h-4 bg-white/5 rounded-full overflow-hidden">
                                <motion.div className="h-full bg-medical-red" animate={{ width: `${(fluidDrained/500)*100}%` }} />
                             </div>
                          </div>

                          <button
                            onMouseDown={handleDrain}
                            className="px-16 py-6 bg-white text-medical-dark font-black rounded-2xl uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all"
                          >
                             Drain Pericardium
                          </button>
                       </div>
                    </motion.div>
                 )}

                 {activeProcedure === 'NONE' && (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-30">
                       <Activity size={80} className="text-white" />
                       <p className="text-sm font-bold uppercase tracking-widest max-w-xs">Select interventional procedure from the sidebar to begin</p>
                    </div>
                 )}
              </AnimatePresence>
           </div>
        </div>

      </div>
    </div>
  );
};
