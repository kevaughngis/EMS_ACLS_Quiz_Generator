import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Wind, Database, Search, Target, Radio } from 'lucide-react';

type UltrasoundView = 'CARDIAC_SUBCOSTAL' | 'LUNG_SLIDING' | 'FAST_RUQ' | 'IVC_COLLAPSIBILITY';

export const POCUSInterface: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { patientState } = useStore();
  const [activeView, setActiveView] = useState<UltrasoundView>('CARDIAC_SUBCOSTAL');
  const [gain, setSetGain] = useState(50);

  const getPathologyDescription = () => {
     if (patientState?.rhythm === 'PEA' || patientState?.rhythm === 'ASYSTOLE') {
        if (activeView === 'CARDIAC_SUBCOSTAL') return "Standstill - No cardiac contractility visualized. Suggests profound myocardial depression.";
     }
     if (patientState?.breathing === 'LABORED' && activeView === 'LUNG_SLIDING') {
        return "Absent lung sliding in upper fields. Strongly suggestive of tension pneumothorax.";
     }
     return "Normal anatomy - No acute free fluid (FAST negative). Lung sliding present bilaterally.";
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-[130] flex flex-col p-12 overflow-hidden font-mono selection:bg-medical-cyan/30">

      {/* Probe Viewport */}
      <div className="flex-1 flex gap-12 overflow-hidden">

        {/* The "Screen" */}
        <div className="flex-1 bg-black rounded-[4rem] border-8 border-slate-900 relative overflow-hidden flex flex-col items-center justify-center group shadow-[0_0_100px_rgba(0,0,0,1)]">
           <div className="absolute top-10 left-12 text-slate-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-4">
              <span>Freq: 5.0MHz</span>
              <div className="w-1 h-1 bg-slate-700 rounded-full"></div>
              <span>Depth: 18cm</span>
              <div className="w-1 h-1 bg-slate-700 rounded-full"></div>
              <span className="text-medical-cyan">Gain: {gain}%</span>
           </div>

           {/* Ultrasound Visualization (Stylized) */}
           <div className="relative w-[600px] h-[600px] rounded-full border-b-[80px] border-slate-950/20 overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.05)_0%,_transparent_80%)] opacity-20"></div>

              <AnimatePresence mode="wait">
                 <motion.div
                   key={activeView}
                   initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                   className="w-full h-full flex flex-col items-center justify-center"
                 >
                    {/* Simulated Anatomy Visuals */}
                    <div className="relative w-80 h-80">
                       <motion.div
                         animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
                         transition={{ repeat: Infinity, duration: 0.8 }}
                         className="absolute inset-0 border-[10px] border-white/20 rounded-full blur-xl"
                       />
                       <div className="absolute inset-0 flex items-center justify-center">
                          <Activity size={120} className="text-white/10" />
                       </div>

                       {/* Scanning Lines */}
                       <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.02)_3px)]"></div>
                    </div>
                 </motion.div>
              </AnimatePresence>

              {/* Dynamic Overlay Text */}
              <div className="absolute bottom-20 text-center px-12">
                 <div className="text-xs font-black text-white/40 uppercase tracking-[0.3em] mb-4">Diagnostic Interpretation</div>
                 <div className="text-medical-cyan font-bold italic leading-relaxed">"{getPathologyDescription()}"</div>
              </div>
           </div>

           {/* Depth Scale */}
           <div className="absolute right-12 inset-y-24 w-4 flex flex-col justify-between py-4 text-[8px] font-bold text-slate-700">
              {[0, 5, 10, 15, 20].map(d => <span key={d}>- {d}cm</span>)}
           </div>
        </div>

        {/* Sidebar Controls */}
        <div className="w-80 flex flex-col gap-8">
           <div className="p-8 bg-white/5 border border-white/10 rounded-[3rem]">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                 <Search size={14} /> Probe Placement
              </h3>

              <div className="flex flex-col gap-3">
                 <ProbeBtn active={activeView === 'CARDIAC_SUBCOSTAL'} onClick={() => setActiveView('CARDIAC_SUBCOSTAL')} label="Cardiac Subcostal" />
                 <ProbeBtn active={activeView === 'LUNG_SLIDING'} onClick={() => setActiveView('LUNG_SLIDING')} label="Lung Fields" />
                 <ProbeBtn active={activeView === 'FAST_RUQ'} onClick={() => setActiveView('FAST_RUQ')} label="FAST Exam (RUQ)" />
                 <ProbeBtn active={activeView === 'IVC_COLLAPSIBILITY'} onClick={() => setActiveView('IVC_COLLAPSIBILITY')} label="IVC Assessment" />
              </div>
           </div>

           <div className="flex-1 p-8 bg-white/5 border border-white/10 rounded-[3rem] flex flex-col">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                 <Target size={14} /> Image Optimization
              </h3>

              <div className="space-y-8">
                 <div className="space-y-4">
                    <div className="flex justify-between text-[10px] font-black text-white opacity-40"><span>System Gain</span><span>{gain}</span></div>
                    <input type="range" value={gain} onChange={(e) => setSetGain(Number(e.target.value))} className="w-full accent-medical-cyan bg-white/10 h-1 rounded-full appearance-none" />
                 </div>
                 <div className="text-[10px] font-medium text-slate-500 leading-relaxed italic">
                    Adjust gain to visualize low-echoic structures like pericardial fluid or blood.
                 </div>
              </div>

              <div className="mt-auto">
                 <button
                   onClick={onClose}
                   className="w-full py-5 bg-white text-medical-dark font-black rounded-2xl hover:bg-medical-cyan transition-all uppercase tracking-widest text-[10px]"
                 >
                    Freeze & Close
                 </button>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

const ProbeBtn = ({ active, onClick, label }: any) => (
  <button
    onClick={onClick}
    className={`w-full py-4 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all text-left flex items-center justify-between ${active ? 'bg-medical-cyan text-medical-dark border-medical-cyan shadow-lg shadow-medical-cyan/20' : 'bg-white/5 text-white/40 border-white/5 hover:border-white/20'}`}
  >
    {label}
    <Radio size={12} className={active ? 'opacity-100' : 'opacity-20'} />
  </button>
);
