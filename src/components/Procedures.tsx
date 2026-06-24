import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { Activity, X, ChevronRight, Droplets, Target } from 'lucide-react';
import { useState } from 'react';

const Procedures = () => {
  const { activeProcedure, setProcedure, applyAction, addXP } = useStore();
  const [step, setStep] = useState(0);

  if (activeProcedure === 'NONE') return null;

  const handleComplete = () => {
    applyAction(`PROCEDURE_${activeProcedure}_COMPLETE`);
    addXP(150);
    setProcedure('NONE');
    setStep(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-8 backdrop-blur-md"
    >
      <div className="bg-medical-dark border border-white/10 p-8 rounded-3xl max-w-2xl w-full relative">
        <button onClick={() => setProcedure('NONE')} className="absolute top-6 right-6 text-white/40 hover:text-white">
          <X size={24} />
        </button>

        {activeProcedure === 'INTUBATION' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
              <Activity className="text-medical-cyan" /> Airway Management: Orotracheal Intubation
            </h2>

            <div className="aspect-video bg-black/40 rounded-2xl border border-white/5 flex items-center justify-center relative overflow-hidden">
                {/* Schematic "Laryngoscopic View" */}
                <div className="w-48 h-48 border-4 border-medical-cyan/20 rounded-full flex items-center justify-center">
                    <div className="w-12 h-20 bg-white/10 rounded-t-full relative">
                        {step > 1 && <div className="absolute top-4 left-1/2 -translate-x-1/2 w-4 h-4 bg-medical-cyan rounded-full animate-pulse shadow-[0_0_15px_cyan]"></div>}
                    </div>
                </div>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-widest text-white/40">Laryngoscopic View (Grade 1 View Required)</div>
            </div>

            <div className="grid grid-cols-1 gap-2">
                <ProcedureStep active={step === 0} label="1. Position Head & Pre-oxygenate" onClick={() => setStep(1)} />
                <ProcedureStep active={step === 1} label="2. Insert Blade & Visualize Vocal Cords" onClick={() => setStep(2)} />
                <ProcedureStep active={step === 2} label="3. Pass ET Tube & Inflate Cuff" onClick={() => setStep(3)} />
                <ProcedureStep active={step === 3} label="4. Confirm Placement (ETCO2 & Auscultation)" onClick={handleComplete} />
            </div>
          </div>
        )}

        {activeProcedure === 'IO' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
              <Target className="text-medical-red" /> Vascular Access: Intraosseous Drill
            </h2>

            <div className="aspect-video bg-black/40 rounded-2xl border border-white/5 flex items-center justify-center gap-8">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-24 h-40 bg-white/10 rounded-3xl border-2 border-dashed border-medical-red flex items-center justify-center">
                        <div className="w-2 h-2 bg-medical-red rounded-full"></div>
                    </div>
                    <span className="text-[10px] font-bold text-white/40 uppercase">Proximal Tibia</span>
                </div>
                <div className="flex flex-col items-center gap-2 opacity-30">
                    <div className="w-24 h-40 bg-white/5 rounded-3xl border-2 border-white/10 flex items-center justify-center"></div>
                    <span className="text-[10px] font-bold text-white/40 uppercase">Humeral Head</span>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
                <ProcedureStep active={step === 0} label="1. Clean Site with Chlorhexidine" onClick={() => setStep(1)} icon={<Droplets size={16}/>} />
                <ProcedureStep active={step === 1} label="2. Position Needle at 90 Degree Angle" onClick={() => setStep(2)} />
                <ProcedureStep active={step === 2} label="3. Trigger Drill Until 'Pop' is Felt" onClick={() => setStep(3)} />
                <ProcedureStep active={step === 3} label="4. Flush & Secure Stabilizer" onClick={handleComplete} />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const ProcedureStep = ({ active, label, onClick, icon }: any) => (
  <button
    disabled={!active}
    onClick={onClick}
    className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all ${
        active ? 'border-medical-cyan bg-medical-cyan/10 text-white' : 'border-white/5 bg-white/5 text-white/20'
    }`}
  >
    <div className="flex items-center gap-3 font-bold text-sm">
        {icon || <ChevronRight size={16} />} {label}
    </div>
    {active && <div className="w-2 h-2 rounded-full bg-medical-cyan animate-pulse"></div>}
  </button>
);

export default Procedures;
