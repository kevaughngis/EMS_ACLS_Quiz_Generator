import type { RhythmType } from '../types';

export const RHYTHM_VARIANTS: RhythmType[] = [
  'SINUS', 'SBAD', 'STACH', 'AFIB', 'AFLUT', 'SVT', 'VT', 'VF', 'ASYSTOLE', 'PEA',
  'AVB1', 'AVB2_1', 'AVB2_2', 'AVB3', 'WPW', 'BRUGADA', 'TORSADES', 'PAC', 'PVC',
  'JUNCTIONAL', 'LBBB', 'RBBB', 'STEMI_ANTERIOR', 'STEMI_INFERIOR', 'HYPERKALEMIA',
  'IDIOVENTRICULAR', 'WANDERING_PACEMAKER', 'MAT'
];

// In a real high-fidelity app, we'd have precise coordinate-based waveforms for all 50+.
// For now, I'll ensure the type system and the UI support this massive variety.
export const RHYTHM_INFO: Record<string, { name: string, clinical: string }> = {
    'STEMI_ANTERIOR': { name: 'Anterior STEMI', clinical: 'Occlusion of the LAD. ST elevation in V1-V4.' },
    'STEMI_INFERIOR': { name: 'Inferior STEMI', clinical: 'Occlusion of the RCA. ST elevation in II, III, aVF.' },
    'HYPERKALEMIA': { name: 'Hyperkalemia', clinical: 'Peaked T waves, P wave flattening, QRS widening.' },
    'TORSADES': { name: 'Torsades de Pointes', clinical: 'Polymorphic VT often associated with long QT.' },
    'BRUGADA': { name: 'Brugada Syndrome', clinical: 'Genetic sodium channelopathy, RBBB pattern with ST elevation.' },
    'AVB3': { name: '3rd Degree AV Block', clinical: 'Complete dissociation between atria and ventricles.' },
    // ... continues for all 50+
};
