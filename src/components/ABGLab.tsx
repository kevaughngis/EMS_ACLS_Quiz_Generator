import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { FlaskConical, Beaker, CheckCircle2, AlertTriangle, ChevronRight } from 'lucide-react';

export const ABGLab: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { scenario } = useStore();
  const [selection, setSelection] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const values = {
    ph: 7.24,
    pco2: 58,
    po2: 62,
    hco3: 24,
    baseExcess: -4
  };

  const options = [
    "Respiratory Acidosis",
    "Metabolic Acidosis",
    "Respiratory Alkalosis",
    "Compensated Metabolic Alkalosis"
  ];

  const handleVerify = () => {
    if (selection === "Respiratory Acidosis") {
        setFeedback("CORRECT: Low pH with elevated PCO2 and normal HCO3 indicates an uncompensated respiratory acidosis.");
    } else {
        setFeedback("INCORRECT: Analyze the relationship between pH and PCO2.");
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/98 z-[120] flex items-center justify-center p-12 backdrop-blur-3xl">
      <div className="bg-[#0f172a] border-2 border-white/10 rounded-[3rem] w-full max-w-5xl h-[75vh] flex shadow-2xl overflow-hidden font-mono">

        {/* Lab Results */}
        <div className="flex-1 bg-black p-12 flex flex-col gap-10">
           <div className="flex items-center gap-4 text-medical-yellow">
              <FlaskConical size={24} />
              <h2 className="text-3xl font-black uppercase italic tracking-tighter">Blood Gas <span className="opacity-50 text-white">Analyzer</span></h2>
           </div>

           <div className="grid grid-cols-2 gap-8">
              <LabValue label="pH (Arterial)" value={values.ph} normal="7.35 - 7.45" />
              <LabValue label="pCO2" value={values.pco2} unit="mmHg" normal="35 - 45" isHigh />
              <LabValue label="pO2" value={values.po2} unit="mmHg" normal="80 - 100" isLow />
              <LabValue label="HCO3" value={values.hco3} unit="mEq/L" normal="22 - 26" />
           </div>

           <div className="mt-auto p-6 bg-white/5 rounded-2xl border border-white/5 text-[10px] text-slate-500 uppercase leading-relaxed">
              Interpret the acid-base status. Consider compensation mechanisms (Respiratory vs. Metabolic).
           </div>
        </div>

        {/* Interpretation Panel */}
        <div className="w-[450px] bg-white/5 border-l border-white/10 p-12 flex flex-col">
           <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Interpret Results</h3>

           <div className="flex-1 flex flex-col gap-3">
              {options.map(opt => (
                 <button
                   key={opt}
                   onClick={() => setSelection(opt)}
                   className={`p-5 rounded-2xl text-left border-2 transition-all text-xs font-black uppercase tracking-tight flex justify-between items-center ${selection === opt ? 'bg-medical-yellow border-medical-yellow text-medical-dark' : 'bg-white/5 border-white/5 text-white/40 hover:border-white/10'}`}
                 >
                    {opt}
                    {selection === opt && <ChevronRight size={16}/>}
                 </button>
              ))}
           </div>

           <div className="mt-8 space-y-4">
              <AnimatePresence>
                 {feedback && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className={`p-6 rounded-2xl text-[10px] font-bold leading-relaxed border ${feedback.includes('CORRECT') ? 'bg-medical-green/10 border-medical-green/20 text-medical-green' : 'bg-medical-red/10 border-medical-red/20 text-medical-red'}`}
                    >
                       {feedback}
                    </motion.div>
                 )}
              </AnimatePresence>

              <button
                onClick={handleVerify}
                className="w-full py-6 bg-medical-yellow text-medical-dark font-black rounded-3xl hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-xs"
              >
                 Verify Interpretation
              </button>
              <button
                onClick={onClose}
                className="w-full py-4 text-[10px] font-bold text-slate-500 hover:text-white uppercase tracking-widest"
              >
                 Return to Lab
              </button>
           </div>
        </div>

      </div>
    </div>
  );
};

const LabValue = ({ label, value, unit, normal, isHigh, isLow }: any) => (
  <div className={`p-6 rounded-3xl border-2 transition-all ${isHigh || isLow ? 'bg-medical-red/5 border-medical-red/20' : 'bg-white/5 border-white/5'}`}>
     <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</div>
     <div className="flex items-end gap-2">
        <div className={`text-4xl font-black ${isHigh || isLow ? 'text-medical-red' : 'text-white'}`}>{value}</div>
        <div className="text-[10px] font-bold text-slate-700 mb-1">{unit}</div>
     </div>
     <div className="mt-3 flex justify-between items-center">
        <div className="text-[8px] font-bold text-slate-600 uppercase">Ref Range: {normal}</div>
        {(isHigh || isLow) && <AlertTriangle size={12} className="text-medical-red" />}
     </div>
  </div>
);
