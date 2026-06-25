import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronUp, ChevronDown, Activity, AlertCircle, Info } from 'lucide-react';

export const RadiologySuite: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { scenario } = useStore();
  const [slice, setSlice] = useState(25);
  const [findingVisible, setFindingVisible] = useState(false);

  const getImagingContent = () => {
    if (scenario?.id === 'stroke-nihss-1') {
        return {
            title: 'Head CT (Non-Contrast)',
            finding: 'Subtle hypodensity in the left middle cerebral artery territory. No evidence of intracranial hemorrhage.',
            keySlices: [22, 28]
        };
    }
    return {
        title: 'Trauma Chest/Abdo CT',
        finding: 'Large right-sided pneumothorax with mediastinal shift. Trace free fluid in Morison pouch.',
        keySlices: [15, 45]
    };
  };

  const content = getImagingContent();

  return (
    <div className="fixed inset-0 bg-black/98 z-[130] flex flex-col p-12 overflow-hidden font-mono text-white selection:bg-white/20">

      <div className="flex justify-between items-center mb-12 border-b border-white/5 pb-8">
         <div>
            <h2 className="text-4xl font-black italic uppercase tracking-tighter">Radiology <span className="text-slate-500">Suite</span></h2>
            <div className="flex items-center gap-4 mt-2">
               <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{content.title}</span>
               <div className="w-1.5 h-1.5 rounded-full bg-medical-green animate-pulse"></div>
            </div>
         </div>
         <button onClick={onClose} className="p-4 bg-white/5 rounded-full hover:bg-white/10 transition-colors">✕</button>
      </div>

      <div className="flex-1 flex gap-16 overflow-hidden justify-center">

         {/* Imaging Viewport */}
         <div className="relative aspect-square h-full bg-[#050505] rounded-[3rem] border-4 border-slate-900 overflow-hidden group shadow-[0_0_100px_rgba(0,0,0,1)]">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] [background-size:20px_20px]"></div>

            {/* The Image (Stylized) */}
            <div className="absolute inset-0 flex items-center justify-center p-20">
               <motion.div
                 key={slice}
                 initial={{ opacity: 0.8 }} animate={{ opacity: 1 }}
                 className="w-full h-full relative"
               >
                  <div className="w-full h-full border-4 border-white/5 rounded-full relative overflow-hidden flex items-center justify-center">
                     <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.05)_0%,_transparent_70%)]"></div>
                     <Search size={200} className="text-white/5 rotate-[45deg]" />

                     {/* Dynamic Findings */}
                     {content.keySlices.includes(slice) && (
                        <motion.div
                          initial={{ opacity: 0 }} animate={{ opacity: findingVisible ? 1 : 0 }}
                          className="absolute top-1/3 right-1/4 w-32 h-32 bg-white/10 rounded-full blur-2xl border-4 border-white/20"
                        />
                     )}
                  </div>
               </motion.div>
            </div>

            {/* Viewport UI */}
            <div className="absolute top-10 left-12 text-[8px] font-bold text-slate-500 uppercase tracking-widest space-y-1">
               <div>Hosp: METRO CENTRAL</div>
               <div>Patient: {scenario?.id.toUpperCase()}</div>
               <div>Series: AXIAL LAVA</div>
            </div>

            <div className="absolute bottom-10 left-12 flex gap-8 items-end">
               <div className="text-center">
                  <div className="text-[10px] font-black text-white italic">SLICE</div>
                  <div className="text-4xl font-black text-white tabular-nums leading-none mt-1">{slice}</div>
               </div>
               <div className="h-10 w-px bg-white/10"></div>
               <div className="pb-1 text-[8px] font-black text-slate-500 uppercase">WW: 350 / WL: 40</div>
            </div>

            <div className="absolute inset-y-0 right-10 flex flex-col justify-center gap-4">
               <button onClick={() => setSlice(s => Math.min(60, s + 1))} className="p-3 bg-white/5 rounded-xl hover:bg-white/10"><ChevronUp /></button>
               <button onClick={() => setSlice(s => Math.max(1, s - 1))} className="p-3 bg-white/5 rounded-xl hover:bg-white/10"><ChevronDown /></button>
            </div>
         </div>

         {/* Interpretation Panel */}
         <div className="w-[450px] flex flex-col gap-8">
            <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 flex-1 flex flex-col">
               <div className="flex items-center gap-3 text-medical-cyan font-black uppercase tracking-widest text-[10px] mb-8">
                  <Info size={14} /> Radiologist Note
               </div>

               <div className="flex-1 text-sm font-medium text-white/70 leading-relaxed italic pr-4 overflow-y-auto scrollbar-thin">
                  {findingVisible ? content.finding : "Scroll through slices to perform secondary assessment. Highlight positive findings if visualized."}
               </div>

               <div className="mt-8 pt-8 border-t border-white/5">
                  <button
                    onMouseDown={() => setFindingVisible(true)}
                    onMouseUp={() => setFindingVisible(false)}
                    className={`w-full py-6 rounded-3xl font-black text-xs uppercase tracking-widest transition-all ${findingVisible ? 'bg-medical-cyan text-medical-dark shadow-lg' : 'bg-white/5 text-white/40 border border-white/5'}`}
                  >
                     {findingVisible ? 'RELEASE TO HIDE' : 'HOLD TO HIGHLIGHT PATHOLOGY'}
                  </button>
               </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-6 bg-white text-medical-dark font-black rounded-[2rem] hover:bg-medical-cyan transition-all uppercase tracking-[0.2em] text-xs shadow-2xl active:scale-95"
            >
               Return to Simulation
            </button>
         </div>

      </div>
    </div>
  );
};
