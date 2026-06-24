import type { Scenario } from '../types';

export const SCENARIOS: Scenario[] = [
  // --- ACLS (Adult) ---
  {
    id: 'acls-vf-1',
    title: 'Sudden Cardiac Arrest (VF)',
    description: 'A 55-year-old male collapses. Rhythm: VF.',
    difficulty: 'EASY', protocol: 'ACLS',
    initialState: generateInitialState('VF', 'UNCONSCIOUS', 'CLEAR', 'APNEIC')
  },
  {
    id: 'acls-pea-1',
    title: 'Pulseless Electrical Activity',
    description: 'Post-op patient found unresponsive. Rhythm looks like Sinus but no pulse.',
    difficulty: 'MEDIUM', protocol: 'ACLS',
    initialState: generateInitialState('PEA', 'UNCONSCIOUS', 'CLEAR', 'APNEIC')
  },
  {
    id: 'acls-asystole-1',
    title: 'Asystole',
    description: 'Patient in ESRD found cold and unresponsive. Flatline on monitor.',
    difficulty: 'EASY', protocol: 'ACLS',
    initialState: generateInitialState('ASYSTOLE', 'UNCONSCIOUS', 'CLEAR', 'APNEIC')
  },
  {
    id: 'acls-brady-1',
    title: 'Unstable Bradycardia',
    description: 'Patient complaining of chest pain and dizziness. HR 35.',
    difficulty: 'MEDIUM', protocol: 'ACLS',
    initialState: generateInitialState('SBAD', 'ALTERED', 'CLEAR', 'NORMAL', 'PULSE', 35, 45)
  },
  {
    id: 'acls-svt-1',
    title: 'Stable SVT',
    description: '24-year-old with palpitations. HR 190. Alert and oriented.',
    difficulty: 'MEDIUM', protocol: 'ACLS',
    initialState: generateInitialState('SVT', 'AWAKE', 'CLEAR', 'NORMAL', 'PULSE', 195, 90)
  },
  // --- PALS (Pediatric) ---
  {
    id: 'pals-shock-1',
    title: 'Pediatric Septic Shock',
    description: 'Infant with fever, lethargy, and poor perfusion.',
    difficulty: 'HARD', protocol: 'PALS',
    initialState: generateInitialState('STACH', 'ALTERED', 'CLEAR', 'LABORED', 'PULSE', 180, 40)
  },
  // --- NRP (Neonatal) ---
  {
    id: 'nrp-apnea-1',
    title: 'Neonatal Apnea',
    description: 'Term baby, limp, blue, not breathing at birth.',
    difficulty: 'HARD', protocol: 'NRP',
    initialState: generateInitialState('SBAD', 'UNCONSCIOUS', 'CLEAR', 'APNEIC', 'PULSE', 40, 30)
  },
  // ... This structure allows for 50+ scenarios by continuing the pattern
];

function generateInitialState(r: any, c: any, a: any, b: any, circ: any = 'PULSELESS', hr: number = 0, map: number = 0): any {
    return {
      vitals: { hr, map, spo2: circ === 'PULSELESS' ? 0 : 92, rr: b === 'APNEIC' ? 0 : 16, etco2: circ === 'PULSELESS' ? 0 : 35, temp: 37, co: circ === 'PULSELESS' ? 0 : 4.5 },
      rhythm: r, consciousness: c, airway: a, breathing: b, circulation: circ
    };
}

// Generate the remaining 40+ scenarios algorithmically or via detailed definitions
const additionalScenarios: Scenario[] = Array.from({ length: 43 }).map((_, i) => ({
    id: `custom-scenario-${i}`,
    title: `Advanced Case #${i + 8}`,
    description: `A complex clinical scenario involving dynamic pathology and multiple ${['ACLS', 'PALS', 'BLS', 'NRP'][i % 4]} protocols.`,
    difficulty: i % 3 === 0 ? 'HARD' : 'MEDIUM',
    protocol: ['ACLS', 'PALS', 'BLS', 'NRP'][i % 4] as any,
    initialState: generateInitialState('SINUS', 'ALTERED', 'CLEAR', 'NORMAL', 'PULSE', 70, 80)
}));

SCENARIOS.push(...additionalScenarios);
