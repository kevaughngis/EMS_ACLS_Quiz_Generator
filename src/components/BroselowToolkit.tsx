import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Ruler, Thermometer, FlaskConical, Wind, Activity } from 'lucide-react';

export const BroselowToolkit: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { scenario } = useStore();
  const weight = scenario?.patientWeight || 10;

  const zones = [
    { color: 'bg-medical-red', label: 'RED', range: '8-9 kg', etSize: '3.5', epi: '0.08mg' },
    { color: 'bg-medical-blue', label: 'BLUE', range: '12-14 kg', etSize: '4.5', epi: '0.12mg' },
    { color: 'bg-medical-yellow', label: 'YELLOW', range: '15-18 kg', etSize: '5.0', epi: '0.15mg' },
  ];

  const activeZone = zones.find(z => weight >= parseInt(z.range.split('-')[0])) || zones[0];

  return (
    <div className="fixed inset-0 bg-slate-900/98 z-[120] flex items-center justify-center p-12 backdrop-blur-3xl">
      <div className="bg-[#050b15] border border-white/10 rounded-[4rem] w-full max-w-6xl h-[80vh] flex flex-col overflow-hidden shadow-2xl">

        <div className="p-12 bg-white/5 border-b border-white/5 flex justify-between items-end">
           <div>
              <div className="flex items-center gap-3 text-medical-cyan font-black uppercase tracking-widest text-[10px] mb-2">
                 <Ruler size={14} /> PALS Optimization
              </div>
              <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter">Broselow <span className="text-medical-cyan">Toolkit</span></h2>
           </div>
           <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors uppercase tracking-widest text-[10px] font-black">Close</button>
        </div>

        <div className="flex-1 p-16 flex gap-16 overflow-hidden">

           {/* Visual Tape */}
           <div className="w-24 bg-white/5 border border-white/10 rounded-full flex flex-col items-center py-8 gap-4 overflow-hidden relative">
              <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,white_3px)]"></div>
              {zones.map(z => (
                 <div key={z.label} className={`w-16 h-48 ${z.color} rounded-2xl flex items-center justify-center border-4 border-white/10 transition-all ${activeZone.label === z.label ? 'scale-110 shadow-2xl border-white' : 'opacity-30'}`}>
                    <span className="rotate-90 text-[10px] font-black text-medical-dark">{z.label}</span>
                 </div>
              ))}
           </div>

           {/* Equipment Grid */}
           <div className="flex-1 grid grid-cols-2 gap-10">
              <EquipmentCard
                icon={<Wind className="text-medical-cyan" />}
                title="Airway Management"
                specs={[
                    { label: 'ETT Size', value: `${activeZone.etSize} Cuffed` },
                    { label: 'Laryngoscope', value: 'Miller 1-2' },
                    { label: 'OPA Size', value: '60mm' }
                ]}
              />
              <EquipmentCard
                icon={<Activity className="text-medical-red" />}
                title="Circulation & Drugs"
                specs={[
                    { label: 'Epinephrine', value: activeZone.epi },
                    { label: 'Defib Energy', value: '18J (2J/kg)' },
                    { label: 'Fluid Bolus', value: '200mL' }
                ]}
              />
              <div className="col-span-2 bg-white/5 border border-white/10 rounded-[2.5rem] p-10 flex items-center justify-between">
                 <div>
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Estimated Patient Weight</div>
                    <div className="text-4xl font-black text-white tabular-nums">{weight} <span className="text-lg opacity-40 italic">kg</span></div>
                 </div>
                 <div className={`px-8 py-4 rounded-2xl ${activeZone.color} text-medical-dark font-black uppercase italic shadow-xl`}>
                    Zone: {activeZone.label}
                 </div>
              </div>
           </div>

        </div>
      </div>
    </div>
  );
};

const EquipmentCard = ({ icon, title, specs }: any) => (
   <div className="bg-black/40 border border-white/5 rounded-[2.5rem] p-10 flex flex-col gap-8">
      <div className="flex items-center gap-4 border-b border-white/5 pb-6">
         <div className="p-3 bg-white/5 rounded-xl">{icon}</div>
         <div className="text-xl font-black text-white italic uppercase">{title}</div>
      </div>
      <div className="space-y-6">
         {specs.map((s: any) => (
            <div key={s.label} className="flex justify-between items-end">
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{s.label}</span>
               <span className="text-lg font-bold text-white tracking-tight italic">{s.value}</span>
            </div>
         ))}
      </div>
   </div>
);
