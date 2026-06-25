import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Crosshair, Shield, Activity, AlertOctagon, Zap, ThermometerSnowflake, Droplets } from 'lucide-react';

export const TCCCSuite: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { applyAction, logs } = useStore();
  const [activeMarch, setActiveMarch] = useState<string | null>(null);

  const marchSteps = [
    { id: 'M', label: 'Massive Hemorrhage', detail: 'Tourniquets & Wound Packing', icon: <Droplets className="text-medical-red" /> },
    { id: 'A', label: 'Airway', detail: 'NPA / Cricothyrotomy', icon: <Activity className="text-medical-blue" /> },
    { id: 'R', label: 'Respiration', detail: 'Chest Seals & Needle D', icon: <Activity className="text-medical-cyan" /> },
    { id: 'C', label: 'Circulation', detail: 'Pelvic Slings & TXA', icon: <Shield className="text-medical-green" /> },
    { id: 'H', label: 'Head / Hypothermia', detail: 'GCS & Blanket / HPMK', icon: <ThermometerSnowflake className="text-medical-yellow" /> },
  ];

  return (
    <div className="fixed inset-0 bg-medical-dark/95 z-[150] flex items-center justify-center p-8 backdrop-blur-3xl">
      <div className="bg-medical-dark border border-white/10 rounded-[3rem] w-full max-w-6xl overflow-hidden shadow-2xl flex flex-col h-[85vh] relative">
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

        <div className="p-10 border-b border-white/5 flex items-center justify-between bg-black/40 relative">
           <div className="flex items-center gap-6">
              <div className="p-4 bg-medical-green/20 rounded-2xl border border-medical-green/30">
                 <Crosshair className="text-medical-green w-8 h-8" />
              </div>
              <div>
                 <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">Tactical <span className="text-medical-green">TCCC</span> Suite</h2>
                 <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">MARCH Algorithm Operations</p>
              </div>
           </div>
           <button onClick={onClose} className="px-8 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10">Back to Zone</button>
        </div>

        <div className="flex-1 p-12 grid grid-cols-12 gap-12 overflow-y-auto relative">

           <div className="col-span-5 space-y-4">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6">MARCH Protocol Tracking</div>
              {marchSteps.map(step => (
                 <button
                   key={step.id}
                   onClick={() => setActiveMarch(step.id)}
                   className={`w-full p-6 rounded-3xl border-2 flex items-center gap-6 transition-all ${activeMarch === step.id ? 'bg-medical-green border-white scale-105 shadow-2xl' : 'bg-white/5 border-white/5 hover:border-white/10'}`}
                 >
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black ${activeMarch === step.id ? 'bg-white text-medical-green' : 'bg-white/5 text-slate-400'}`}>
                       {step.id}
                    </div>
                    <div className="flex-1 text-left">
                       <div className={`text-lg font-black uppercase italic ${activeMarch === step.id ? 'text-white' : 'text-slate-200'}`}>{step.label}</div>
                       <div className={`text-[9px] font-bold uppercase tracking-widest ${activeMarch === step.id ? 'text-white/60' : 'text-slate-500'}`}>{step.detail}</div>
                    </div>
                 </button>
              ))}
           </div>

           <div className="col-span-7">
              <AnimatePresence mode="wait">
                 {activeMarch ? (
                    <motion.div
                      key={activeMarch}
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      className="space-y-8"
                    >
                       <div className="bg-white/5 p-10 rounded-[3rem] border border-white/5 space-y-8">
                          <div className="flex items-center gap-4">
                             {marchSteps.find(s => s.id === activeMarch)?.icon}
                             <h3 className="text-2xl font-black text-white uppercase italic">Active Intervention: {activeMarch}</h3>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                             {activeMarch === 'M' && (
                                <>
                                   <TacticalAction label="Combat Gauze" detail="Wound Packing" onClick={() => applyAction('WOUND_PACKING')} />
                                   <TacticalAction label="CAT Tourniquet" detail="High and Tight" onClick={() => applyAction('CAT_TOURNIQUET')} />
                                   <TacticalAction label="Junctional TQ" detail="Groin/Axilla" onClick={() => applyAction('JUNCTIONAL_TQ')} />
                                </>
                             )}
                             {activeMarch === 'A' && (
                                <>
                                   <TacticalAction label="NPA" detail="Nasopharyngeal" onClick={() => applyAction('NPA')} />
                                   <TacticalAction label="Surgical Cric" detail="Cricothyrotomy" onClick={() => applyAction('SURGICAL_CRIC')} />
                                </>
                             )}
                             {activeMarch === 'R' && (
                                <>
                                   <TacticalAction label="Chest Seal" detail="Occlusive" onClick={() => applyAction('CHEST_SEAL')} />
                                   <TacticalAction label="Needle D" detail="10G / 14G" onClick={() => applyAction('NEEDLE_D')} />
                                </>
                             )}
                             {activeMarch === 'C' && (
                                <>
                                   <TacticalAction label="Pelvic Sling" detail="SAM Sling" onClick={() => applyAction('PELVIC_SLING')} />
                                   <TacticalAction label="TXA 2g" detail="IV/IO Push" onClick={() => applyAction('TXA_TACTICAL')} />
                                </>
                             )}
                          </div>
                       </div>
                    </motion.div>
                 ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-20">
                       <AlertOctagon size={80} className="text-medical-green" />
                       <p className="text-sm font-bold uppercase tracking-widest">Select MARCH phase to begin interventions</p>
                    </div>
                 )}
              </AnimatePresence>
           </div>

        </div>

      </div>
    </div>
  );
};

const TacticalAction = ({ label, detail, onClick }: any) => (
   <button
     onClick={onClick}
     className="p-6 bg-white/5 hover:bg-medical-green/10 border border-white/10 hover:border-medical-green/40 rounded-3xl transition-all text-left group"
   >
      <div className="text-sm font-black text-white uppercase italic mb-1 group-hover:text-medical-green transition-colors">{label}</div>
      <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{detail}</div>
   </button>
);
