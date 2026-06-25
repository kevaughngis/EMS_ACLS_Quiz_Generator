import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';
import { Briefcase, Zap, Wind, Syringe, Box, Activity, Ruler } from 'lucide-react';

export const EquipmentBag: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { applyAction, setProcedure } = useStore();
  const [category, setCategory] = useState<'AIRWAY' | 'CIRCULATION' | 'DRUGS' | 'TRAUMA'>('AIRWAY');

  return (
    <div className="fixed inset-0 bg-slate-900/95 z-[90] flex items-center justify-center p-8 backdrop-blur-sm">
      <div className="bg-medical-dark border border-white/10 rounded-[2rem] w-full max-w-4xl h-[70vh] flex flex-col overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="px-10 py-8 bg-white/5 border-b border-white/5 flex justify-between items-center">
           <div className="flex items-center gap-4">
              <Briefcase className="text-medical-cyan" />
              <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Equipment <span className="text-medical-cyan">Bag</span></h2>
           </div>
           <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">CLOSE</button>
        </div>

        {/* Navigation */}
        <div className="flex bg-black/20 p-2 mx-10 mt-6 rounded-2xl gap-2">
           <TabButton active={category === 'AIRWAY'} onClick={() => setCategory('AIRWAY')} icon={<Wind size={16}/>} label="Airway" />
           <TabButton active={category === 'CIRCULATION'} onClick={() => setCategory('CIRCULATION')} icon={<Zap size={16}/>} label="Circulation" />
           <TabButton active={category === 'DRUGS'} onClick={() => setProcedure('PHARMACY')} icon={<Syringe size={16}/>} label="Pharmacy" />
           <TabButton active={category === 'TRAUMA'} onClick={() => setProcedure('TRAUMA_SUITE')} icon={<Activity size={16}/>} label="Trauma" />
           {useStore.getState().scenario?.protocol === 'PALS' && (
             <TabButton active={false} onClick={() => setProcedure('BROSELOW')} icon={<Ruler size={16}/>} label="Broselow" />
           )}
        </div>

        {/* Grid */}
        <div className="flex-1 p-10 grid grid-cols-3 gap-6 overflow-y-auto">
           {category === 'AIRWAY' && (
             <>
               <InventoryItem label="BVM Ventilation" icon={<Wind />} onClick={() => { onClose(); (window as any).startMinigame?.('BVM_VENTILATION'); }} />
               <InventoryItem label="ET Tube (7.5)" onClick={() => { onClose(); (window as any).startMinigame?.('INTUBATION'); }} />
               <InventoryItem label="Laryngoscope" onClick={() => { onClose(); (window as any).startMinigame?.('INTUBATION'); }} />
               <InventoryItem label="Suction" onClick={() => applyAction('SUCTION')} />
               <InventoryItem label="OPA / NPA" onClick={() => applyAction('AIRWAY_ADJUNCT')} />
             </>
           )}
           {category === 'CIRCULATION' && (
             <>
               <InventoryItem label="Vascular Access" icon={<Zap />} onClick={() => setProcedure('VASCULAR_ACCESS')} />
               <InventoryItem label="IO Drill" onClick={() => { onClose(); (window as any).startMinigame?.('IO_ACCESS'); }} />
               <InventoryItem label="Normal Saline" onClick={() => applyAction('FLUID_BOLUS')} />
               <InventoryItem label="Pressure Bag" onClick={() => applyAction('FLUID_BOLUS')} />
             </>
           )}
           {category === 'DRUGS' && (
             <>
               <InventoryItem label="Epinephrine 1:10k" icon={<Syringe />} onClick={() => applyAction('EPINEPHRINE')} />
               <InventoryItem label="Amiodarone 150mg" icon={<Syringe />} onClick={() => applyAction('AMIODARONE')} />
               <InventoryItem label="Atropine 1mg" icon={<Syringe />} onClick={() => applyAction('ATROPINE')} />
               <InventoryItem label="Adenosine 6mg" icon={<Syringe />} onClick={() => applyAction('ADENOSINE')} />
               <InventoryItem label="Narcan 2mg" icon={<Syringe />} onClick={() => applyAction('NARCAN')} />
               <InventoryItem label="Dextrose 50%" icon={<Syringe />} onClick={() => applyAction('DEXTROSE')} />
             </>
           )}
           {category === 'TRAUMA' && (
             <>
               <InventoryItem label="14G Needle" onClick={() => { onClose(); (window as any).startMinigame?.('NEEDLE_DECOMPRESSION'); }} />
               <InventoryItem label="Tourniquet" onClick={() => { onClose(); (window as any).startMinigame?.('TOURNIQUET'); }} />
               <InventoryItem label="Chest Seal" onClick={() => applyAction('CHEST_SEAL')} />
               <InventoryItem label="TXA 1g" onClick={() => applyAction('TXA_ADMIN')} />
             </>
           )}
        </div>
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button
    onClick={onClick}
    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest ${active ? 'bg-medical-cyan text-medical-dark shadow-lg shadow-medical-cyan/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
  >
    {icon} {label}
  </button>
);

const InventoryItem = ({ label, icon, onClick }: any) => (
  <button
    onClick={onClick}
    className="aspect-square bg-white/5 border border-white/5 rounded-3xl flex flex-col items-center justify-center gap-4 hover:bg-medical-cyan hover:text-medical-dark hover:border-medical-cyan transition-all group active:scale-95 shadow-xl"
  >
    <div className="p-4 bg-white/5 rounded-2xl group-hover:bg-medical-dark/10">
      {icon || <Box />}
    </div>
    <span className="text-xs font-bold uppercase tracking-tighter text-center px-4">{label}</span>
  </button>
);
