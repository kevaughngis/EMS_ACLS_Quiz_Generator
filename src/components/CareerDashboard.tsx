import React from 'react';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';
import { Trophy, Award, Target, Star, ChevronRight, Activity, Zap, Wind } from 'lucide-react';

export const CareerDashboard: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { progress } = useStore();

  const certificates = [
    { id: 'acls', name: 'ACLS Master', level: 'Expert', icon: <Activity className="text-medical-red" />, progress: 100 },
    { id: 'airway', name: 'Airway Specialist', level: 'Advanced', icon: <Wind className="text-medical-cyan" />, progress: 75 },
    { id: 'trauma', name: 'Trauma Hero', level: 'Novice', icon: <Zap className="text-medical-yellow" />, progress: 30 },
  ];

  return (
    <div className="fixed inset-0 bg-slate-950/98 z-[120] flex items-center justify-center p-12 backdrop-blur-2xl">
      <div className="bg-medical-dark border border-white/10 rounded-[4rem] w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="px-16 py-12 bg-white/5 border-b border-white/5 flex justify-between items-end">
           <div>
              <div className="flex items-center gap-3 text-medical-cyan font-black uppercase tracking-[0.3em] text-[10px] mb-2">
                 <Trophy size={14} /> Career Profile
              </div>
              <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter">Clinical <span className="text-medical-cyan">Mastery</span></h2>
           </div>
           <div className="text-right">
              <div className="text-sm font-black text-white opacity-40 uppercase tracking-widest mb-1">Level {progress.level} Specialist</div>
              <div className="w-64 h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
                 <motion.div
                   initial={{ width: 0 }}
                   animate={{ width: `${(progress.xp % 1000) / 10}%` }}
                   className="h-full bg-medical-cyan shadow-[0_0_15px_#00e5ff]"
                 />
              </div>
              <div className="text-[10px] font-bold text-slate-500 mt-2 uppercase">{progress.xp % 1000} / 1000 XP to Level {progress.level + 1}</div>
           </div>
        </div>

        <div className="flex-1 p-16 grid grid-cols-3 gap-12 overflow-hidden">

           {/* Certificates */}
           <div className="col-span-2 space-y-8 overflow-y-auto pr-8 scrollbar-thin scrollbar-thumb-white/10">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                 <Award size={16} /> Earned Certificates
              </h3>

              <div className="grid grid-cols-1 gap-6">
                 {certificates.map(cert => (
                    <motion.div
                      key={cert.id}
                      whileHover={{ scale: 1.02, x: 10 }}
                      className="bg-black/40 border border-white/5 rounded-3xl p-8 flex items-center gap-8 group cursor-pointer"
                    >
                       <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-medical-cyan/10 transition-colors">
                          {cert.icon}
                       </div>
                       <div className="flex-1">
                          <div className="flex justify-between items-end mb-3">
                             <div>
                                <div className="text-lg font-black text-white uppercase italic tracking-tight">{cert.name}</div>
                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{cert.level} Proficiency</div>
                             </div>
                             <div className="text-sm font-black text-medical-cyan">{cert.progress}%</div>
                          </div>
                          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                             <motion.div
                               initial={{ width: 0 }}
                               animate={{ width: `${cert.progress}%` }}
                               className="h-full bg-medical-cyan"
                             />
                          </div>
                       </div>
                       <ChevronRight className="text-slate-700 group-hover:text-medical-cyan transition-colors" />
                    </motion.div>
                 ))}
              </div>
           </div>

           {/* Stats Summary */}
           <div className="space-y-8">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                 <Target size={16} /> Performance Stats
              </h3>

              <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 space-y-10">
                 <StatItem label="Total XP" value={progress.xp} sub="All-time" icon={<Star size={16} className="text-medical-yellow" />} />
                 <StatItem label="Avg Score" value="88%" sub="Last 10 runs" icon={<Activity size={16} className="text-medical-green" />} />
                 <StatItem label="Lives Saved" value="12" sub="Career total" icon={<Trophy size={16} className="text-medical-cyan" />} />
              </div>

              <button
                onClick={onClose}
                className="w-full py-6 bg-white text-medical-dark font-black rounded-2xl hover:bg-medical-cyan transition-all uppercase tracking-[0.2em] text-xs shadow-xl active:scale-95"
              >
                Return to Simulation
              </button>
           </div>

        </div>
      </div>
    </div>
  );
};

const StatItem = ({ label, value, sub, icon }: any) => (
  <div className="flex items-center gap-6">
    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-white/40">
       {icon}
    </div>
    <div>
       <div className="text-2xl font-black text-white tabular-nums">{value}</div>
       <div className="flex items-center gap-2">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">{label}</div>
          <div className="w-1 h-1 bg-slate-700 rounded-full"></div>
          <div className="text-[10px] font-bold text-slate-700 uppercase">{sub}</div>
       </div>
    </div>
  </div>
);
