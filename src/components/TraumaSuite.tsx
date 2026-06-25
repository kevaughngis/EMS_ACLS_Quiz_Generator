import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';
import { Flame, Droplet, Shield, Calculator, CheckCircle2 } from 'lucide-react';

export const TraumaSuite: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [mode, setMode] = useState<'BURNS' | 'WOUNDS'>('BURNS');

  const [totalBSA, setTotalBSA] = useState(0);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);

  const burnAreas = [
    { id: 'head', name: 'Head (9%)', val: 9 },
    { id: 'torso_ant', name: 'Ant. Torso (18%)', val: 18 },
    { id: 'torso_post', name: 'Post. Torso (18%)', val: 18 },
    { id: 'arm_l', name: 'Left Arm (9%)', val: 9 },
    { id: 'arm_r', name: 'Right Arm (9%)', val: 9 },
    { id: 'leg_l', name: 'Left Leg (18%)', val: 18 },
    { id: 'leg_r', name: 'Right Leg (18%)', val: 18 },
  ];

  const toggleArea = (id: string, val: number) => {
    if (selectedAreas.includes(id)) {
        setSelectedAreas(prev => prev.filter(a => a !== id));
        setTotalBSA(prev => prev - val);
    } else {
        setSelectedAreas(prev => [...prev, id]);
        setTotalBSA(prev => prev + val);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/98 z-[120] flex items-center justify-center p-12 backdrop-blur-3xl">
      <div className="bg-[#0f172a] border border-white/10 rounded-[3rem] w-full max-w-6xl h-[80vh] flex flex-col overflow-hidden shadow-2xl font-mono">

        <div className="p-12 bg-white/5 border-b border-white/5 flex justify-between items-center">
           <div className="flex items-center gap-4">
              <Flame className="text-medical-red" />
              <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Trauma <span className="text-medical-red">Specialist</span></h2>
           </div>
           <div className="flex gap-2 bg-black/40 p-1.5 rounded-2xl">
              <button onClick={() => setMode('BURNS')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'BURNS' ? 'bg-medical-red text-white' : 'text-white/40'}`}>Rule of Nines</button>
              <button onClick={() => setMode('WOUNDS')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'WOUNDS' ? 'bg-medical-red text-white' : 'text-white/40'}`}>Wound Care</button>
           </div>
        </div>

        <div className="flex-1 p-16 flex gap-16 overflow-hidden">

           {mode === 'BURNS' && (
              <>
                 <div className="flex-1 grid grid-cols-2 gap-4 overflow-y-auto pr-4 scrollbar-thin">
                    {burnAreas.map(area => (
                       <button
                         key={area.id}
                         onClick={() => toggleArea(area.id, area.val)}
                         className={`p-6 rounded-2xl border-2 transition-all text-left flex justify-between items-center ${selectedAreas.includes(area.id) ? 'bg-medical-red/10 border-medical-red text-medical-red shadow-lg' : 'bg-white/5 border-white/5 text-white/40 hover:border-white/10'}`}
                       >
                          <span className="text-xs font-black uppercase tracking-tight">{area.name}</span>
                          {selectedAreas.includes(area.id) && <CheckCircle2 size={16}/>}
                       </button>
                    ))}
                 </div>

                 <div className="w-96 flex flex-col gap-8">
                    <div className="bg-medical-red/10 border border-medical-red/20 rounded-[2.5rem] p-12 text-center flex-1 flex flex-col items-center justify-center">
                       <Calculator className="text-medical-red mb-6" size={32} />
                       <div className="text-[10px] font-black text-medical-red uppercase tracking-[0.3em] mb-4">Total Burn Surface Area</div>
                       <div className="text-9xl font-black text-white tabular-nums drop-shadow-[0_0_30px_rgba(255,23,68,0.3)]">{totalBSA}%</div>
                       <div className="mt-8 text-xs font-bold text-slate-500 uppercase italic">Fluid Resuscitation (Parkland): {totalBSA * (useStore.getState().scenario?.patientWeight || 70) * 4}mL / 24h</div>
                    </div>
                    <button onClick={onClose} className="w-full py-6 bg-white text-medical-dark font-black rounded-3xl hover:bg-medical-red hover:text-white transition-all uppercase tracking-widest text-xs">Confirm TBSA & Log</button>
                 </div>
              </>
           )}

           {mode === 'WOUNDS' && (
              <div className="flex-1 flex flex-col items-center justify-center text-center gap-12">
                 <div className="w-64 h-64 bg-white/5 rounded-full border-8 border-dashed border-white/10 flex items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-medical-red/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <Droplet size={64} className="text-medical-red animate-pulse" />
                    <div className="absolute bottom-10 text-[10px] font-black text-white/20 uppercase">Interactive Wound Hub</div>
                 </div>
                 <div className="space-y-4">
                    <h3 className="text-xl font-black text-white uppercase italic">Advanced Dressing Mini-game</h3>
                    <p className="text-slate-500 max-w-md mx-auto">Debride the field and apply hemostatic agents. (Module Loading...)</p>
                    <button className="px-12 py-5 bg-medical-red text-white font-black rounded-2xl hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-[10px]">Start Debridement</button>
                 </div>
              </div>
           )}

        </div>
      </div>
    </div>
  );
};
