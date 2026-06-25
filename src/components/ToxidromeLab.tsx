import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Microscope, Eye, Wind, Droplet, AlertTriangle, CheckCircle2, FlaskConical } from 'lucide-react';

interface Toxidrome {
  id: string;
  name: string;
  pupils: 'Pinpoint' | 'Dilated' | 'Normal';
  skin: 'Dry/Hot' | 'Diaphoretic' | 'Normal';
  breath: 'Garlic' | 'Bitter Almonds' | 'Fruity' | 'Normal';
  hr: 'Brady' | 'Tachy' | 'Normal';
  antidote: string;
}

const TOXIDROMES: Toxidrome[] = [
  { id: 'organophosphate', name: 'Cholinergic (Organophosphate)', pupils: 'Pinpoint', skin: 'Diaphoretic', breath: 'Garlic', hr: 'Brady', antidote: 'ATROPINE' },
  { id: 'anticholinergic', name: 'Anticholinergic (Atropine/Benadryl)', pupils: 'Dilated', skin: 'Dry/Hot', breath: 'Normal', hr: 'Tachy', antidote: 'PHYSOSTIGMINE' },
  { id: 'sympathomimetic', name: 'Sympathomimetic (Cocaine/Meth)', pupils: 'Dilated', skin: 'Diaphoretic', breath: 'Normal', hr: 'Tachy', antidote: 'BENZODIAZEPINES' },
  { id: 'opioid', name: 'Opioid', pupils: 'Pinpoint', skin: 'Normal', breath: 'Normal', hr: 'Brady', antidote: 'NARCAN' }
];

export const ToxidromeLab: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { applyAction, patientState } = useStore();
  const [selectedTox, setSelectedTox] = useState<string | null>(null);
  const [result, setResult] = useState<'SUCCESS' | 'FAILURE' | null>(null);

  // Randomly pick a current toxidrome for the "challenge" if one isn't active
  const currentChallenge = TOXIDROMES[0]; // Logic would pick based on scenario

  const handleIdentify = () => {
    if (selectedTox === currentChallenge.id) {
        setResult('SUCCESS');
        applyAction(`ANTIDOTE_${currentChallenge.antidote}`);
    } else {
        setResult('FAILURE');
    }
  };

  return (
    <div className="fixed inset-0 bg-medical-dark/95 z-[160] flex items-center justify-center p-8 backdrop-blur-3xl">
      <div className="bg-medical-dark border border-white/10 rounded-[3rem] w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col h-[75vh]">

        <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/5">
           <div className="flex items-center gap-6">
              <div className="p-4 bg-medical-cyan/20 rounded-2xl">
                 <Microscope className="text-medical-cyan w-8 h-8" />
              </div>
              <div>
                 <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">Toxidrome <span className="text-medical-cyan">Analyzer</span></h2>
                 <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Toxicological Identification Challenge</p>
              </div>
           </div>
        </div>

        <div className="flex-1 p-12 overflow-y-auto">
           {result === 'SUCCESS' ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-8">
                 <div className="w-32 h-32 bg-medical-green/20 rounded-full flex items-center justify-center">
                    <CheckCircle2 size={64} className="text-medical-green" />
                 </div>
                 <div className="space-y-2">
                    <h3 className="text-3xl font-black text-white uppercase italic">Identification Confirmed</h3>
                    <p className="text-slate-400">Antidote {currentChallenge.antidote} authorized and administered.</p>
                 </div>
                 <button onClick={onClose} className="px-12 py-4 bg-medical-green text-medical-dark font-black rounded-2xl uppercase tracking-widest">Return to Mission</button>
              </div>
           ) : (
              <div className="grid grid-cols-12 gap-12">
                 <div className="col-span-5 space-y-6">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Clinical Findings</div>
                    <FindingItem icon={<Eye size={18} />} label="Pupillary Response" value={currentChallenge.pupils} />
                    <FindingItem icon={<Droplet size={18} />} label="Dermal State" value={currentChallenge.skin} />
                    <FindingItem icon={<Wind size={18} />} label="Breath Odor" value={currentChallenge.breath} />
                    <FindingItem icon={<Activity size={18} />} label="Heart Rate Trend" value={currentChallenge.hr} />
                 </div>

                 <div className="col-span-7 space-y-8">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Select Toxidrome Identification</div>
                    <div className="grid grid-cols-1 gap-3">
                       {TOXIDROMES.map(tox => (
                          <button
                            key={tox.id}
                            onClick={() => setSelectedTox(tox.id)}
                            className={`p-5 rounded-2xl border-2 transition-all text-left flex justify-between items-center ${selectedTox === tox.id ? 'bg-medical-cyan border-white' : 'bg-white/5 border-white/5 hover:border-white/10'}`}
                          >
                             <span className={`text-sm font-black uppercase italic ${selectedTox === tox.id ? 'text-medical-dark' : 'text-slate-300'}`}>{tox.name}</span>
                             {selectedTox === tox.id && <FlaskConical size={18} className="text-medical-dark" />}
                          </button>
                       ))}
                    </div>

                    <button
                      onClick={handleIdentify}
                      disabled={!selectedTox}
                      className="w-full py-6 bg-white text-medical-dark font-black rounded-2xl uppercase tracking-[0.2em] shadow-xl disabled:opacity-20 active:scale-95 transition-all"
                    >
                       Confirm Identification
                    </button>

                    {result === 'FAILURE' && (
                       <div className="flex items-center gap-3 text-medical-red justify-center animate-bounce">
                          <AlertTriangle size={18} />
                          <span className="text-[10px] font-black uppercase tracking-widest">Incorrect ID - High Risk of Adverse Drug Event</span>
                       </div>
                    )}
                 </div>
              </div>
           )}
        </div>

      </div>
    </div>
  );
};

const FindingItem = ({ icon, label, value }: any) => (
   <div className="bg-white/5 p-5 rounded-2xl border border-white/5 flex items-center gap-4">
      <div className="p-2 bg-white/5 rounded-lg text-medical-cyan">{icon}</div>
      <div>
         <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{label}</div>
         <div className="text-sm font-black text-white uppercase italic">{value}</div>
      </div>
   </div>
);
