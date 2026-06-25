import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { Crosshair, Wind, Activity, CheckCircle2, AlertTriangle } from 'lucide-react';

export type MinigameType = 'INTUBATION' | 'IO_ACCESS' | 'BVM_VENTILATION' | 'NEEDLE_DECOMPRESSION' | 'TOURNIQUET';

interface ProcedureMinigameProps {
  type: MinigameType;
  onSuccess: () => void;
  onFailure: (reason: string) => void;
  onClose: () => void;
}

export const ProcedureMinigame: React.FC<ProcedureMinigameProps> = ({ type, onSuccess, onFailure, onClose }) => {
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'SUCCESS' | 'FAILURE'>('IDLE');
  const [progress, setProgress] = useState(0);

  return (
    <div className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-xl flex items-center justify-center p-8">
      <div className="bg-medical-dark border border-white/10 rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col">
        <div className="p-8 bg-white/5 border-b border-white/5 flex justify-between items-center">
          <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">
            Procedure: <span className="text-medical-cyan">{type.replace('_', ' ')}</span>
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white">✕</button>
        </div>

        <div className="flex-1 p-12 flex flex-col items-center justify-center min-h-[400px]">
          <AnimatePresence mode="wait">
            {gameState === 'IDLE' && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-center"
              >
                <div className="text-slate-400 mb-8 font-medium">
                  {type === 'INTUBATION' && "Align the laryngoscope and pass the ET tube through the vocal cords."}
                  {type === 'IO_ACCESS' && "Locate the tibial tuberosity and maintain vertical pressure during drill."}
                  {type === 'BVM_VENTILATION' && "Maintain a steady ventilation rate. Match the target zone."}
                </div>
                <button
                  onClick={() => setGameState('PLAYING')}
                  className="px-12 py-4 bg-medical-cyan text-medical-dark font-black rounded-2xl hover:scale-105 transition-transform uppercase tracking-widest"
                >
                  Begin Procedure
                </button>
              </motion.div>
            )}

            {gameState === 'PLAYING' && (
              <motion.div key="playing" className="w-full h-full flex flex-col items-center">
                {type === 'INTUBATION' && <IntubationGame onComplete={onSuccess} onFail={onFailure} />}
                {type === 'BVM_VENTILATION' && <VentilationGame onComplete={onSuccess} onFail={onFailure} />}
                {type === 'IO_ACCESS' && <IOGame onComplete={onSuccess} onFail={onFailure} />}
                {type === 'NEEDLE_DECOMPRESSION' && <NeedleGame onComplete={onSuccess} onFail={onFailure} />}
                {type === 'TOURNIQUET' && <TourniquetGame onComplete={onSuccess} onFail={onFailure} />}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const NeedleGame = ({ onComplete, onFail }: { onComplete: () => void, onFail: (s: string) => void }) => {
  const [depth, setDepth] = useState(0);
  const [success, setSuccess] = useState(false);

  const handleInsert = () => {
    setDepth(prev => {
        const next = prev + 10;
        if (next >= 100) {
            setSuccess(true);
            setTimeout(onComplete, 1500);
        }
        return next;
    });
  };

  return (
    <div className="w-full flex flex-col items-center gap-12">
        <div className="relative w-full max-w-sm h-64 bg-black/40 rounded-3xl border border-white/5 flex flex-col items-center justify-center">
            {success && (
                <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="absolute inset-0 bg-medical-cyan/20 flex flex-col items-center justify-center gap-4 z-10"
                >
                    <Wind className="text-medical-cyan w-16 h-16 animate-bounce" />
                    <div className="text-medical-cyan font-black uppercase italic tracking-tighter">Pleural Decompression Successful</div>
                </motion.div>
            )}
            <div className="text-6xl font-black text-white/5 uppercase italic tracking-tighter absolute select-none">NEEDLE</div>
            <div className="flex gap-1 h-32 items-end">
                {[...Array(10)].map((_, i) => (
                    <div key={i} className={`w-4 rounded-full transition-all ${i * 10 < depth ? 'bg-medical-cyan' : 'bg-white/5'}`} style={{ height: `${20 + i*5}%` }} />
                ))}
            </div>
        </div>

        <button
            onClick={handleInsert}
            disabled={success}
            className="group relative px-12 py-6 bg-medical-dark border-2 border-medical-cyan text-medical-cyan font-black rounded-3xl hover:bg-medical-cyan hover:text-medical-dark transition-all uppercase tracking-widest"
        >
            Insert Decompression Needle
        </button>
    </div>
  );
};

const TourniquetGame = ({ onComplete, onFail }: { onComplete: () => void, onFail: (s: string) => void }) => {
    const [tension, setTension] = useState(0);
    const [turns, setTurns] = useState(0);

    const handleTurn = () => {
        setTurns(prev => prev + 1);
        setTension(prev => Math.min(100, prev + 15));
        if (tension >= 85) {
            onComplete();
        }
    };

    return (
        <div className="w-full flex flex-col items-center gap-8">
            <div className="w-64 h-64 relative flex items-center justify-center">
                <motion.div
                    animate={{ rotate: turns * 90 }}
                    className="w-48 h-8 bg-medical-yellow rounded-full shadow-[0_0_20px_rgba(255,234,0,0.3)] relative"
                >
                    <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-4 bg-medical-dark/20"></div>
                </motion.div>
                <div className="absolute inset-0 border-8 border-dashed border-white/5 rounded-full animate-[spin_20s_linear_infinite]"></div>
            </div>

            <div className="w-full max-w-xs">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                    <span>Pressure: {Math.floor(tension)}%</span>
                    <span className="text-medical-yellow">DISTAL PULSE: {tension > 80 ? 'ABSENT' : 'PRESENT'}</span>
                </div>
                <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-medical-yellow" style={{ width: `${tension}%` }} />
                </div>
            </div>

            <button
                onClick={handleTurn}
                className="px-12 py-5 bg-medical-yellow text-medical-dark font-black rounded-2xl hover:scale-105 active:scale-95 transition-all uppercase tracking-widest"
            >
                Turn Windlass
            </button>
        </div>
    );
};

const IntubationGame = ({ onComplete, onFail }: { onComplete: () => void, onFail: (s: string) => void }) => {
  const [bladePos, setBladePos] = useState({ x: 50, y: 80 });
  const [tubePos, setTubePos] = useState({ x: 50, y: 50 });
  const [depth, setDepth] = useState(0);
  const [phase, setPrepStep] = useState<'BLADE' | 'TUBE'>('BLADE');
  const [target, setTarget] = useState({ x: 50, y: 35 });
  const [success, setSuccess] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (success) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    if (phase === 'BLADE') {
        setBladePos({ x: x, y: Math.max(20, y) });
        const dist = Math.sqrt(Math.pow(x - target.x, 2) + Math.pow(y - target.y, 2));
        if (dist < 8) {
            setPrepStep('TUBE');
        }
    } else {
        setTubePos({ x, y });
        const dist = Math.sqrt(Math.pow(x - target.x, 2) + Math.pow(y - target.y, 2));
        if (dist < 5) {
            setDepth(prev => Math.min(100, prev + 2));
            if (depth >= 100) {
                setSuccess(true);
                setTimeout(onComplete, 2000);
            }
        }
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-8">
      <div
        className="w-[500px] h-[500px] bg-red-950/20 rounded-[4rem] border-8 border-slate-900 relative cursor-none overflow-hidden shadow-2xl"
        onMouseMove={handleMouseMove}
      >
        {/* Airway Landmarks (Anatomical Representation) */}
        <div className="absolute inset-0 flex items-center justify-center">
            {/* Tongue */}
            <div className={`absolute top-1/2 w-80 h-64 bg-red-600/40 rounded-full transition-transform duration-1000 ${phase === 'TUBE' ? '-translate-y-24 scale-y-50 opacity-40' : ''}`}></div>

            {/* Epiglottis/Vocal Cords */}
            <div className="relative w-32 h-40 flex items-center justify-center">
                <div className="absolute w-24 h-32 bg-pink-200/20 rounded-full border-4 border-pink-400/30"></div>
                <div className="w-2 h-20 bg-white/60 rounded-full blur-[1px] rotate-[10deg]"></div>
                <div className="w-2 h-20 bg-white/60 rounded-full blur-[1px] -rotate-[10deg]"></div>

                {/* The "Glottic Opening" */}
                <div className="w-10 h-10 bg-black rounded-full border-2 border-white/20"></div>
            </div>
        </div>

        {/* Laryngoscope Blade */}
        <motion.div
          animate={{ x: `${bladePos.x}%`, y: `${bladePos.y}%` }}
          className={`absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 transition-opacity ${phase === 'TUBE' ? 'opacity-30' : 'opacity-100'}`}
        >
          <div className="w-8 h-48 bg-slate-300 rounded-t-full shadow-[0_-20px_40px_rgba(255,255,255,0.5)]"></div>
          <div className="w-4 h-4 bg-yellow-200 rounded-full -mt-2 mx-auto animate-pulse"></div>
        </motion.div>

        {/* ET Tube */}
        {phase === 'TUBE' && (
            <motion.div
                animate={{ x: `${tubePos.x}%`, y: `${tubePos.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20"
            >
                <div className="w-4 h-96 bg-white/30 border-2 border-white/20 rounded-full backdrop-blur-sm relative overflow-hidden">
                    <div className="absolute top-0 w-full h-8 bg-blue-400/20"></div>
                    <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${depth}%` }}
                        className="absolute bottom-0 w-full bg-blue-400/40"
                    />
                </div>
            </motion.div>
        )}

        {success && (
            <div className="absolute inset-0 bg-medical-cyan/20 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="text-center">
                    <CheckCircle2 size={64} className="text-white mx-auto mb-6 animate-bounce" />
                    <div className="text-4xl font-black text-white italic uppercase tracking-tighter">Placement Confirmed</div>
                    <div className="text-sm font-bold text-white opacity-60 uppercase mt-2 italic">Bilaterial Breath Sounds Present</div>
                </div>
            </div>
        )}
      </div>

      <div className="w-full max-w-sm">
        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
          <span>Step: {phase === 'BLADE' ? 'Visualize Cords' : 'Advance ET Tube'}</span>
          <span className="text-medical-cyan">{phase === 'BLADE' ? '0' : Math.floor(depth)}%</span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <motion.div className="h-full bg-medical-cyan shadow-[0_0_10px_#00e5ff]" style={{ width: `${depth}%` }} />
        </div>
      </div>
    </div>
  );
};

const VentilationGame = ({ onComplete, onFail }: { onComplete: () => void, onFail: (s: string) => void }) => {
  const [breaths, setBreaths] = useState(0);
  const [pressure, setPressure] = useState(0);
  const [targetHit, setTargetHit] = useState(false);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTimer(v => v + 0.1), 100);
    return () => clearInterval(t);
  }, []);

  const handleSqueeze = () => {
    if (pressure > 20) return; // Cooldown
    setPressure(100);
    const waveValue = Math.sin(timer * 2);
    // Ideally squeeze at the right rhythm
    setBreaths(prev => prev + 1);
    if (breaths >= 5) onComplete();
  };

  useEffect(() => {
    const p = setInterval(() => setPressure(v => Math.max(0, v - 5)), 50);
    return () => clearInterval(p);
  }, []);

  return (
    <div className="w-full flex flex-col items-center gap-12">
      <div className="relative w-64 h-64 flex items-center justify-center">
        <motion.div
          animate={{ scale: 1 + (pressure/200) }}
          className="w-40 h-40 bg-medical-blue/20 border-4 border-medical-blue rounded-full flex items-center justify-center shadow-2xl"
        >
          <Wind className="text-medical-blue w-16 h-16" />
        </motion.div>
      </div>

      <button
        onMouseDown={handleSqueeze}
        className="px-10 py-6 bg-medical-blue text-white font-black rounded-3xl hover:bg-medical-cyan hover:text-medical-dark transition-colors uppercase tracking-widest active:scale-90"
      >
        Squeeze BVM ({breaths}/6)
      </button>

      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center max-w-xs">
        Deliver 6 controlled breaths at a rate of 1 every 6 seconds.
      </div>
    </div>
  );
};

