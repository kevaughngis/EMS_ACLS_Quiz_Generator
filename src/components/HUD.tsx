import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import SimulationView from './SimulationView';
import ECGMonitor from './ECGMonitor';
import AnatomyLesson from './AnatomyLesson';
import { getScenarioFeedback } from '../engine/GeminiService';
import { Activity, Heart, Wind, Zap, Thermometer, FlaskConical, ClipboardList, BookOpen, MessageSquare, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const HUD = () => {
  const { patientState, logs, applyAction, tick, scenario, studyMode, toggleStudyMode } = useStore();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    const interval = setInterval(tick, 100);
    return () => clearInterval(interval);
  }, [tick]);

  if (!patientState) return (
    <div className="flex items-center justify-center h-screen bg-medical-dark overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#00e5ff_1px,transparent_1px)] [background-size:20px_20px]"></div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative flex flex-col gap-6 p-12 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl shadow-2xl"
      >
        <div className="flex flex-col items-center mb-8">
            <Activity className="text-medical-cyan w-16 h-16 mb-4 animate-pulse" />
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
                Advanced <span className="text-medical-cyan">Clinical</span> Tutor
            </h1>
            <div className="h-1 w-24 bg-medical-cyan mt-2 rounded-full shadow-[0_0_15px_rgba(0,229,255,0.5)]"></div>
        </div>

        <ProtocolButton
          onClick={() => useStore.getState().startScenario('acls-vf-1')}
          title="Adult Cardiac Arrest"
          subtitle="ACLS Algorithm • VF/pVT"
          color="border-medical-red hover:bg-medical-red/10"
          accent="bg-medical-red"
        />
        <ProtocolButton
          onClick={() => useStore.getState().startScenario('pals-brady-1')}
          title="Pediatric Bradycardia"
          subtitle="PALS Algorithm • Impaired Perfusion"
          color="border-medical-blue hover:bg-medical-blue/10"
          accent="bg-medical-blue"
        />
        <ProtocolButton
          onClick={() => useStore.getState().startScenario('bls-unresponsive-1')}
          title="Basic Life Support"
          subtitle="CPR & AED • Unresponsive Patient"
          color="border-medical-green hover:bg-medical-green/10"
          accent="bg-medical-green"
        />
        <ProtocolButton
          onClick={() => useStore.getState().startScenario('nrp-apnea-1')}
          title="Neonatal Resuscitation"
          subtitle="NRP Algorithm • Birth Apnea"
          color="border-medical-yellow hover:bg-medical-yellow/10"
          accent="bg-medical-yellow"
        />
      </motion.div>
    </div>
  );

  const handleAssess = (part: string) => {
    applyAction(`ASSESS_${part}`);
  };

  const showAIReview = async () => {
    setLoadingAI(true);
    const result = await getScenarioFeedback(scenario?.protocol || 'ACLS', logs);
    setFeedback(result);
    setLoadingAI(false);
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden text-white font-sans selection:bg-medical-cyan/30">
      <SimulationView onAssess={handleAssess} />

      {/* CRT Overlay Effect - Simplified but effective */}
      <div className="pointer-events-none absolute inset-0 z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,3px_100%]"></div>

      {/* Top HUD - Scenario Info */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-40"
      >
        <div className="flex gap-4">
            <div className="p-3 bg-medical-dark/80 backdrop-blur-md rounded-xl border border-white/10 shadow-xl">
                <h1 className="text-2xl font-black text-medical-cyan tracking-tighter uppercase italic leading-none">
                    ACLS <span className="text-white opacity-50 font-light">SIM</span>
                </h1>
                <p className="text-[10px] font-bold opacity-40 mt-1 uppercase tracking-widest">{scenario?.title}</p>
            </div>
        </div>

        <div className="flex gap-3 items-center">
          <HUDButton
            onClick={showAIReview}
            isLoading={loadingAI}
            variant="success"
            icon={<MessageSquare size={16} />}
          >
            {loadingAI ? 'ANALYZING...' : 'AI DEBRIEF'}
          </HUDButton>

          <HUDButton
            onClick={toggleStudyMode}
            variant="primary"
            icon={<BookOpen size={16} />}
          >
            STUDY MODE
          </HUDButton>

          <div className="bg-medical-dark/80 backdrop-blur-md px-6 py-2 rounded-xl border border-white/10 shadow-xl flex flex-col items-end min-w-[120px]">
            <div className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Elapsed Time</div>
            <div className="text-2xl font-mono font-black text-medical-yellow tabular-nums">02:45</div>
          </div>
        </div>
      </motion.div>

      {/* Left HUD - Vital Signs Monitor */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="absolute top-28 left-6 w-80 flex flex-col gap-4 z-40"
      >
        <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black/40 backdrop-blur-xl">
            <div className="bg-white/5 px-4 py-2 flex justify-between items-center border-b border-white/5">
                <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-medical-cyan">
                    <Activity size={12} /> Lead II Monitor
                </div>
                <div className="text-[10px] font-bold opacity-30 uppercase tracking-widest">x1.0 Gain</div>
            </div>
            <ECGMonitor rhythm={patientState.rhythm} hr={patientState.vitals.hr} />
            <div className="p-6 bg-black/20 flex items-center justify-between">
                <div>
                    <div className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Heart Rate</div>
                    <div className={cn(
                        "text-5xl font-black font-mono transition-colors",
                        patientState.vitals.hr > 150 || patientState.vitals.hr < 40 ? "text-medical-red animate-pulse" : "text-medical-green"
                    )}>
                        {Math.round(patientState.vitals.hr)}
                        <span className="text-sm font-normal opacity-50 ml-1 italic uppercase">bpm</span>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Rhythm</div>
                    <div className="text-sm font-bold text-white/80">{patientState.rhythm}</div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <VitalCard
            label="SpO2"
            value={patientState.vitals.spo2}
            unit="%"
            color="text-medical-cyan"
            icon={<Wind size={16}/>}
            isCritical={patientState.vitals.spo2 < 90}
          />
          <VitalCard
            label="MAP"
            value={patientState.vitals.map}
            unit="mmHg"
            color="text-medical-red"
            icon={<Activity size={16}/>}
            isCritical={patientState.vitals.map < 60 || patientState.vitals.map > 120}
          />
          <VitalCard
            label="ETCO2"
            value={patientState.vitals.etco2}
            unit="mmHg"
            color="text-medical-yellow"
            icon={<FlaskConical size={16}/>}
            isCritical={patientState.vitals.etco2 < 10 || patientState.vitals.etco2 > 50}
          />
          <VitalCard
            label="TEMP"
            value={patientState.vitals.temp}
            unit="°C"
            color="text-medical-blue"
            icon={<Thermometer size={16}/>}
            isCritical={patientState.vitals.temp < 35}
          />
        </div>
      </motion.div>

      {/* Right HUD - Actions & Logs */}
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="absolute top-28 right-6 w-80 flex flex-col gap-6 h-[calc(100vh-140px)] z-40"
      >
        <div className="bg-medical-dark/60 border border-white/10 rounded-2xl backdrop-blur-xl flex-1 flex flex-col shadow-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-white/5 bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] font-black tracking-widest uppercase opacity-40">
                <ClipboardList size={14} /> Mission Log
            </div>
            <div className="w-2 h-2 rounded-full bg-medical-green animate-pulse shadow-[0_0_8px_#00e676]"></div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-white/10">
            {logs.map((log, i) => (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                key={i}
                className="text-[10px] font-medium border-l-2 border-medical-cyan/30 pl-3 py-2 bg-white/5 rounded-r-md"
              >
                <span className="opacity-30 mr-2 font-mono">{new Date().toLocaleTimeString([], {hour12: false, minute:'2-digit', second:'2-digit'})}</span>
                {log}
              </motion.div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
            <div className="text-[10px] font-black tracking-widest uppercase opacity-40 px-2">Clinical Interventions</div>
            <div className="grid grid-cols-2 gap-3">
                <ActionButton label="Epi 1mg" onClick={() => applyAction('EPINEPHRINE')} color="bg-medical-red" />
                <ActionButton label="Amio 300mg" onClick={() => applyAction('AMIODARONE')} color="bg-medical-blue" />
                <ActionButton label="Defib 200J" onClick={() => applyAction('DEFIBRILLATION')} color="bg-medical-yellow" icon={<Zap size={16}/>} />
                <ActionButton label="Start CPR" onClick={() => applyAction('CPR_COMPRESSION')} color="bg-medical-green" icon={<Heart size={16}/>} />
            </div>
        </div>
      </motion.div>

      {/* AI Feedback Overlay */}
      <AnimatePresence>
        {feedback && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-medical-dark/95 flex items-center justify-center p-8 backdrop-blur-2xl"
            >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-medical-dark border border-white/10 p-10 rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.5)]"
            >
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
                            <Activity className="text-medical-cyan h-8 w-8" /> Gemini <span className="text-medical-cyan">Clinical</span> Analysis
                        </h2>
                        <div className="h-1 w-20 bg-medical-cyan mt-2 rounded-full"></div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-6 text-white/80 font-medium whitespace-pre-wrap mb-10 text-base leading-relaxed scrollbar-thin scrollbar-thumb-white/10">
                {feedback}
                </div>

                <button
                onClick={() => setFeedback(null)}
                className="w-full py-5 bg-medical-cyan hover:bg-white text-medical-dark font-black rounded-2xl transition-all shadow-lg hover:shadow-medical-cyan/20 active:scale-95 uppercase tracking-widest"
                >
                Return to Simulation
                </button>
            </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Anatomy Lesson Overlay */}
      {studyMode && (
        <AnatomyLesson
          onClose={toggleStudyMode}
          title="Cardiac Pathophysiology"
          description="Explore the electrical and mechanical properties of the heart. Understand how ventricular tachycardia degenerates into fibrillation and why early defibrillation is critical for survival."
        />
      )}

      {/* Bottom HUD - Interaction Instructions */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-8 z-40">
        <Instruction hint="Click" action="Assess Patient" />
        <Instruction hint="Space" action="Perform CPR" />
        <Instruction hint="R" action="Rhythm Check" />
      </div>
    </div>
  );
};

const ProtocolButton = ({ title, subtitle, onClick, color, accent }: any) => (
  <button
    onClick={onClick}
    className={cn(
        "group flex items-center justify-between p-6 rounded-2xl border-2 transition-all active:scale-95 text-left w-[400px]",
        color
    )}
  >
    <div>
        <div className="text-xs font-black uppercase tracking-widest opacity-40 mb-1">{subtitle}</div>
        <div className="text-2xl font-black text-white italic uppercase tracking-tighter">{title}</div>
    </div>
    <div className={cn("p-3 rounded-xl transition-transform group-hover:translate-x-1", accent)}>
        <Zap className="text-medical-dark w-5 h-5 fill-current" />
    </div>
  </button>
);

const HUDButton = ({ children, onClick, isLoading, variant, icon }: any) => {
    const variants = {
        primary: "bg-medical-blue/20 border-medical-blue/40 text-medical-blue hover:bg-medical-blue hover:text-white",
        success: "bg-medical-green/20 border-medical-green/40 text-medical-green hover:bg-medical-green hover:text-white",
    };

    return (
        <button
            onClick={onClick}
            disabled={isLoading}
            className={cn(
                "flex items-center gap-3 px-6 py-3 rounded-xl border font-bold text-xs transition-all active:scale-95 disabled:opacity-50 backdrop-blur-md",
                variants[variant as keyof typeof variants]
            )}
        >
            {icon} {children}
        </button>
    );
};

const VitalCard = ({ label, value, unit, color, icon, isCritical }: any) => (
  <div className={cn(
      "bg-medical-dark/60 border p-4 rounded-2xl relative backdrop-blur-xl shadow-lg transition-all",
      isCritical ? "border-medical-red animate-pulse bg-medical-red/5" : "border-white/5"
  )}>
    <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40">{icon} {label}</div>
        {isCritical && <AlertCircle className="text-medical-red w-3 h-3" />}
    </div>
    <div className={cn("text-3xl font-black font-mono tabular-nums leading-none", color)}>
        {Math.round(value)}
        <span className="text-[10px] ml-1 opacity-50 uppercase font-sans font-bold">{unit}</span>
    </div>
  </div>
);

const ActionButton = ({ label, onClick, color, icon }: any) => (
  <button
    onClick={onClick}
    className={cn(
        "group relative h-20 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all active:scale-95 overflow-hidden font-black text-[10px] uppercase tracking-widest",
        color,
        "text-medical-dark"
    )}
  >
    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
    {icon ? icon : <FlaskConical size={16} />}
    {label}
  </button>
);

const Instruction = ({ hint, action }: any) => (
    <div className="flex items-center gap-2 bg-medical-dark/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 shadow-lg">
        <span className="bg-white/10 px-2 py-0.5 rounded text-[10px] font-black text-medical-cyan">{hint}</span>
        <span className="text-[10px] font-bold opacity-50 uppercase tracking-widest">{action}</span>
    </div>
);

export default HUD;
