import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, Navigation, Wind, Thermometer, AlertCircle, Mountain, ArrowUp, ArrowDown } from 'lucide-react';

export const FlightDeck: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { applyAction, patientState } = useStore();
  const [alt, setAlt] = useState(0);

  // Sync altitude from mock store state if we had it, otherwise local mock
  const handleAscend = () => {
    setAlt(prev => Math.min(30000, prev + 1000));
    applyAction('ASCEND');
  };

  const handleDescend = () => {
    setAlt(prev => Math.max(0, prev - 1000));
    applyAction('DESCEND');
  };

  return (
    <div className="fixed inset-0 bg-medical-dark/95 z-[150] flex items-center justify-center p-8 backdrop-blur-3xl">
      <div className="bg-medical-dark border border-white/10 rounded-[3rem] w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col h-[75vh]">

        <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/5">
           <div className="flex items-center gap-6">
              <div className="p-4 bg-medical-blue/20 rounded-2xl">
                 <Plane className="text-medical-blue w-8 h-8" />
              </div>
              <div>
                 <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">Critical Care <span className="text-medical-blue">Medevac</span></h2>
                 <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">High-Altitude Physiology Operations</p>
              </div>
           </div>
           <button onClick={onClose} className="px-8 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10">Return to Mission</button>
        </div>

        <div className="flex-1 p-12 grid grid-cols-12 gap-12 overflow-y-auto">

           <div className="col-span-5 space-y-8">
              <div className="bg-black/40 p-8 rounded-3xl border border-white/5 space-y-8">
                 <div className="flex justify-between items-center">
                    <div className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <Navigation size={14} className="text-medical-blue" /> Cabin Altitude
                    </div>
                    <div className="px-3 py-1 bg-medical-blue/20 rounded-full text-[8px] font-black text-medical-blue uppercase tracking-widest">Cruising</div>
                 </div>

                 <div className="text-center py-10 space-y-2">
                    <div className="text-7xl font-black font-mono text-white italic tracking-tighter">{alt.toLocaleString()}</div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-[0.4em]">Feet MSL</div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <button onClick={handleAscend} className="py-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex flex-col items-center gap-2 transition-all">
                       <ArrowUp className="text-medical-blue" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ascend</span>
                    </button>
                    <button onClick={handleDescend} className="py-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex flex-col items-center gap-2 transition-all">
                       <ArrowDown className="text-medical-yellow" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Descend</span>
                    </button>
                 </div>
              </div>
           </div>

           <div className="col-span-7 space-y-6">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Atmospheric Impact</div>

              <FlightMetric
                icon={<Wind size={20} />}
                label="Partial Pressure O2"
                value={`${Math.max(40, 100 - (alt/300)).toFixed(1)} mmHg`}
                desc="Declining oxygen availability impacting patient saturation."
                status={alt > 8000 ? 'WARNING' : 'NORMAL'}
              />

              <FlightMetric
                icon={<Mountain size={20} />}
                label="Boyle's Law Effect"
                value={`x${(1 + alt/33000).toFixed(2)} Expansion`}
                desc="Trapped gas expansion (Pneumothorax, Cuff pressure)."
                status={alt > 5000 ? 'CRITICAL' : 'NORMAL'}
              />

              <FlightMetric
                icon={<Thermometer size={20} />}
                label="Ambient Temp"
                value={`${(15 - (alt/500)).toFixed(1)} °C`}
                desc="Risk of hypothermia for exposed trauma patients."
                status={alt > 15000 ? 'WARNING' : 'NORMAL'}
              />
           </div>

        </div>

      </div>
    </div>
  );
};

const FlightMetric = ({ icon, label, value, desc, status }: any) => (
   <div className={`p-6 rounded-3xl border transition-all flex items-start gap-6 ${status === 'CRITICAL' ? 'bg-medical-red/5 border-medical-red/30 shadow-[0_0_30px_rgba(239,68,68,0.1)]' : status === 'WARNING' ? 'bg-medical-yellow/5 border-medical-yellow/30' : 'bg-white/5 border-white/5'}`}>
      <div className={`p-4 rounded-2xl ${status === 'CRITICAL' ? 'bg-medical-red/20 text-medical-red' : status === 'WARNING' ? 'bg-medical-yellow/20 text-medical-yellow' : 'bg-white/5 text-medical-blue'}`}>
         {icon}
      </div>
      <div className="flex-1">
         <div className="flex justify-between items-start mb-1">
            <span className="text-xs font-black text-white uppercase italic">{label}</span>
            <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${status === 'CRITICAL' ? 'bg-medical-red text-white' : status === 'WARNING' ? 'bg-medical-yellow text-medical-dark' : 'bg-medical-green/20 text-medical-green'}`}>{status}</span>
         </div>
         <div className="text-2xl font-black font-mono text-white mb-2">{value}</div>
         <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide leading-relaxed">{desc}</p>
      </div>
   </div>
);
