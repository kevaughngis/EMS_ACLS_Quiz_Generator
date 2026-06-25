import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Heart, ArrowDown, ArrowUp, Zap } from 'lucide-react';

export const CPRQualityGauge: React.FC = () => {
  const { applyAction, patientState } = useStore();
  const [lastCompression, setLastCompression] = useState(0);
  const [rate, setRate] = useState(0);
  const [depth, setDepth] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);

  const compressionCount = useRef(0);
  const startTime = useRef(Date.now());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.code === 'Space') {
            e.preventDefault();
            const now = Date.now();
            const interval = now - lastCompression;

            // Calculate rate (per min)
            if (lastCompression > 0) {
                const currentRate = 60000 / interval;
                setRate(Math.round(currentRate));

                if (currentRate < 100) setFeedback("PUSH FASTER");
                else if (currentRate > 120) setFeedback("PUSH SLOWER");
                else setFeedback("GOOD RATE");
            }

            // Simulate depth variability
            const currentDepth = 5.0 + (Math.random() - 0.5) * 1.5;
            setDepth(currentDepth);

            setLastCompression(now);
            applyAction('CPR_COMPRESSION');
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lastCompression, applyAction]);

  if (!patientState || patientState.circulation === 'PULSE') return null;

  return (
    <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-6 pointer-events-none">

        <div className="flex gap-8 items-end">
            {/* Rate Gauge */}
            <div className="bg-medical-dark/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col items-center shadow-2xl">
                <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-4">Compression Rate</div>
                <div className="relative w-12 h-48 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <motion.div
                        animate={{ height: `${Math.min(100, (rate / 150) * 100)}%` }}
                        className={`absolute bottom-0 w-full transition-colors ${rate >= 100 && rate <= 120 ? 'bg-medical-green shadow-[0_0_15px_#00e676]' : 'bg-medical-yellow'}`}
                    />
                    <div className="absolute bottom-[66%] w-full h-px bg-white/40"></div>
                    <div className="absolute bottom-[80%] w-full h-px bg-white/40"></div>
                </div>
                <div className="text-2xl font-black text-white font-mono mt-4">{rate}</div>
                <div className="text-[8px] font-bold text-slate-500 uppercase mt-1">cpm</div>
            </div>

            {/* Depth Gauge */}
            <div className="bg-medical-dark/80 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 flex flex-col items-center shadow-2xl scale-110">
                <AnimatePresence mode="wait">
                    <motion.div
                      key={feedback}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`text-xs font-black uppercase tracking-widest mb-6 ${feedback?.includes('GOOD') ? 'text-medical-green' : 'text-medical-yellow animate-pulse'}`}
                    >
                        {feedback || 'STANDBY'}
                    </motion.div>
                </AnimatePresence>

                <div className="relative flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full border-4 border-white/5 flex items-center justify-center">
                        <motion.div
                           animate={{ scale: [1, 0.8, 1] }}
                           transition={{ duration: 0.1 }}
                           className="w-20 h-20 bg-medical-red/20 rounded-full flex items-center justify-center"
                        >
                            <Heart className="text-medical-red" fill="currentColor" />
                        </motion.div>
                    </div>

                    <svg className="absolute inset-0 w-32 h-32 -rotate-90">
                        <motion.circle
                          cx="64" cy="64" r="60"
                          stroke={feedback?.includes('GOOD') ? '#00e676' : '#ffea00'}
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray="377"
                          animate={{ strokeDashoffset: 377 - (377 * (depth / 6)) }}
                        />
                    </svg>
                </div>

                <div className="mt-6 flex flex-col items-center">
                    <div className="text-4xl font-black text-white font-mono">{depth.toFixed(1)}</div>
                    <div className="text-[8px] font-bold text-slate-500 uppercase mt-1">cm depth</div>
                </div>
            </div>

            {/* Recoil Status */}
            <div className="bg-medical-dark/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col items-center shadow-2xl">
                <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-4">Chest Recoil</div>
                <div className="p-4 bg-medical-green/10 rounded-2xl">
                    <ArrowUp className="text-medical-green" />
                </div>
                <div className="text-[10px] font-black text-medical-green uppercase mt-4">Full</div>
            </div>
        </div>

        <div className="bg-black/60 px-6 py-2 rounded-full border border-white/10 text-[10px] font-black text-white/40 uppercase tracking-[0.3em] flex items-center gap-3 shadow-xl">
            <Zap size={12} className="text-medical-cyan animate-pulse" /> High-Quality CPR Mode Active
        </div>
    </div>
  );
};
