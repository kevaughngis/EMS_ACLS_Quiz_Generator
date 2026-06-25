import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Clipboard, CheckCircle2, AlertCircle, Send } from 'lucide-react';
import { getScenarioFeedback } from '../engine/GeminiService';

export const PCRForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { logs, scenario } = useStore();
  const [formData, setFormData] = useState({
    narrative: '',
    interventions: '',
    outcome: ''
  });
  const [grading, setGrading] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    const pcrContext = `User Narrative: ${formData.narrative}. Recorded Interventions: ${formData.interventions}. Outcome: ${formData.outcome}. Actual Logs: ${logs.join(', ')}`;
    const grade = await getScenarioFeedback(`PCR Audit for ${scenario?.title}`, [pcrContext]);
    setGrading(grade);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/98 z-[150] flex items-center justify-center p-12 backdrop-blur-3xl">
      <div className="bg-medical-dark border-2 border-white/10 rounded-[4rem] w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden shadow-2xl">

        <div className="px-16 py-12 bg-white/5 border-b border-white/5 flex justify-between items-center">
           <div className="flex items-center gap-6">
              <div className="p-4 bg-medical-cyan/20 rounded-2xl">
                 <FileText className="text-medical-cyan w-8 h-8" />
              </div>
              <div>
                 <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">Clinical <span className="text-medical-cyan">Documentation</span></h2>
                 <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Patient Care Report (PCR)</p>
              </div>
           </div>
           <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors uppercase tracking-widest text-[10px] font-black">Close</button>
        </div>

        <div className="flex-1 p-16 flex gap-12 overflow-hidden">

           {/* Form Area */}
           <div className="flex-1 space-y-8 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-white/10">
              <div className="space-y-4">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Clinical Narrative</label>
                 <textarea
                   value={formData.narrative}
                   onChange={(e) => setFormData({...formData, narrative: e.target.value})}
                   placeholder="Describe the clinical presentation and initial findings..."
                   className="w-full h-40 bg-white/5 border border-white/10 rounded-2xl p-6 text-white placeholder:text-slate-700 focus:outline-none focus:border-medical-cyan transition-colors font-medium text-sm leading-relaxed"
                 />
              </div>

              <div className="space-y-4">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Intervention Summary</label>
                 <textarea
                   value={formData.interventions}
                   onChange={(e) => setFormData({...formData, interventions: e.target.value})}
                   placeholder="List all medications, procedures, and timing..."
                   className="w-full h-40 bg-white/5 border border-white/10 rounded-2xl p-6 text-white placeholder:text-slate-700 focus:outline-none focus:border-medical-cyan transition-colors font-medium text-sm leading-relaxed"
                 />
              </div>

              <div className="pt-4">
                 <button
                   onClick={handleSubmit}
                   disabled={loading}
                   className="w-full py-6 bg-medical-cyan text-medical-dark font-black rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl flex items-center justify-center gap-4 uppercase tracking-widest"
                 >
                    {loading ? 'AUDITING...' : 'Submit PCR for AI Grading'}
                    {!loading && <Send size={20} />}
                 </button>
              </div>
           </div>

           {/* AI Grading Sidebar */}
           <div className="w-[450px] bg-black/40 border border-white/5 rounded-[3rem] p-10 flex flex-col overflow-hidden">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                 <Clipboard size={16}/> QA Audit Results
              </h3>

              <div className="flex-1 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-white/10 text-white/80 font-medium text-xs leading-relaxed italic whitespace-pre-wrap">
                 {grading || "Awaiting submission... The AI preceptor will audit your narrative against the actual simulation logs for discrepancies, missing interventions, and accuracy."}
              </div>

              {grading && (
                 <div className="mt-8 p-6 bg-medical-green/10 border border-medical-green/20 rounded-2xl flex items-center gap-4">
                    <CheckCircle2 className="text-medical-green" />
                    <div className="text-[10px] font-black text-medical-green uppercase">Quality Assurance Review Complete</div>
                 </div>
              )}
           </div>

        </div>
      </div>
    </div>
  );
};
