export interface Vitals {
  hr: number;
  map: number;
  spo2: number;
  rr: number;
  etco2: number;
  temp: number;
  co: number;
}

export type RhythmType =
  | 'SINUS'
  | 'SBAD'
  | 'STACH'
  | 'AFIB'
  | 'AFLUT'
  | 'SVT'
  | 'VT'
  | 'VF'
  | 'ASYSTOLE'
  | 'PEA'
  | 'AVB1'
  | 'AVB2_1'
  | 'AVB2_2'
  | 'AVB3'
  | 'WPW'
  | 'BRUGADA'
  | 'TORSADES'
  | 'PAC'
  | 'PVC'
  | 'JUNCTIONAL'
  | 'LBBB'
  | 'RBBB'
  | 'STEMI_ANTERIOR'
  | 'STEMI_INFERIOR'
  | 'HYPERKALEMIA'
  | 'IDIOVENTRICULAR'
  | 'WANDERING_PACEMAKER'
  | 'MAT';

export interface PatientState {
  vitals: Vitals;
  rhythm: RhythmType;
  consciousness: 'AWAKE' | 'ALTERED' | 'UNCONSCIOUS';
  airway: 'CLEAR' | 'OBSTRUCTED' | 'INTUBATED';
  breathing: 'NORMAL' | 'LABORED' | 'APNEIC';
  circulation: 'PULSE' | 'PULSELESS';
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  initialState: PatientState;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  protocol: 'ACLS' | 'BLS' | 'PALS' | 'NRP';
  patientWeight?: number; // Added for pharmacy math
}

export interface TeamMember {
  id: string;
  role: 'NURSE' | 'RT' | 'MEDIC' | 'INTERN';
  name: string;
  status: 'IDLE' | 'BUSY' | 'DONE';
  currentTask?: string;
}

export type EnvironmentType = 'HOSPITAL' | 'AMBULANCE' | 'ER';

export interface UserProgress {
  xp: number;
  level: number;
  mastery: Record<string, number>; // protocol -> mastery percentage
}

export interface CalculationChallenge {
  drug: string;
  correctDose: number;
  unit: string;
  options: number[];
}
