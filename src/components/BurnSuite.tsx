import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Droplets, Thermometer, AlertCircle, Calculator, Activity, Heart, Shield } from 'lucide-react';

export const BurnSuite: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { applyAction, logs, patientState } = useStore();
  const [tbsa, setTbsa] = useState(30);
  const [fluidAdmin, setFluidAdmin] = useState(0);

  const weight = 80; // kg
  const parkland4ml = 4 * weight * tbsa;
  const targetRateFirst8 = (parkland4ml / 2) / 8;

  const handleBolus = () => {
    setFluidAdmin(prev => prev + 250);
    applyAction('FLUID_BOLUS_250');
  };

  return (
    <div className="fixed inset-0 bg-medical-dark/95 z-[150] flex items-center justify-center p-8 backdrop-blur-3xl">
      <div className="bg-medical-dark border border-white/10 rounded-[3rem] w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col h-[80vh]">

        <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/5">
           <div className="flex items-center gap-6">
              <div className="p-4 bg-medical-red/20 rounded-2xl">
                 <Flame className="text-medical-red w-8 h-8" />
              </div>
              <div>
                 <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">Burn & <span className="text-medical-red">Fluid</span> Resuscitation</h2>
                 <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Thermal & Chemical Injury Management</p>
              </div>
           </div>
           <button onClick={onClose} className="px-8 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10">Return</button>
        </div>

        <div className="flex-1 p-12 grid grid-cols-12 gap-12 overflow-y-auto">

           <div className="col-span-4 space-y-6">
              <div className="bg-black/40 p-8 rounded-3xl border border-white/5 space-y-8">
                 <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    <div className="flex items-center gap-2"><Calculator size={14} className="text-medical-red" /> Parkland Formula</div>
                    <div className="text-white">4mL x kg x TBSA</div>
                 </div>

                 <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-400 uppercase">First 24h Goal</div>
                    <div className="text-4xl font-black font-mono text-white italic tracking-tighter">{parkland4ml.toLocaleString()} <span className="text-sm">mL</span></div>
                 </div>

                 <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-400 uppercase">Target Rate (First 8h)</div>
                    <div className="text-3xl font-black font-mono text-medical-red italic tracking-tighter">{Math.round(targetRateFirst8)} <span className="text-sm">mL/hr</span></div>
                 </div>

                 <div className="pt-6 space-y-4">
                    <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase">
                       <span>Fluid Administered</span>
                       <span>{fluidAdmin} mL</span>
                    </div>
                    <div className="h-4 bg-white/5 rounded-full overflow-hidden">
                       <motion.div className="h-full bg-medical-red" animate={{ width: `${(fluidAdmin/parkland4ml)*100}%` }} />
                    </div>
                 </div>
              </div>
           </div>

           <div className="col-span-8 space-y-8">
              <div className="grid grid-cols-2 gap-6">
                 <button onClick={handleBolus} className="h-40 rounded-3xl border-2 border-white/10 bg-white/5 hover:border-medical-blue/40 transition-all flex flex-col items-center justify-center gap-4 group">
                    <Droplets className="text-medical-blue group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">LR Bolus (250mL)</span>
                 </button>
                 <button onClick={() => applyAction('AIRWAY_EVAL_THERMAL')} className="h-40 rounded-3xl border-2 border-white/10 bg-white/5 hover:border-medical-red/40 transition-all flex flex-col items-center justify-center gap-4 group">
                    <Heart className="text-medical-red group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">Assess Inhalation Injury</span>
                 </button>
                 <button onClick={() => applyAction('COOLING_FLUIDS')} className="h-40 rounded-3xl border-2 border-white/10 bg-white/5 hover:border-medical-cyan/40 transition-all flex flex-col items-center justify-center gap-4 group">
                    <Thermometer className="text-medical-cyan group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">Active Cooling</span>
                 </button>
                 <button onClick={() => applyAction('ESCHAROTOMY')} className="h-40 rounded-3xl border-2 border-white/10 bg-white/5 hover:border-medical-yellow/40 transition-all flex flex-col items-center justify-center gap-4 group">
                    <Shield className="text-medical-yellow group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">Escharotomy</span>
                 </button>
              </div>

              <div className="bg-white/5 rounded-[2.5rem] p-10 border border-white/5 space-y-4">
                 <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Capillary Leak Risk</div>
                 <p className="text-xs text-slate-400 leading-relaxed italic">Secondary to extensive thermal trauma, systemic inflammatory response syndrome (SIRS) is inducing significant plasma loss. Maintain MAP &gt; 65 and Urine Output &gt; 0.5 mL/kg/hr.</p>
              </div>
           </div>

        </div>

      </div>
    </div>
  );
};
