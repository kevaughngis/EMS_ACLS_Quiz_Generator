import React, { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';
import { Activity, Clock, TrendingUp } from 'lucide-react';

export const VitalsTrends: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { logs, isSimulating } = useStore();

  // In a real app, we would track historical vitals in the store.
  // For this interactive version, we'll show a trend log and a "Code Clock"

  return (
    <div className="fixed inset-0 bg-slate-950/95 z-[90] flex items-center justify-center p-12 backdrop-blur-xl">
      <div className="bg-medical-dark border border-white/10 rounded-[3rem] w-full max-w-5xl h-[80vh] flex flex-col overflow-hidden shadow-2xl">

        <div className="px-12 py-10 bg-white/5 border-b border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-medical-cyan/20 rounded-2xl">
              <TrendingUp className="text-medical-cyan w-8 h-8" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Code <span className="text-medical-cyan">Analytics</span></h2>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">Vitals Trends & Event Timeline</p>
            </div>
          </div>
          <button onClick={onClose} className="p-4 bg-white/5 rounded-full hover:bg-white/10 text-white transition-colors">✕</button>
        </div>

        <div className="flex-1 p-12 grid grid-cols-3 gap-12 overflow-hidden">

          {/* Timeline */}
          <div className="col-span-2 flex flex-col gap-6">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Clock size={16}/> Event Timeline
            </h3>
            <div className="flex-1 bg-black/40 rounded-3xl border border-white/5 p-8 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-white/10">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-6 items-start">
                   <div className="text-[10px] font-mono text-medical-cyan mt-1 opacity-50">T+{i*12}s</div>
                   <div className="flex-1 bg-white/5 p-4 rounded-xl text-white/80 font-medium border-l-2 border-medical-cyan">
                     {log}
                   </div>
                </div>
              ))}
            </div>
          </div>

          {/* Code Clock Interventions */}
          <div className="flex flex-col gap-8">
             <div className="bg-medical-red/10 border border-medical-red/20 p-8 rounded-3xl">
                <div className="text-medical-red font-black uppercase text-[10px] tracking-widest mb-4">Epinephrine Timer</div>
                <div className="text-5xl font-mono font-black text-white tabular-nums">03:42</div>
                <div className="mt-2 text-xs font-bold text-white/40 uppercase">Next dose recommended in 01:18</div>
             </div>

             <div className="bg-medical-yellow/10 border border-medical-yellow/20 p-8 rounded-3xl">
                <div className="text-medical-yellow font-black uppercase text-[10px] tracking-widest mb-4">Pulse Check / Rhythm</div>
                <div className="text-5xl font-mono font-black text-white tabular-nums">01:55</div>
                <div className="mt-2 text-xs font-bold text-white/40 uppercase">Switch compressors in 00:05</div>
             </div>

             <div className="flex-1 bg-white/5 border border-white/10 rounded-3xl p-8">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Physiology Snapshot</h4>
                <div className="space-y-6">
                   <MiniTrend label="Cardiac Output" value="4.2 L/min" percent={65} color="bg-medical-cyan" />
                   <MiniTrend label="Cerebral Perfusion" value="Critical" percent={30} color="bg-medical-red" />
                   <MiniTrend label="pH Level" value="7.24" percent={45} color="bg-medical-yellow" />
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

const MiniTrend = ({ label, value, percent, color }: any) => (
  <div>
    <div className="flex justify-between items-end mb-2">
      <span className="text-[10px] font-bold text-white/40 uppercase">{label}</span>
      <span className="text-xs font-black text-white">{value}</span>
    </div>
    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
       <motion.div
         initial={{ width: 0 }}
         animate={{ width: `${percent}%` }}
         className={`h-full ${color}`}
       />
    </div>
  </div>
);
