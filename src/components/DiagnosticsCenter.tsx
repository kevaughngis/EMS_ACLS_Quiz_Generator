import React from 'react';
import { useStore } from '../store/useStore';

export const DiagnosticsCenter: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const scenario = useStore(state => state.scenario);

  const mockLabs = scenario?.diagnostics?.labs || {
    ph: (7.35 + Math.random() * 0.1).toFixed(2),
    pco2: Math.floor(35 + Math.random() * 10),
    po2: Math.floor(80 + Math.random() * 20),
    hco3: Math.floor(22 + Math.random() * 4),
    lactate: (0.5 + Math.random() * 2).toFixed(1),
    troponin: (Math.random() > 0.7 ? 0.45 : 0.01).toFixed(2),
    potassium: (3.5 + Math.random() * 1.5).toFixed(1),
  };

  return (
    <div className="fixed inset-0 bg-slate-950/95 z-50 flex flex-col p-8 overflow-y-auto">
      <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
        <h2 className="text-2xl font-mono text-blue-400">DIAGNOSTIC CENTER</h2>
        <button onClick={onClose} className="text-slate-400 hover:text-white">✕ CLOSE</button>
      </div>

      <div className="grid grid-cols-2 gap-12">
        <section>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6">Laboratory Results</h3>
          <div className="space-y-4 font-mono">
            {Object.entries(mockLabs).map(([key, val]) => (
              <div key={key} className="flex justify-between border-b border-slate-900 pb-2">
                <span className="text-slate-400 uppercase">{key}</span>
                <span className="text-blue-300 font-bold">{val}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6">Imaging ({scenario?.diagnostics?.imaging?.type || 'Chest X-Ray'})</h3>
          <div className="aspect-[4/5] bg-black border border-slate-800 rounded relative overflow-hidden flex items-center justify-center group">
             <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
             <div className="text-center p-8">
               <div className="w-32 h-48 border-2 border-slate-700 rounded-full mx-auto mb-4 relative">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-32 bg-slate-800"></div>
               </div>
               <p className="text-slate-600 italic">{scenario?.diagnostics?.imaging?.description || 'Imaging data loading... [SIMULATED VIEW]'}</p>
             </div>
             <div className="absolute bottom-4 left-4 right-4 bg-slate-900/80 p-2 text-[10px] text-slate-400">
               IMPRESSION: {scenario?.diagnostics?.imaging?.impression || 'No acute focal consolidation. Heart size within normal limits.'}
             </div>
          </div>
        </section>
      </div>
    </div>
  );
};
