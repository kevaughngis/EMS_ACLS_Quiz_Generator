import type { RhythmType } from '../types';

interface RhythmDefinition {
  type: RhythmType;
  pWave: boolean;
  qrsWidth: 'NARROW' | 'WIDE';
  regularity: 'REGULAR' | 'IRREGULAR';
  prInterval: number; // normal ~0.12-0.20
  morphology: (t: number) => number;
}

export const RHYTHM_LIBRARY: Record<string, RhythmDefinition> = {
  SINUS: {
    type: 'SINUS',
    pWave: true,
    qrsWidth: 'NARROW',
    regularity: 'REGULAR',
    prInterval: 0.16,
    morphology: (_t) => {
        // ... more complex logic later
        return 0;
    }
  },
  // We will expand this with ~100 rhythms as requested
};

export const getRhythmPath = (_rhythm: RhythmType, timeInBeat: number): number => {
    // Simplified QRS/P/T logic that can be reused
    if (timeInBeat > 0.1 && timeInBeat < 0.2) return Math.sin((timeInBeat - 0.1) * Math.PI * 10) * 8; // P
    if (timeInBeat > 0.25 && timeInBeat < 0.3) { // QRS
        const p = (timeInBeat - 0.25) / 0.05;
        return p < 0.2 ? -p*50 : (p < 0.6 ? -10 + (p-0.2)*150 : 50 - (p-0.6)*125);
    }
    if (timeInBeat > 0.45 && timeInBeat < 0.65) return Math.sin((timeInBeat - 0.45) * Math.PI * 5) * 12; // T
    return 0;
};
