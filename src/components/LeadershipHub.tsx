import React from 'react';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';
import { Users, AlertTriangle, ShieldCheck, MessageSquare, Zap } from 'lucide-react';

export const LeadershipHub: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { team, logs } = useStore();

  const handleLeadershipAction = (action: string) => {
    useStore.setState(state => ({
        team: state.team.map(m => ({ ...m, stress: Math.max(0, m.stress - 25) })),
        logs: [...state.logs, `Leadership: ${action}`]
    }));
  };

  return (
    <div className="fixed inset-0 bg-slate-900/98 z-[120] flex items-center justify-center p-12 backdrop-blur-3xl">
      <div className="bg-[#0a0f1d] border border-white/10 rounded-[3rem] w-full max-w-5xl h-[70vh] flex flex-col overflow-hidden shadow-2xl">

        <div className="p-12 bg-white/5 border-b border-white/5 flex justify-between items-end">
           <div>
              <div className="flex items-center gap-3 text-medical-cyan font-black uppercase tracking-widest text-[10px] mb-2">
                 <ShieldCheck size={14} /> Team Dynamics
              </div>
              <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">Crisis <span className="text-medical-cyan">Management</span></h2>
           </div>
           <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors uppercase tracking-widest text-[10px] font-black">Close</button>
        </div>

        <div className="flex-1 p-16 flex gap-12 overflow-hidden">

           {/* Team Status */}
           <div className="flex-1 space-y-6">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Users size={16}/> Crew Status</h3>
              <div className="grid grid-cols-1 gap-4">
                 {team.map(member => (
                    <div key={member.id} className="bg-white/5 border border-white/5 rounded-3xl p-8 flex items-center justify-between group">
                       <div className="flex items-center gap-6">
                          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-white/20 group-hover:text-medical-cyan transition-colors">
                             <Users size={32} />
                          </div>
                          <div>
                             <div className="text-lg font-black text-white uppercase italic">{member.name}</div>
                             <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{member.role} • {member.status}</div>
                          </div>
                       </div>

                       <div className="w-64">
                          <div className="flex justify-between text-[8px] font-black uppercase text-slate-500 mb-2">
                             <span>Stress Level</span>
                             <span className={member.stress > 70 ? 'text-medical-red animate-pulse' : 'text-medical-cyan'}>{member.stress}%</span>
                          </div>
                          <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                             <motion.div
                               animate={{ width: `${member.stress}%` }}
                               className={`h-full ${member.stress > 70 ? 'bg-medical-red' : 'bg-medical-cyan'}`}
                             />
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           {/* Actions */}
           <div className="w-80 flex flex-col gap-6">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Zap size={16}/> Command Actions</h3>

              <LeadershipButton
                label="Direct Instructions"
                sub="Clarify roles and next steps"
                onClick={() => handleLeadershipAction("Clarified team roles and next priorities.")}
              />
              <LeadershipButton
                label="Panic Mitigation"
                sub="De-escalate team anxiety"
                onClick={() => handleLeadershipAction("Calmed the team down and regained situational awareness.")}
              />
              <LeadershipButton
                label="Closed-Loop Check"
                sub="Verify orders and feedback"
                onClick={() => handleLeadershipAction("Verified closed-loop communication for all active orders.")}
              />

              <div className="mt-auto p-6 bg-medical-cyan/5 border border-medical-cyan/20 rounded-2xl">
                 <p className="text-[10px] font-medium text-medical-cyan/60 italic leading-relaxed">
                    "High stress leads to task fixation and diagnostic errors. Maintain leadership presence."
                 </p>
              </div>
           </div>

        </div>
      </div>
    </div>
  );
};

const LeadershipButton = ({ label, sub, onClick }: any) => (
  <button
    onClick={onClick}
    className="w-full p-6 bg-white/5 border border-white/5 rounded-2xl text-left hover:border-medical-cyan hover:bg-medical-cyan/5 transition-all group active:scale-95 shadow-xl"
  >
     <div className="text-xs font-black text-white uppercase italic mb-1 group-hover:text-medical-cyan transition-colors">{label}</div>
     <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{sub}</div>
  </button>
);
