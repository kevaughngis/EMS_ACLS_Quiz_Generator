import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Users, History, Info, Send } from 'lucide-react';
import { getClinicalChatResponse } from '../engine/GeminiService';

export const CommunicationHub: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { scenario, logs, patientState } = useStore();
  const [activeTab, setActiveTab] = useState<'SAMPLE' | 'OPQRST' | 'BYSTANDER' | 'CHAT'>('SAMPLE');

  const sampleHistory = {
    Symptoms: "Chest pain radiating to left arm",
    Allergies: "NKDA (No known drug allergies)",
    Medications: "Metoprolol, Aspirin daily",
    PastHistory: "HTN, 2x Stents in 2019",
    LastMeal: "Breakfast 2 hours ago",
    Events: "Sudden onset while walking dog"
  };

  const opqrstHistory = {
    Onset: "Sudden onset during physical activity",
    Provocation: "Worsens with deep breaths, no relief with rest",
    Quality: "Sharp, pressure-like sensation",
    Radiation: "Radiates to left jaw and shoulder",
    Severity: "8/10 on pain scale",
    Time: "Began approximately 25 minutes ago"
  };

  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: string, text: string }[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;
    const userMsg = chatMessage;
    setChatMessage('');
    setChatHistory(prev => [...prev, { role: 'You', text: userMsg }]);

    setIsTyping(true);
    const context = `Scenario: ${scenario?.title}. Patient is ${patientState?.consciousness}. Rhythm is ${patientState?.rhythm}. Vital signs are HR ${patientState?.vitals.hr}, SpO2 ${patientState?.vitals.spo2}.`;
    const response = await getClinicalChatResponse("Patient's spouse (worried and anxious)", userMsg, context);
    setIsTyping(false);

    setChatHistory(prev => [...prev, { role: 'Spouse', text: response }]);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/98 z-[90] flex flex-col p-12 overflow-hidden font-sans">
      <div className="flex justify-between items-start mb-12">
        <div>
          <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter flex items-center gap-4">
            <MessageCircle className="text-medical-cyan w-10 h-10" /> Communication <span className="text-medical-cyan">Hub</span>
          </h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-2">Information Gathering & History</p>
        </div>
        <button onClick={onClose} className="p-4 bg-white/5 rounded-full hover:bg-white/10 text-white transition-colors">✕</button>
      </div>

      <div className="flex gap-8 flex-1 overflow-hidden">
        {/* Navigation */}
        <div className="w-64 flex flex-col gap-2">
           <NavButton
             active={activeTab === 'SAMPLE'}
             onClick={() => setActiveTab('SAMPLE')}
             icon={<History size={18}/>}
             label="Medical History"
             sub="SAMPLE Protocol"
           />
           <NavButton
             active={activeTab === 'OPQRST'}
             onClick={() => setActiveTab('OPQRST')}
             icon={<Info size={18}/>}
             label="Pain Assessment"
             sub="OPQRST Protocol"
           />
           <NavButton
             active={activeTab === 'BYSTANDER'}
             onClick={() => setActiveTab('BYSTANDER')}
             icon={<Users size={18}/>}
             label="Bystander Report"
             sub="Family & Witnesses"
           />
           <NavButton
             active={activeTab === 'CHAT'}
             onClick={() => setActiveTab('CHAT')}
             icon={<MessageCircle size={18}/>}
             label="Direct Dialogue"
             sub="AI Real-time Chat"
           />
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white/5 border border-white/10 rounded-3xl p-10 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
           <AnimatePresence mode="wait">
             {activeTab === 'SAMPLE' && (
               <motion.div
                 key="sample"
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
                 className="grid grid-cols-2 gap-8"
               >
                  {Object.entries(sampleHistory).map(([key, val]) => (
                    <div key={key} className="bg-black/40 p-6 rounded-2xl border border-white/5">
                       <div className="text-[10px] font-black text-medical-cyan uppercase tracking-[0.2em] mb-2">[{key[0]}] {key}</div>
                       <div className="text-white font-medium italic">"{val}"</div>
                    </div>
                  ))}
               </motion.div>
             )}

             {activeTab === 'OPQRST' && (
               <motion.div
                 key="opqrst"
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
                 className="grid grid-cols-2 gap-8"
               >
                  {Object.entries(opqrstHistory).map(([key, val]) => (
                    <div key={key} className="bg-black/40 p-6 rounded-2xl border border-white/5">
                       <div className="text-[10px] font-black text-medical-yellow uppercase tracking-[0.2em] mb-2">[{key[0]}] {key}</div>
                       <div className="text-white font-medium italic">"{val}"</div>
                    </div>
                  ))}
               </motion.div>
             )}

             {activeTab === 'CHAT' && (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col h-full gap-6"
                >
                   <div className="flex-1 bg-black/40 rounded-3xl p-8 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-white/10">
                      {chatHistory.length === 0 && (
                        <div className="text-center text-slate-500 italic mt-20">Start a conversation with the spouse or patient.</div>
                      )}
                      {chatHistory.map((msg, i) => (
                        <div key={i} className={`flex flex-col ${msg.role === 'You' ? 'items-end' : 'items-start'}`}>
                           <div className="text-[10px] font-black uppercase text-slate-500 mb-1">{msg.role}</div>
                           <div className={`px-5 py-3 rounded-2xl max-w-[80%] text-sm font-medium ${msg.role === 'You' ? 'bg-medical-cyan text-medical-dark' : 'bg-white/5 border border-white/10 text-white'}`}>
                              {msg.text}
                           </div>
                        </div>
                      ))}
                      {isTyping && <div className="text-[10px] font-bold text-medical-cyan animate-pulse">Spouse is typing...</div>}
                   </div>

                   <div className="flex gap-4">
                      <input
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Ask a question or give an instruction..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-medical-cyan transition-colors"
                      />
                      <button
                        onClick={handleSendMessage}
                        className="p-4 bg-medical-cyan text-medical-dark rounded-2xl hover:scale-105 active:scale-95 transition-all"
                      >
                         <Send size={20} />
                      </button>
                   </div>
                </motion.div>
             )}

             {activeTab === 'BYSTANDER' && (
                <motion.div
                  key="bystander"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                   <div className="flex gap-6 items-start bg-blue-900/10 border border-blue-500/20 p-8 rounded-3xl">
                      <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                         <Users size={32} />
                      </div>
                      <div>
                         <div className="text-blue-400 font-bold uppercase text-xs mb-1">Witness: Spouse</div>
                         <div className="text-xl text-white/90 leading-relaxed font-serif italic">
                            "He just clutched his chest and fell over. I called 911 immediately and started pushing on his chest like I saw on TV."
                         </div>
                      </div>
                   </div>
                </motion.div>
             )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label, sub }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-4 p-5 rounded-2xl transition-all text-left border ${active ? 'bg-medical-cyan border-medical-cyan text-medical-dark' : 'bg-white/5 border-white/5 text-white/50 hover:bg-white/10'}`}
  >
    <div className={`${active ? 'bg-medical-dark/20' : 'bg-white/5'} p-3 rounded-xl`}>{icon}</div>
    <div>
      <div className="text-xs font-black uppercase tracking-tighter">{label}</div>
      <div className={`text-[10px] font-bold uppercase opacity-50 ${active ? 'text-medical-dark' : 'text-slate-500'}`}>{sub}</div>
    </div>
  </button>
);
