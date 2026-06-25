import React from 'react';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, Activity, Zap, ClipboardList, CheckCircle2 } from 'lucide-react';

export const AnalyticsDashboard: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { logs, patientState } = useStore();

  return (
    <div className="fixed inset-0 bg-slate-950/98 z-[140] flex items-center justify-center p-12 backdrop-blur-3xl">
      <div className="bg-medical-dark border border-white/10 rounded-[4rem] w-full max-w-7xl h-[85vh] flex flex-col overflow-hidden shadow-2xl">

        <div className="px-16 py-12 bg-white/5 border-b border-white/5 flex justify-between items-end">
           <div>
              <div className="flex items-center gap-3 text-medical-cyan font-black uppercase tracking-[0.3em] text-[10px] mb-2">
                 <TrendingUp size={14} /> Performance Analytics
              </div>
              <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter">Mission <span className="text-medical-cyan">Review</span></h2>
           </div>
           <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors font-black uppercase tracking-widest text-[10px]">End Review</button>
        </div>

        <div className="flex-1 p-16 flex gap-16 overflow-hidden">

           {/* Timeline & Graph */}
           <div className="flex-1 flex flex-col gap-10">
              <div className="flex-1 bg-black/40 border border-white/5 rounded-[3rem] p-10 relative overflow-hidden">
                 <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Activity size={16}/> Hemodynamic Trends</h3>
                    <div className="flex gap-4">
                       <Legend color="bg-medical-red" label="HR" />
                       <Legend color="bg-medical-cyan" label="SpO2" />
                       <Legend color="bg-medical-yellow" label="MAP" />
                    </div>
                 </div>

                 {/* Stylized Trends SVG */}
                 <div className="absolute inset-0 top-32 px-10">
                    <svg width="100%" height="200" className="overflow-visible">
                       <TrendLine color="#ff1744" points="0,150 100,140 200,160 300,180 400,100 500,40 600,50" />
                       <TrendLine color="#00e5ff" points="0,50 100,55 200,60 300,80 400,40 500,10 600,15" />
                       <TrendLine color="#ffea00" points="0,180 100,175 200,190 300,195 400,150 500,120 600,130" />
                    </svg>
                 </div>
              </div>

              <div className="h-48 bg-white/5 border border-white/10 rounded-3xl p-8 flex items-center justify-around">
                 <ScoreStat label="Clinical Accuracy" value="94%" />
                 <ScoreStat label="Time to Defib" value="01:42" />
                 <ScoreStat label="Epi Interval" value="03:55" />
                 <ScoreStat label="Protocol Adherence" value="100%" />
              </div>
           </div>

           {/* Event Log */}
           <div className="w-96 flex flex-col gap-8">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Clock size={16}/> Event Timeline</h3>
              <div className="flex-1 bg-black/40 border border-white/5 rounded-[2.5rem] p-8 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-white/10">
                 {logs.map((log, i) => (
                    <div key={i} className="flex gap-4 items-start border-l-2 border-medical-cyan/20 pl-4 py-2">
                       <div className="text-[8px] font-mono text-medical-cyan opacity-40 mt-1">T+{i*30}s</div>
                       <div className="text-[10px] font-bold text-white/80 leading-relaxed uppercase">{log}</div>
                    </div>
                 ))}
              </div>
              <button
                onClick={onClose}
                className="w-full py-6 bg-medical-cyan text-medical-dark font-black rounded-2xl hover:bg-white transition-all uppercase tracking-[0.2em] text-[10px] shadow-2xl active:scale-95"
              >
                 Return to Simulation
              </button>
           </div>

        </div>
      </div>
    </div>
  );
};

const Legend = ({ color, label }: any) => (
  <div className="flex items-center gap-2">
     <div className={`w-2 h-2 rounded-full ${color}`}></div>
     <span className="text-[8px] font-black text-slate-500 uppercase">{label}</span>
  </div>
);

const TrendLine = ({ color, points }: any) => (
  <motion.polyline
    points={points}
    fill="none"
    stroke={color}
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    initial={{ pathLength: 0 }}
    animate={{ pathLength: 1 }}
    transition={{ duration: 2, ease: "easeInOut" }}
  />
);

const ScoreStat = ({ label, value }: any) => (
  <div className="text-center">
     <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</div>
     <div className="text-3xl font-black text-white italic uppercase tracking-tighter">{value}</div>
  </div>
);
