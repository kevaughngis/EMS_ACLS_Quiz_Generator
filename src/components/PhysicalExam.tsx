import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Wind, Eye, MousePointer2, Volume2 } from 'lucide-react';
import { soundEngine } from '../engine/SoundEngine';

export const PhysicalExam: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { patientState, activePatientIndex, secondaryPatientState } = useStore();
  const [activeTool, setActiveTool] = useState<'STETHOSCOPE' | 'LIGHT' | 'PULSE'>('STETHOSCOPE');

  const currentPatient = activePatientIndex === 0 ? patientState : secondaryPatientState;

  if (!currentPatient) return null;

  return (
    <div className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-xl flex items-center justify-center p-12">
      <div className="bg-medical-dark border border-white/10 rounded-[3rem] w-full max-w-5xl h-[80vh] flex flex-col overflow-hidden shadow-2xl">

        <div className="p-10 bg-white/5 border-b border-white/5 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Physical <span className="text-medical-cyan">Assessment</span></h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Hands-on Diagnostic Exam</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">✕ CLOSE</button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar Tools */}
          <div className="w-24 bg-black/20 border-r border-white/5 flex flex-col gap-4 p-4">
             <ToolBtn active={activeTool === 'STETHOSCOPE'} onClick={() => setActiveTool('STETHOSCOPE')} icon={<Volume2 />} label="Auscultation" />
             <ToolBtn active={activeTool === 'LIGHT'} onClick={() => setActiveTool('LIGHT')} icon={<Eye />} label="Pupils" />
             <ToolBtn active={activeTool === 'PULSE'} onClick={() => setActiveTool('PULSE')} icon={<Activity />} label="Palpation" />
          </div>

          {/* Main Workspace */}
          <div className="flex-1 p-12 relative flex items-center justify-center bg-[radial-gradient(circle_at_center,_rgba(0,229,255,0.03)_0%,_transparent_70%)]">

             {activeTool === 'STETHOSCOPE' && (
                <div className="grid grid-cols-2 gap-12 w-full">
                   <div className="space-y-8">
                      <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">Lung Fields</h3>
                      <div className="grid grid-cols-2 gap-4">
                         <AuscultationPoint label="Upper Right" sound={currentPatient.physicalExam.lungSounds} />
                         <AuscultationPoint label="Upper Left" sound={currentPatient.physicalExam.lungSounds} />
                         <AuscultationPoint label="Lower Right" sound={currentPatient.physicalExam.lungSounds} />
                         <AuscultationPoint label="Lower Left" sound={currentPatient.physicalExam.lungSounds} />
                      </div>
                   </div>
                   <div className="space-y-8">
                      <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">Cardiac Points</h3>
                      <div className="grid grid-cols-2 gap-4">
                         <AuscultationPoint label="Aortic" sound={currentPatient.physicalExam.heartSounds} isHeart />
                         <AuscultationPoint label="Pulmonic" sound={currentPatient.physicalExam.heartSounds} isHeart />
                         <AuscultationPoint label="Tricuspid" sound={currentPatient.physicalExam.heartSounds} isHeart />
                         <AuscultationPoint label="Mitral" sound={currentPatient.physicalExam.heartSounds} isHeart />
                      </div>
                   </div>
                </div>
             )}

             {activeTool === 'LIGHT' && (
                <div className="flex gap-12 items-center">
                   <EyeExam label="Left Eye" state={currentPatient.physicalExam.pupils} />
                   <EyeExam label="Right Eye" state={currentPatient.physicalExam.pupils} />
                </div>
             )}

             {activeTool === 'PULSE' && (
                <div className="text-center space-y-12">
                   <div className="bg-white/5 p-12 rounded-[3rem] border border-white/10 inline-block">
                      <Activity className="w-24 h-24 text-medical-red animate-pulse mx-auto mb-6" />
                      <div className="text-4xl font-black text-white italic uppercase tracking-tighter">Capillary Refill</div>
                      <div className="text-6xl font-mono font-black text-medical-cyan mt-4">{currentPatient.physicalExam.capRefill}s</div>
                   </div>
                   <div className="text-slate-500 font-medium italic">"Delayed refill indicates poor peripheral perfusion."</div>
                </div>
             )}

          </div>
        </div>
      </div>
    </div>
  );
};

