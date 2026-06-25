import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { Calculator, AlertTriangle, CheckCircle2 } from 'lucide-react';

const PharmacyMath = () => {
  const { activeChallenge, solveChallenge } = useStore();

  if (!activeChallenge) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[110] bg-black/95 flex items-center justify-center p-8 backdrop-blur-xl"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-medical-dark border-2 border-medical-cyan/30 p-10 rounded-3xl max-w-lg w-full shadow-[0_0_50px_rgba(0,229,255,0.2)]"
      >
        <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-medical-cyan/20 rounded-2xl">
                <Calculator className="text-medical-cyan w-8 h-8" />
            </div>
            <div>
                <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Medication Safety Check</h2>
                <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Weight-Based Dosage Required</p>
            </div>
        </div>

        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 mb-8">
            <div className="text-[10px] font-black text-medical-cyan uppercase tracking-widest mb-2">Protocol Requirement</div>
            <div className="text-xl font-bold text-white mb-4">
                Administer <span className="text-medical-cyan">{activeChallenge.drug}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-white/60">
                <AlertTriangle size={16} className="text-medical-yellow" />
                Select the correct volume to administer based on patient weight and concentration.
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            {activeChallenge.options.map((option, i) => (
                <button
                    key={i}
                    onClick={() => solveChallenge(option)}
                    className="group relative p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-medical-cyan hover:bg-medical-cyan/5 transition-all text-center"
                >
                    <div className="text-2xl font-black text-white group-hover:text-medical-cyan transition-colors">
                        {option} <span className="text-xs opacity-40">{activeChallenge.unit}</span>
                    </div>
                </button>
            ))}
        </div>

        <p className="mt-8 text-center text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">
            Precision is critical in pediatric & neonatal care
        </p>
      </motion.div>
    </motion.div>
  );
};

export default PharmacyMath;
