import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';
import { Settings, Play, RefreshCw, Activity, Wind, Zap, Sliders, TrendingUp } from 'lucide-react';

export const IVPumpTitration: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { applyAction } = useStore();
  const [drip, setDrip] = useState('Epinephrine');
  const [rate, setRate] = useState(2); // mcg/min
  const [concentration, setConcentration] = useState('4mg / 250mL');

  const updateRate = (val: number) => {
    setRate(val);
    applyAction(`TITRATE_${drip.toUpperCase()}_${val}`);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/98 z-[130] flex items-center justify-center p-12 backdrop-blur-3xl">
      <div className="bg-[#111827] border-2 border-white/10 rounded-[3rem] w-full max-w-5xl h-[70vh] flex shadow-2xl overflow-hidden font-mono">

        {/* Pump UI */}
        <div className="flex-1 bg-black p-12 flex flex-col gap-8">
           <div className="flex justify-between items-start">
              <div>
                 <div className="text-[10px] font-black text-medical-cyan uppercase tracking-widest mb-1">IV Infusion Pump</div>
                 <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">{drip}</h2>
                 <div className="text-[10px] font-bold text-slate-500 uppercase mt-1">Conc: {concentration}</div>
              </div>
              <div className="bg-medical-cyan/10 border border-medical-cyan px-4 py-2 rounded-xl">
                 <div className="text-[8px] font-black text-medical-cyan uppercase">Infusion Status</div>
                 <div className="text-xs font-bold text-white uppercase animate-pulse">Running</div>
              </div>
           </div>

           <div className="flex-1 bg-slate-900/40 rounded-[2.5rem] border border-white/5 p-10 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="text-8xl font-black text-white tabular-nums">{rate}</div>
              <div className="text-sm font-black text-medical-cyan uppercase tracking-widest mt-4">mcg / min</div>

              {/* Dose Response Chart (Stylized) */}
              <div className="absolute bottom-0 left-0 right-0 h-32 opacity-20">
                 <svg width="100%" height="100%">
                    <motion.path
                      d="M 0 100 Q 200 80 400 40 T 800 20"
                      fill="none"
                      stroke="#00e5ff"
                      strokeWidth="4"
                      animate={{ pathLength: [0, 1] }}
                      transition={{ duration: 2 }}
                    />
                 </svg>
              </div>
           </div>

           <div className="grid grid-cols-3 gap-6">
              <Stat label="VTBI" value="242.4" unit="mL" />
              <Stat label="Time Rem." value="08:42" unit="h:m" />
              <Stat label="Patient Weight" value="82.0" unit="kg" />
           </div>
        </div>

        {/* Controls */}
        <div className="w-80 bg-white/5 border-l border-white/10 p-12 flex flex-col gap-8">
           <div className="space-y-6">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                 <Sliders size={14} /> Titration
              </h3>

              <div className="space-y-4">
                 <div className="flex justify-between text-[10px] font-black text-white opacity-40 uppercase"><span>Rate Adjust</span><span>+ / -</span></div>
                 <div className="flex flex-col gap-2">
                    <AdjustBtn label="+ 1.0" onClick={() => updateRate(rate + 1)} />
                    <AdjustBtn label="+ 0.1" onClick={() => updateRate(rate + 0.1)} />
                    <AdjustBtn label="- 0.1" onClick={() => updateRate(rate - 0.1)} />
                    <AdjustBtn label="- 1.0" onClick={() => updateRate(rate - 1)} />
                 </div>
              </div>

              <button className="w-full py-4 bg-medical-red text-medical-dark font-black rounded-2xl hover:bg-white transition-all uppercase tracking-widest text-[10px]">
                 Emergency Stop
              </button>
           </div>

           <div className="mt-auto">
              <button
                onClick={onClose}
                className="w-full py-5 bg-white text-medical-dark font-black rounded-2xl hover:bg-medical-cyan transition-all uppercase tracking-widest text-[10px]"
              >
                 Return to Bedside
              </button>
           </div>
        </div>

      </div>
    </div>
  );
};

const Stat = ({ label, value, unit }: any) => (
  <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
     <div className="text-[8px] font-black text-slate-500 uppercase mb-1">{label}</div>
     <div className="text-xl font-black text-white">{value}<span className="text-[10px] ml-1 opacity-40 uppercase">{unit}</span></div>
  </div>
);

const AdjustBtn = ({ label, onClick }: any) => (
  <button
    onClick={onClick}
    className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-black text-white/40 hover:bg-medical-cyan hover:text-medical-dark hover:border-medical-cyan transition-all uppercase tracking-widest"
  >
     {label}
  </button>
);
