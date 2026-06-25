import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';
import { Wind, Activity, Zap, Thermometer, ShieldAlert, Settings } from 'lucide-react';

export const VentilatorInterface: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { patientState, applyAction } = useStore();

  const [settings, setSettings] = useState(patientState?.ventilator || {
    mode: 'AC',
    rate: 12,
    peep: 5,
    fio2: 40,
    tidalVolume: 450
  });

  const updateSetting = (key: string, val: any) => {
    const newSettings = { ...settings, [key]: val };
    setSettings(newSettings);
    applyAction(`UPDATE_VENT_${key.toUpperCase()}_${val}`);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/98 z-[120] flex items-center justify-center p-12 backdrop-blur-xl">
      <div className="bg-[#050b15] border-2 border-white/10 rounded-[3rem] w-full max-w-6xl h-[85vh] flex shadow-2xl overflow-hidden font-mono">

        {/* Left Side: Waveforms */}
        <div className="flex-1 bg-black p-10 flex flex-col gap-6">
           <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3 text-medical-cyan">
                 <Wind size={20} />
                 <span className="text-xl font-black uppercase tracking-tighter italic">Ventilator <span className="opacity-50">v4.0</span></span>
              </div>
              <div className="flex gap-4">
                 <Badge label="PEEP: 5" active />
                 <Badge label="FIO2: 40%" />
              </div>
           </div>

           <VentWaveform color="#00e5ff" label="Pressure (cmH2O)" />
           <VentWaveform color="#4ade80" label="Flow (L/min)" />
           <VentWaveform color="#facc15" label="Volume (mL)" />

           <div className="mt-auto grid grid-cols-4 gap-6">
              <StatBox label="Peak Pressure" value="24" unit="cmH2O" />
              <StatBox label="Plateau" value="18" unit="cmH2O" />
              <StatBox label="Minute Vol" value="5.4" unit="L/min" />
              <StatBox label="VTE" value="452" unit="mL" />
           </div>
        </div>

        {/* Right Side: Controls */}
        <div className="w-96 bg-white/5 border-l border-white/10 p-10 flex flex-col gap-8">
           <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Settings size={14} /> System Controls
           </h3>

           <div className="space-y-6">
              <ControlKnob label="Mode" value={settings.mode} options={['AC', 'SIMV', 'PS']} onChange={(v) => updateSetting('mode', v)} />
              <ControlKnob label="Rate" value={settings.rate} min={4} max={35} unit="bpm" onChange={(v) => updateSetting('rate', v)} />
              <ControlKnob label="PEEP" value={settings.peep} min={0} max={20} unit="cmH2O" onChange={(v) => updateSetting('peep', v)} />
              <ControlKnob label="FiO2" value={settings.fio2} min={21} max={100} unit="%" onChange={(v) => updateSetting('fio2', v)} />
              <ControlKnob label="Tidal Vol" value={settings.tidalVolume} min={200} max={800} step={50} unit="mL" onChange={(v) => updateSetting('tidalVolume', v)} />
           </div>

           <div className="mt-auto space-y-4">
              <button className="w-full py-4 bg-medical-red/20 border border-medical-red/40 text-medical-red font-black rounded-2xl hover:bg-medical-red hover:text-white transition-all uppercase tracking-widest text-[10px]">
                 Silence Alarms
              </button>
              <button
                onClick={onClose}
                className="w-full py-4 bg-white text-medical-dark font-black rounded-2xl hover:bg-medical-cyan transition-all uppercase tracking-widest text-[10px]"
              >
                 Exit Interface
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

const VentWaveform = ({ color, label }: any) => (
  <div className="flex-1 bg-slate-900/40 rounded-2xl border border-white/5 p-4 relative overflow-hidden">
     <div className="text-[10px] font-bold text-white/30 uppercase mb-2">{label}</div>
     <div className="absolute inset-0 flex items-center">
        <svg width="100%" height="80" className="opacity-80">
           <path
             d="M 0 40 Q 50 10 100 40 T 200 40 T 300 40 T 400 40"
             fill="none"
             stroke={color}
             strokeWidth="2"
             className="animate-[dash_5s_linear_infinite]"
           />
        </svg>
     </div>
  </div>
);

const Badge = ({ label, active }: any) => (
  <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${active ? 'bg-medical-cyan text-medical-dark border-medical-cyan' : 'border-white/10 text-white/40'}`}>
     {label}
  </div>
);

const StatBox = ({ label, value, unit }: any) => (
  <div className="text-center p-3 bg-white/5 rounded-xl border border-white/5">
     <div className="text-[8px] font-black text-slate-500 uppercase mb-1">{label}</div>
     <div className="text-xl font-black text-white leading-none">{value}<span className="text-[8px] ml-1 opacity-40">{unit}</span></div>
  </div>
);

const ControlKnob = ({ label, value, options, min, max, unit, step = 1, onChange }: any) => (
  <div className="space-y-3">
     <div className="flex justify-between items-end">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
        <div className="text-lg font-black text-medical-cyan">{value}<span className="text-[10px] ml-1 opacity-50">{unit}</span></div>
     </div>

     <div className="flex gap-2">
        {options ? (
           options.map((opt: string) => (
              <button
                key={opt}
                onClick={() => onChange(opt)}
                className={`flex-1 py-2 rounded-lg font-black text-[10px] transition-all border ${value === opt ? 'bg-medical-cyan text-medical-dark border-medical-cyan' : 'bg-white/5 border-white/10 text-white/40'}`}
              >
                 {opt}
              </button>
           ))
        ) : (
           <input
             type="range"
             min={min}
             max={max}
             step={step}
             value={value}
             onChange={(e) => onChange(Number(e.target.value))}
             className="w-full accent-medical-cyan bg-white/10 h-2 rounded-lg appearance-none cursor-pointer"
           />
        )}
     </div>
  </div>
);
