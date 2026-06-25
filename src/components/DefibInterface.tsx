import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';
import { Zap, ShieldAlert, Timer, Settings2 } from 'lucide-react';
import { soundEngine } from '../engine/SoundEngine';

export const DefibInterface: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { applyAction, defibEnergy, defibCharge, isSync, patientState } = useStore();
  const [charging, setCharging] = useState(false);
  const [localCharge, setLocalCharge] = useState(0);

  useEffect(() => {
    let interval: number;
    if (charging && localCharge < 100) {
      interval = setInterval(() => {
        setLocalCharge(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 5;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [charging, localCharge]);

  const handleCharge = () => {
    setCharging(true);
    setLocalCharge(0);
    // soundEngine.playCharge() // Would add this
  };

  const handleShock = () => {
    if (localCharge === 100) {
      applyAction('DEFIBRILLATION');
      setLocalCharge(0);
      setCharging(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-[80] flex items-center justify-center p-8">
      <div className="bg-[#1a1a1a] border-4 border-slate-800 rounded-3xl w-full max-w-5xl aspect-video flex overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)]">

        {/* Left: Monitor Display */}
        <div className="flex-1 bg-black p-6 flex flex-col gap-4 relative">
           <div className="flex justify-between border-b border-emerald-900/30 pb-2">
              <span className="text-emerald-500 font-bold text-sm">DEFIBRILLATOR MODE</span>
              <div className="flex gap-4">
                 <span className={isSync ? 'text-blue-400 font-bold' : 'text-slate-700'}>SYNC</span>
                 <span className="text-emerald-500">PADDLES</span>
              </div>
           </div>

           <div className="flex-1 border border-emerald-900/20 rounded-lg flex flex-col items-center justify-center relative bg-[radial-gradient(#061b0a_1px,transparent_1px)] [background-size:20px_20px]">
              <div className="text-8xl font-black text-emerald-400 font-mono mb-2">
                {localCharge === 100 ? defibEnergy : '---'}
                <span className="text-2xl ml-2">J</span>
              </div>
              <div className="text-emerald-900 font-bold tracking-[0.5em] uppercase text-xs">Energy Selected</div>

              {charging && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                   <div className="w-64">
                      <div className="flex justify-between text-xs font-bold text-emerald-500 mb-2">
                        <span>CHARGING...</span>
                        <span>{localCharge}%</span>
                      </div>
                      <div className="h-4 bg-emerald-900/30 rounded-full overflow-hidden border border-emerald-500/30 p-0.5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${localCharge}%` }}
                          className="h-full bg-emerald-400 rounded-full shadow-[0_0_10px_#4ade80]"
                        />
                      </div>
                   </div>
                </div>
              )}
           </div>

           <div className="h-24 bg-slate-900/50 rounded flex items-center justify-around p-4">
              <div className="text-center">
                 <div className="text-[10px] text-slate-500 font-bold">HR</div>
                 <div className="text-3xl font-mono text-emerald-400">{Math.round(patientState?.vitals.hr || 0)}</div>
              </div>
              <div className="text-center">
                 <div className="text-[10px] text-slate-500 font-bold">SPO2</div>
                 <div className="text-3xl font-mono text-blue-400">{Math.round(patientState?.vitals.spo2 || 0)}</div>
              </div>
           </div>
        </div>

        {/* Right: Controls Area (Hardware Mimic) */}
        <div className="w-80 bg-slate-800 p-8 flex flex-col gap-6 border-l border-slate-700 shadow-inner">
           <button
             onClick={handleCharge}
             disabled={charging}
             className="h-20 bg-yellow-500 hover:bg-yellow-400 active:scale-95 rounded-xl flex flex-col items-center justify-center gap-1 shadow-[0_4px_0_#b45309] text-black font-black uppercase tracking-widest disabled:opacity-50 transition-all"
           >
              <Zap size={24} /> 2 Charge
           </button>

           <button
             onClick={handleShock}
             disabled={localCharge < 100}
             className="h-32 bg-red-600 hover:bg-red-500 active:scale-90 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-[0_6px_0_#991b1b] text-white font-black text-2xl uppercase tracking-tighter disabled:opacity-30 transition-all border-4 border-white/10"
           >
              <ShieldAlert size={48} /> 3 SHOCK
           </button>

           <div className="flex-1 grid grid-cols-2 gap-4">
              <ControlButton label="Energy Select" icon={<Settings2 size={16}/>} />
              <ControlButton label="Sync On/Off" icon={<Timer size={16}/>} active={isSync} />
              <ControlButton label="Analyze" />
              <button
                onClick={onClose}
                className="bg-slate-700 rounded-lg text-[10px] font-bold text-white/50 uppercase hover:text-white"
              >
                Exit Mode
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

const ControlButton = ({ label, icon, active }: any) => (
  <button className={`bg-slate-700 hover:bg-slate-600 rounded-lg flex flex-col items-center justify-center p-2 border-b-2 border-black/40 transition-colors ${active ? 'bg-blue-600 border-blue-800' : ''}`}>
    {icon}
    <span className="text-[8px] font-black uppercase mt-1 text-white/70">{label}</span>
  </button>
);
