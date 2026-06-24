import type { Scenario } from '../types';

export const SCENARIOS: Scenario[] = [
  {
    id: 'acls-vf-1',
    title: 'Sudden Cardiac Arrest (VF)',
    description: 'A 55-year-old male collapses in the waiting room. Monitor shows Ventricular Fibrillation.',
    difficulty: 'EASY',
    protocol: 'ACLS',
    initialState: {
      vitals: {
        hr: 0,
        map: 0,
        spo2: 0,
        rr: 0,
        etco2: 0,
        temp: 37,
        co: 0
      },
      rhythm: 'VF',
      consciousness: 'UNCONSCIOUS',
      airway: 'CLEAR',
      breathing: 'APNEIC',
      circulation: 'PULSELESS'
    }
  },
  {
    id: 'nrp-meconium-1',
    title: 'Meconium Aspiration',
    description: 'Term infant born via emergency C-section. Thick meconium present. Infant is limp and apneic.',
    difficulty: 'HARD',
    protocol: 'NRP',
    initialState: {
      vitals: {
        hr: 40,
        map: 30,
        spo2: 60,
        rr: 0,
        etco2: 20,
        temp: 36.5,
        co: 0.5
      },
      rhythm: 'SBAD',
      consciousness: 'UNCONSCIOUS',
      airway: 'OBSTRUCTED',
      breathing: 'APNEIC',
      circulation: 'PULSE'
    }
  },
  {
    id: 'pals-brady-1',
    title: 'Pediatric Bradycardia',
    description: '8-year-old female with profound bradycardia and respiratory distress. HR 35, SpO2 82%.',
    difficulty: 'MEDIUM',
    protocol: 'PALS',
    initialState: {
      vitals: {
        hr: 35,
        map: 45,
        spo2: 82,
        rr: 10,
        etco2: 50,
        temp: 37,
        co: 2.0
      },
      rhythm: 'SBAD',
      consciousness: 'ALTERED',
      airway: 'CLEAR',
      breathing: 'LABORED',
      circulation: 'PULSE'
    }
  },
  {
    id: 'bls-unresponsive-1',
    title: 'Adult Unresponsive',
    description: 'You find a person lying on the sidewalk. No response to verbal or tactile stimulus.',
    difficulty: 'EASY',
    protocol: 'BLS',
    initialState: {
      vitals: {
        hr: 0,
        map: 0,
        spo2: 0,
        rr: 0,
        etco2: 0,
        temp: 37,
        co: 0
      },
      rhythm: 'ASYSTOLE',
      consciousness: 'UNCONSCIOUS',
      airway: 'CLEAR',
      breathing: 'APNEIC',
      circulation: 'PULSELESS'
    }
  }
];