const IOGame = ({ onComplete, onFail }: { onComplete: () => void, onFail: (s: string) => void }) => {
  const [pressure, setPressure] = useState(0);
  const [isDrilling, setIsDrilling] = useState(false);
  const [depth, setDepth] = useState(0);

  useEffect(() => {
    let interval: any;
    if (isDrilling) {
      interval = setInterval(() => {
        setDepth(prev => {
          const next = prev + 1;
          if (next >= 100) {
            clearInterval(interval);
            onComplete();
          }
          return next;
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isDrilling, onComplete]);

  return (
    <div className="w-full flex flex-col items-center gap-8">
       <div className="w-full max-w-md bg-black/40 rounded-3xl p-8 border border-white/5">
          <div className="text-center mb-6">
            <Activity className="text-medical-yellow mx-auto mb-2" />
            <div className="text-xs font-black uppercase text-slate-400">Bone Density Resistance</div>
          </div>

          <div className="h-64 bg-white/5 rounded-2xl relative overflow-hidden flex items-end">
             <motion.div
               className="w-full bg-medical-yellow/20 border-t-2 border-medical-yellow"
               style={{ height: `${depth}%` }}
             />
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-4xl font-black text-white italic opacity-20 uppercase tracking-tighter">
                  {Math.floor(depth)}% Depth
                </div>
             </div>
          </div>
       </div>

       <button
         onMouseDown={() => setIsDrilling(true)}
         onMouseUp={() => setIsDrilling(false)}
         onMouseLeave={() => setIsDrilling(false)}
         className={`w-24 h-24 rounded-full border-4 flex items-center justify-center transition-all ${isDrilling ? 'bg-medical-yellow border-white animate-pulse' : 'bg-white/5 border-medical-yellow'}`}
       >
         <CheckCircle2 className={isDrilling ? 'text-medical-dark' : 'text-medical-yellow'} />
       </button>
       <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Hold to Drill</div>
    </div>
  );
};
