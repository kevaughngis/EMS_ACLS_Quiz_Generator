import { useRef, useEffect, useCallback } from 'react';
import type { RhythmType } from '../types';

interface ECGMonitorProps {
  rhythm: RhythmType;
  hr: number;
  color?: string;
  width?: number;
  height?: number;
}

const ECGMonitor: React.FC<ECGMonitorProps> = ({
  rhythm,
  hr,
  color = '#00f2ff',
  width = 600,
  height = 150
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const xRef = useRef(0);
  const lastYRef = useRef(height / 2);

  const getQRS = (t: number, qrsWidth = 0.08, qrsHeight = 100) => {
    const qrsPos = t / qrsWidth;
    if (qrsPos < 0.1) return -qrsPos * (qrsHeight * 0.4); // Q
    if (qrsPos < 0.4) return -(qrsHeight * 0.04) + (qrsPos - 0.1) * (qrsHeight * 1.8); // R
    if (qrsPos < 0.7) return (qrsHeight * 0.5) - (qrsPos - 0.4) * (qrsHeight * 1.8); // S
    if (qrsPos < 1.0) return -(qrsHeight * 0.04) + (qrsPos - 0.7) * (qrsHeight * 0.4);
    return 0;
  };

  const getPWave = (t: number, pWidth = 0.1, pHeight = 8) => {
    if (t > 0 && t < pWidth) {
      return Math.sin((t / pWidth) * Math.PI) * pHeight;
    }
    return 0;
  };

  const getTWave = (t: number, tWidth = 0.2, tHeight = 12, stElevation = 0) => {
    if (t > 0 && t < tWidth) {
      return Math.sin((t / tWidth) * Math.PI) * tHeight + stElevation;
    }
    return stElevation > 0 ? stElevation * (1 - t/tWidth) : 0;
  };

  const drawSignal = useCallback((ctx: CanvasRenderingContext2D, x: number, rhythm: RhythmType, t: number) => {
    const centerY = height / 2;
    let y = 0;

    const effectiveHr = Math.max(10, hr || 60);
    const beatInterval = 60 / effectiveHr;
    const timeInBeat = (t % beatInterval) / beatInterval;

    switch (rhythm) {
      case 'SINUS':
      case 'STACH':
      case 'SBAD':
      case 'PEA':
        y += getPWave(timeInBeat - 0.05);
        if (timeInBeat > 0.2 && timeInBeat < 0.28) y += getQRS(timeInBeat - 0.2);
        y += getTWave(timeInBeat - 0.4);
        break;

      case 'AFIB':
        y = (Math.random() - 0.5) * 6; // Fibrillatory waves
        if (timeInBeat > 0.2 && timeInBeat < 0.28 && Math.random() > 0.1) {
            y += getQRS(timeInBeat - 0.2);
        }
        break;

      case 'AFLUT':
        // Sawtooth pattern
        y = ((t * 10) % 1) * 10 - 5;
        if (timeInBeat > 0.2 && timeInBeat < 0.28) y += getQRS(timeInBeat - 0.2);
        break;

      case 'SVT':
        // Fast, no P waves, narrow QRS
        if (timeInBeat > 0.1 && timeInBeat < 0.18) y += getQRS(timeInBeat - 0.1);
        y += getTWave(timeInBeat - 0.25, 0.15, 8);
        break;

      case 'VF':
        const amp = (hr > 0) ? 35 : 15;
        y = Math.sin(t * 40) * amp + Math.sin(t * 87) * (amp/2) + (Math.random() - 0.5) * 15;
        break;

      case 'VT':
        // Wide "Tombstone" QRS
        const vtCycle = (t * (effectiveHr/60)) % 1;
        y = Math.sin(vtCycle * Math.PI * 2) * 50;
        if (vtCycle > 0.5) y *= 0.3;
        break;

      case 'TORSADES':
        const twist = Math.sin(t * 0.5);
        y = Math.sin(t * 30) * 50 * twist;
        break;

      case 'ASYSTOLE':
        y = (Math.random() - 0.5) * 3;
        break;

      case 'AVB1':
        // Long PR interval
        y += getPWave(timeInBeat - 0.02);
        if (timeInBeat > 0.35 && timeInBeat < 0.43) y += getQRS(timeInBeat - 0.35);
        y += getTWave(timeInBeat - 0.55);
        break;

      case 'STEMI_ANTERIOR':
      case 'STEMI_INFERIOR':
        y += getPWave(timeInBeat - 0.05);
        if (timeInBeat > 0.2 && timeInBeat < 0.28) y += getQRS(timeInBeat - 0.2);
        // ST Elevation
        y += getTWave(timeInBeat - 0.28, 0.3, 15, 20);
        break;

      case 'HYPERKALEMIA':
        // Flat P, Wide QRS, Peaked T
        if (timeInBeat > 0.2 && timeInBeat < 0.32) y += getQRS(timeInBeat - 0.2, 0.12, 80);
        y += getTWave(timeInBeat - 0.4, 0.2, 40); // TALL PEAKED T
        break;

      default:
        // Generic Sine for unimplemented
        y = Math.sin(t * (effectiveHr/10)) * 20;
        if (timeInBeat > 0.2 && timeInBeat < 0.3) y += getQRS(timeInBeat - 0.2);
    }

    const nextY = centerY - y;
    ctx.lineTo(x, nextY);
    lastYRef.current = nextY;
  }, [height, hr]);

  const animate = useCallback((time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const t = time / 1000;
    const speed = 2.5;

    ctx.fillStyle = 'rgba(10, 25, 47, 0.2)';
    ctx.fillRect(xRef.current, 0, 15, height);

    ctx.fillStyle = '#0a192f';
    ctx.fillRect(xRef.current + 15, 0, 5, height);

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    ctx.shadowBlur = 8;
    ctx.shadowColor = color;

    ctx.moveTo(xRef.current, lastYRef.current);

    const nextX = (xRef.current + speed) % width;

    if (nextX < xRef.current) {
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
    }

    xRef.current = nextX;
    drawSignal(ctx, xRef.current, rhythm, t);
    ctx.stroke();

    if (Math.random() > 0.98) {
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.2;
        ctx.fillRect(Math.random() * width, Math.random() * height, 2, 2);
        ctx.globalAlpha = 1.0;
    }

    requestRef.current = requestAnimationFrame(animate);
  }, [color, drawSignal, height, rhythm, width]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [animate]);

  return (
    <div className="relative w-full h-full bg-black/40 overflow-hidden group">
      <div className="absolute inset-0 opacity-10 pointer-events-none"
           style={{ backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
      </div>

      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full h-full block relative z-10"
      />

      <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
          <div className="w-full h-[2px] bg-white/5 absolute animate-scanline"></div>
      </div>
    </div>
  );
};

export default ECGMonitor;
