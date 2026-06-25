import React, { useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import type { RhythmType } from '../types';

interface LeadProps {
  label: string;
  rhythm: RhythmType;
  hr: number;
  stOffset?: number;
}

const LeadCanvas: React.FC<LeadProps> = ({ label, rhythm, hr, stOffset = 0 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let x = 0;
    const width = canvas.width;
    const height = canvas.height;
    const midY = height / 2;

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 5, 0, 0.1)';
      ctx.fillRect(x, 0, 20, height);

      const beatInterval = 60000 / hr;
      const t = performance.now() % beatInterval;

      let y = midY;

      // Basic ECG waveform logic with ST offset
      if (t < 50) y -= 5; // P
      else if (t < 70) y = midY;
      else if (t < 80) y += 5; // Q
      else if (t < 100) y -= 40; // R
      else if (t < 120) y += 15; // S
      else if (t > 150 && t < 250) {
        // ST Segment + T wave
        y -= (stOffset * 5); // ST Elevation/Depression
        const tPos = (t - 150) / 100;
        y -= Math.sin(tPos * Math.PI) * 10; // T wave
      }

      ctx.beginPath();
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 1.5;
      ctx.moveTo(x, midY); // Simple line for demo, would be more complex in real
      ctx.lineTo(x, y);
      ctx.stroke();

      x = (x + 2) % width;
      animationId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationId);
  }, [hr, stOffset]);

  return (
    <div className="relative border border-emerald-900/30 bg-black p-2 rounded">
      <span className="absolute top-1 left-1 text-[10px] font-bold text-emerald-500">{label}</span>
      <canvas ref={canvasRef} width={200} height={100} className="w-full h-24" />
    </div>
  );
};

export const TwelveLeadECG: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { patientState } = useStore();
  const leads = ['I', 'II', 'III', 'aVR', 'aVL', 'aVF', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6'];

  const getSTOffset = (lead: string) => {
    return patientState.twelveLead?.find(l => l.lead === lead)?.stSegment || 0;
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex flex-col p-8 overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-emerald-400">12-LEAD DIAGNOSTIC ECG</h2>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-red-900/40 border border-red-500 text-red-500 rounded hover:bg-red-500 hover:text-white transition-colors"
        >
          CLOSE
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {leads.map(l => (
          <LeadCanvas
            key={l}
            label={l}
            rhythm={patientState.rhythm}
            hr={patientState.vitals.hr}
            stOffset={getSTOffset(l)}
          />
        ))}
      </div>

      <div className="mt-8 grid grid-cols-2 gap-8 text-emerald-300 text-sm border-t border-emerald-900/50 pt-6">
        <div>
          <h3 className="font-bold mb-2">INTERPRETATION</h3>
          <p className="opacity-70 italic">Consult clinical criteria for STEMI, Arrhythmia, and Morphological abnormalities.</p>
        </div>
        <div className="text-right">
          <p>PAPER SPEED: 25mm/sec</p>
          <p>GAIN: 10mm/mV</p>
        </div>
      </div>
    </div>
  );
};