const ToolBtn = ({ active, onClick, icon, label }: any) => (
  <button
    onClick={onClick}
    className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 transition-all ${active ? 'bg-medical-cyan text-medical-dark shadow-lg' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
  >
    {icon}
    <span className="text-[8px] font-black uppercase tracking-tighter">{label}</span>
  </button>
);

const AuscultationPoint = ({ label, sound, isHeart }: any) => {
    const [listening, setListening] = useState(false);
    return (
        <button
            onMouseDown={() => setListening(true)}
            onMouseUp={() => setListening(false)}
            onMouseLeave={() => setListening(false)}
            className={`h-32 bg-black/40 border-2 rounded-3xl flex flex-col items-center justify-center gap-4 transition-all ${listening ? 'border-medical-cyan shadow-[0_0_20px_rgba(0,229,255,0.2)]' : 'border-white/5 hover:border-white/20'}`}
        >
            {isHeart ? <Activity className={listening ? 'text-medical-cyan' : 'text-slate-700'} /> : <Wind className={listening ? 'text-medical-cyan' : 'text-slate-700'} />}
            <div className="text-center">
                <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">{label}</div>
                <div className="text-xs font-bold text-white uppercase mt-1">{listening ? sound : '---'}</div>
            </div>
            {listening && <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity }} className="w-2 h-2 rounded-full bg-medical-cyan" />}
        </button>
    );
};

const EyeExam = ({ label, state }: any) => {
    const [lightOn, setLightOn] = useState(false);

    // PERRL: Reacts to light (constricts)
    const getPupilSize = () => {
        if (state === 'PERRL') return lightOn ? 'w-4 h-4' : 'w-10 h-10';
        if (state === 'FIXED_DILATED') return 'w-16 h-16';
        if (state === 'PINPOINT') return 'w-2 h-2';
        return 'w-8 h-8';
    };

    return (
        <div className="flex flex-col items-center gap-8">
            <div className="w-48 h-48 bg-slate-200 rounded-full border-8 border-slate-300 relative overflow-hidden flex items-center justify-center shadow-inner">
                {/* Iris */}
                <div className="w-40 h-40 bg-blue-600 rounded-full border-4 border-blue-700 shadow-2xl relative overflow-hidden">
                   <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.2)_0%,_transparent_70%)]"></div>
                   {/* Pupil */}
                   <motion.div
                     animate={{
                         width: state === 'FIXED_DILATED' ? 64 : (lightOn ? 8 : 40),
                         height: state === 'FIXED_DILATED' ? 64 : (lightOn ? 8 : 40)
                     }}
                     className="bg-black rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-inner"
                   />
                </div>
                {/* Corneal Reflex */}
                <div className="absolute top-1/4 right-1/4 w-4 h-4 bg-white/40 rounded-full blur-[1px]"></div>

                {/* Light Beam Overlay */}
                {lightOn && <div className="absolute inset-0 bg-yellow-400/20 pointer-events-none"></div>}
            </div>

            <div className="text-center">
                <div className="text-sm font-black text-white uppercase tracking-widest mb-4">{label}</div>
                <button
                  onMouseDown={() => setLightOn(true)}
                  onMouseUp={() => setLightOn(false)}
                  onMouseLeave={() => setLightOn(false)}
                  className={`px-8 py-3 rounded-xl border-2 font-black text-xs uppercase tracking-widest transition-all ${lightOn ? 'bg-yellow-400 border-white text-medical-dark' : 'bg-white/5 border-yellow-400/40 text-yellow-400'}`}
                >
                    Test Light Reflex
                </button>
            </div>
        </div>
    );
};
