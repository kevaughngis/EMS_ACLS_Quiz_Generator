import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Syringe, FlaskConical, Beaker, Check, AlertCircle, Droplets } from 'lucide-react';

interface Vial {
  id: string;
  name: string;
  concentration: string;
  color: string;
}

const CABINET: Vial[] = [
  { id: 'epi', name: 'Epinephrine', concentration: '1mg / 10mL', color: 'bg-medical-red' },
  { id: 'amio', name: 'Amiodarone', concentration: '150mg / 3mL', color: 'bg-medical-blue' },
  { id: 'atropine', name: 'Atropine', concentration: '1mg / 10mL', color: 'bg-white' },
  { id: 'adenosine', name: 'Adenosine', concentration: '6mg / 2mL', color: 'bg-medical-yellow' },
  { id: 'narcan', name: 'Naloxone', concentration: '2mg / 2mL', color: 'bg-medical-cyan' },
  { id: 'txa', name: 'TXA', concentration: '1g / 10mL', color: 'bg-medical-green' },
];

export const PharmacyCabinet: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { applyAction } = useStore();
  const [selectedVial, setSelectedVial] = useState<Vial | null>(null);
  const [prepStep, setPrepStep] = useState<'SELECT' | 'DRAW' | 'ROUTE'>('SELECT');
  const [volume, setVolume] = useState(0);

  const handleDraw = () => {
    if (volume < 100) setVolume(prev => prev + 10);
  };

  const handleAdminister = (route: string) => {
    applyAction(`${selectedVial?.id.toUpperCase()}_${route}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/98 z-[120] flex items-center justify-center p-12 backdrop-blur-2xl">
      <div className="bg-medical-dark border border-white/10 rounded-[3rem] w-full max-w-5xl h-[80vh] flex flex-col overflow-hidden shadow-2xl">

        <div className="p-10 bg-white/5 border-b border-white/5 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Pharmacy <span className="text-medical-cyan">Cabinet</span></h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">High-Fidelity Medication Preparation</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">✕ CLOSE</button>
        </div>

        <div className="flex-1 p-16 flex gap-12 overflow-hidden">

          {/* Vial Selection Grid */}
          <div className="flex-1 grid grid-cols-3 gap-6 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-white/10">
             {CABINET.map(vial => (
                <button
                  key={vial.id}
                  onClick={() => { setSelectedVial(vial); setPrepStep('DRAW'); }}
                  className={`relative p-8 rounded-3xl border-2 transition-all flex flex-col items-center gap-4 group ${selectedVial?.id === vial.id ? 'border-medical-cyan bg-medical-cyan/5' : 'border-white/5 bg-white/5 hover:border-white/20'}`}
                >
                   <div className={`w-12 h-20 rounded-lg ${vial.color} opacity-80 group-hover:opacity-100 shadow-xl relative`}>
                      <div className="absolute top-2 inset-x-1 h-4 bg-white/20 rounded-sm"></div>
                   </div>
                   <div className="text-center">
                      <div className="text-sm font-black text-white uppercase italic">{vial.name}</div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{vial.concentration}</div>
                   </div>
                </button>
             ))}
          </div>

          {/* Preparation Area */}
          <div className="w-[400px] bg-black/40 border border-white/5 rounded-[2.5rem] p-10 flex flex-col items-center justify-center relative">
             <AnimatePresence mode="wait">
                {prepStep === 'SELECT' && (
                   <motion.div key="sel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                      <Beaker size={48} className="text-slate-700 mx-auto mb-6" />
                      <p className="text-slate-500 font-medium italic">Select a medication vial to begin preparation.</p>
                   </motion.div>
                )}

                {prepStep === 'DRAW' && selectedVial && (
                   <motion.div key="draw" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full flex flex-col items-center gap-12">
                      <div className="text-center">
                         <div className="text-[10px] font-black text-medical-cyan uppercase tracking-[0.2em] mb-2">Preparation</div>
                         <div className="text-2xl font-black text-white italic uppercase">{selectedVial.name}</div>
                      </div>

                      <div className="relative w-24 h-64 bg-white/5 border-4 border-white/10 rounded-full flex flex-col justify-end overflow-hidden">
                         <motion.div
                           animate={{ height: `${volume}%` }}
                           className={`w-full ${selectedVial.color} shadow-[0_0_20px_rgba(255,255,255,0.2)]`}
                         />
                         <div className="absolute inset-0 flex flex-col justify-between py-8 px-4 pointer-events-none opacity-20">
                            {[10,8,6,4,2].map(m => <div key={m} className="border-t-2 border-white w-full"></div>)}
                         </div>
                      </div>

                      <button
                        onMouseDown={handleDraw}
                        className="w-full py-6 bg-medical-cyan text-medical-dark font-black rounded-2xl hover:scale-105 active:scale-95 transition-all uppercase tracking-widest"
                      >
                         Draw into Syringe
                      </button>

                      {volume >= 100 && (
                         <button onClick={() => setPrepStep('ROUTE')} className="flex items-center gap-2 text-medical-green font-black uppercase text-[10px] tracking-widest animate-bounce">
                            Prep Complete <Check size={14}/>
                         </button>
                      )}
                   </motion.div>
                )}

                {prepStep === 'ROUTE' && (
                   <motion.div key="route" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full flex flex-col gap-4">
                      <div className="text-center mb-8">
                         <div className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Select Route</div>
                         <div className="text-lg font-black text-white uppercase italic">Administration</div>
                      </div>

                      <RouteButton label="IV / IO Push" onClick={() => handleAdminister('IVP')} />
                      <RouteButton label="IV Infusion / Drip" onClick={() => handleAdminister('INFUSION')} />
                      <RouteButton label="IM Injection" onClick={() => handleAdminister('IM')} />
                      <RouteButton label="ET Tube (Down the tube)" onClick={() => handleAdminister('ETT')} />
                   </motion.div>
                )}
             </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
};

const RouteButton = ({ label, onClick }: any) => (
   <button
     onClick={onClick}
     className="w-full py-4 border-2 border-white/5 bg-white/5 rounded-2xl text-xs font-black text-white/60 hover:border-medical-cyan hover:text-medical-cyan transition-all uppercase tracking-widest"
   >
      {label}
   </button>
);
