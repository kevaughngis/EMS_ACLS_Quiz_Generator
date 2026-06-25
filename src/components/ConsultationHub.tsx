import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Users, Shield, Send, Radio } from 'lucide-react';
import { getClinicalChatResponse } from '../engine/GeminiService';

export const ConsultationHub: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { scenario, logs, patientState } = useStore();
  const [selectedSpecialist, setSelectedSpecialist] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<{role: string, text: string}[]>([]);
  const [message, setMessage] = useState('');
  const [isCalling, setIsCalling] = useState(false);

  const specialists = [
    { id: 'cardio', name: 'Interventional Cardiology', icon: <Shield className="text-medical-red" /> },
    { id: 'neuro', name: 'Stroke Team / Neurology', icon: <Shield className="text-medical-blue" /> },
    { id: 'tox', name: 'Poison Control / Toxicology', icon: <Shield className="text-medical-yellow" /> },
    { id: 'med_control', name: 'Online Medical Control', icon: <Radio className="text-medical-green" /> }
  ];

  const handleConsult = async () => {
    if (!message.trim() || !selectedSpecialist) return;
    const userMsg = message;
    setMessage('');
    setChatHistory(prev => [...prev, { role: 'Me', text: userMsg }]);

    setIsCalling(true);
    const specialist = specialists.find(s => s.id === selectedSpecialist);
    const context = `Specialist Consult: ${specialist?.name}. Scenario: ${scenario?.title}. Vitals: HR ${patientState?.vitals.hr}, MAP ${patientState?.vitals.map}. Logs: ${logs.slice(-3).join(', ')}`;

    const response = await getClinicalChatResponse(`Expert ${specialist?.name}`, userMsg, context);
    setIsCalling(false);
    setChatHistory(prev => [...prev, { role: specialist?.name || 'Specialist', text: response }]);
    useStore.getState().applyAction(`CONSULTED_${specialist?.id.toUpperCase()}`);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/98 z-[130] flex items-center justify-center p-12 backdrop-blur-3xl">
      <div className="bg-medical-dark border border-white/10 rounded-[3rem] w-full max-w-6xl h-[80vh] flex overflow-hidden shadow-2xl">

        {/* Contacts Sidebar */}
        <div className="w-80 bg-black/40 border-r border-white/5 flex flex-col p-8">
           <div className="flex items-center gap-3 text-medical-cyan font-black uppercase tracking-widest text-[10px] mb-8">
              <Phone size={14} /> Directory
           </div>
           <div className="flex flex-col gap-3">
              {specialists.map(s => (
                 <button
                   key={s.id}
                   onClick={() => setSelectedSpecialist(s.id)}
                   className={`p-5 rounded-2xl border transition-all text-left flex items-center gap-4 ${selectedSpecialist === s.id ? 'bg-medical-cyan border-medical-cyan text-medical-dark' : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'}`}
                 >
                    {s.icon}
                    <div className="text-[10px] font-black uppercase tracking-tighter leading-tight">{s.name}</div>
                 </button>
              ))}
           </div>
           <button onClick={onClose} className="mt-auto w-full py-4 bg-white/5 text-slate-500 rounded-xl font-bold uppercase text-[10px] hover:text-white transition-colors">Disconnect</button>
        </div>

        {/* Chat Interface */}
        <div className="flex-1 flex flex-col p-12">
           <AnimatePresence mode="wait">
              {selectedSpecialist ? (
                 <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col gap-8">
                    <div className="flex justify-between items-center border-b border-white/5 pb-6">
                       <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Consultation: <span className="text-medical-cyan">{specialists.find(s => s.id === selectedSpecialist)?.name}</span></h2>
                       <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-medical-green animate-pulse"></div>
                          <span className="text-[8px] font-black text-medical-green uppercase tracking-widest">Secure Link Active</span>
                       </div>
                    </div>

                    <div className="flex-1 bg-black/20 rounded-3xl p-8 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-white/10">
                       {chatHistory.length === 0 && (
                          <div className="text-center text-slate-600 italic mt-20">"Introduce yourself and provide an SBAR report to the specialist."</div>
                       )}
                       {chatHistory.map((m, i) => (
                          <div key={i} className={`flex flex-col ${m.role === 'Me' ? 'items-end' : 'items-start'}`}>
                             <div className="text-[8px] font-black uppercase text-slate-500 mb-1">{m.role}</div>
                             <div className={`px-6 py-4 rounded-2xl max-w-[70%] text-sm font-medium ${m.role === 'Me' ? 'bg-medical-cyan text-medical-dark' : 'bg-white/5 border border-white/10 text-white leading-relaxed italic'}`}>
                                {m.text}
                             </div>
                          </div>
                       ))}
                       {isCalling && <div className="text-xs font-black text-medical-cyan animate-pulse">Specialist is responding...</div>}
                    </div>

                    <div className="flex gap-4">
                       <input
                         value={message}
                         onChange={(e) => setMessage(e.target.value)}
                         onKeyDown={(e) => e.key === 'Enter' && handleConsult()}
                         placeholder="Transmit clinical data or request orders..."
                         className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-white placeholder:text-slate-700 focus:outline-none focus:border-medical-cyan transition-colors font-medium"
                       />
                       <button
                         onClick={handleConsult}
                         className="p-5 bg-medical-cyan text-medical-dark rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg"
                       >
                          <Send size={24} />
                       </button>
                    </div>
                 </motion.div>
              ) : (
                 <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <Phone size={64} className="text-slate-800 mb-8" />
                    <h3 className="text-xl font-black text-white/20 uppercase tracking-[0.3em]">Select a specialist to initiate consult</h3>
                 </div>
              )}
           </AnimatePresence>
        </div>

      </div>
    </div>
  );
};
