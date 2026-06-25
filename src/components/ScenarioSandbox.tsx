import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';
import { Settings, Play, RefreshCw, Activity, Wind, Zap } from 'lucide-react';
import type { RhythmType, PatientState } from '../types';

export const ScenarioSandbox: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { startScenario } = useStore();

  const [vitals, setVitals] = useState({
    hr: 70,
    map: 85,
    spo2: 98,
    rr: 16
  });

  const [rhythm, setRhythm] = useState<RhythmType>('SINUS');

  const launchSandbox = () => {
    // Generate a temporary scenario object for the sandbox
    const sandboxState: PatientState = {
        vitals: { ...vitals, etco2: 35, temp: 37, co: 5.0 },
        rhythm,
        consciousness: 'AWAKE',
        airway: 'CLEAR',
        breathing: 'NORMAL',
        circulation: 'PULSE',
        physicalExam: {
            pupils: 'PERRL',
            capRefill: 2,
            lungSounds: 'CLEAR',
            heartSounds: 'NORMAL'
        }
    };

    // In a real app, we'd add this to the scenarios list or handle custom init
    // For now, let's trigger a specialized start
    (window as any).customSandboxState = sandboxState;
    startScenario('acls-vf-1'); // Placeholder ID, we'll intercept in startScenario
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/98 z-[130] flex items-center justify-center p-12 backdrop-blur-3xl">
      <div className="bg-medical-dark border-4 border-white/5 rounded-[4rem] w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col">

        <div className="p-12 bg-white/5 border-b border-white/5 flex justify-between items-center">
           <div>
              <div className="flex items-center gap-3 text-medical-cyan font-black uppercase tracking-widest text-[10px] mb-2">
                 <Settings size={14} /> Protocol Designer
              </div>
              <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">Scenario <span className="text-medical-cyan">Sandbox</span></h2>
           </div>
           <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors uppercase tracking-widest text-[10px] font-black">Cancel</button>
        </div>

        <div className="flex-1 p-12 grid grid-cols-2 gap-12 overflow-y-auto">

           <div className="space-y-8">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Base Hemodynamics</h3>
              <SandboxSlider label="Heart Rate" value={vitals.hr} min={0} max={220} unit="bpm" onChange={(v) => setVitals({...vitals, hr: v})} />
              <SandboxSlider label="Mean Art. Pressure" value={vitals.map} min={0} max={160} unit="mmHg" onChange={(v) => setVitals({...vitals, map: v})} />
              <SandboxSlider label="Oxygen Saturation" value={vitals.spo2} min={0} max={100} unit="%" onChange={(v) => setVitals({...vitals, spo2: v})} />
              <SandboxSlider label="Respiratory Rate" value={vitals.rr} min={0} max={60} unit="bpm" onChange={(v) => setVitals({...vitals, rr: v})} />
           </div>

           <div className="space-y-8">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Cardiac Rhythm</h3>
              <div className="grid grid-cols-2 gap-3">
                 {['SINUS', 'VF', 'VT', 'ASYSTOLE', 'PEA', 'AFIB', 'SVT', 'SBAD'].map(r => (
                    <button
                      key={r}
                      onClick={() => setRhythm(r as RhythmType)}
                      className={`py-4 rounded-2xl font-black text-[10px] transition-all border-2 ${rhythm === r ? 'bg-medical-cyan border-medical-cyan text-medical-dark shadow-lg shadow-medical-cyan/20' : 'bg-white/5 border-white/5 text-white/40 hover:border-white/20'}`}
                    >
                       {r}
                    </button>
                 ))}
              </div>

              <div className="pt-8">
                 <button
                   onClick={launchSandbox}
                   className="w-full py-8 bg-medical-cyan text-medical-dark font-black rounded-3xl hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-4"
                 >
                    <Play fill="currentColor" /> Initialize Simulation
                 </button>
              </div>
           </div>

        </div>
      </div>
    </div>
  );
};

const SandboxSlider = ({ label, value, min, max, unit, onChange }: any) => (
    <div className="space-y-2">
       <div className="flex justify-between items-end">
          <span className="text-[10px] font-black text-white opacity-40 uppercase tracking-widest">{label}</span>
          <span className="text-lg font-black text-white tabular-nums">{value}<span className="text-[10px] ml-1 opacity-40 uppercase font-sans">{unit}</span></span>
       </div>
       <input
         type="range" min={min} max={max} value={value}
         onChange={(e) => onChange(Number(e.target.value))}
         className="w-full accent-medical-cyan h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer"
       />
    </div>
);
