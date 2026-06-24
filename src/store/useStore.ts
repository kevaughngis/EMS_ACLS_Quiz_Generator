import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PatientState, Scenario, TeamMember, UserProgress, EnvironmentType, CalculationChallenge } from '../types';
import { PhysiologyEngine } from '../engine/PhysiologyEngine';
import { SCENARIOS } from '../data/scenarios';

interface AppState {
  scenario: Scenario | null;
  patientState: PatientState | null;
  engine: PhysiologyEngine | null;
  logs: string[];
  isSimulating: boolean;
  studyMode: boolean;

  // New Upgrades
  environment: EnvironmentType;
  team: TeamMember[];
  progress: UserProgress;
  activeChallenge: CalculationChallenge | null;
  activeProcedure: 'NONE' | 'INTUBATION' | 'IO' | 'HANDOVER';
  hints: string[];

  startScenario: (id: string) => void;
  applyAction: (action: string) => void;
  tick: () => void;
  toggleStudyMode: () => void;

  // Action Handlers
  setEnvironment: (env: EnvironmentType) => void;
  assignTeamTask: (memberId: string, task: string) => void;
  solveChallenge: (answer: number) => void;
  setProcedure: (proc: 'NONE' | 'INTUBATION' | 'IO' | 'HANDOVER') => void;
  addXP: (amount: number) => void;
  addHint: (hint: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
  scenario: null,
  patientState: null,
  engine: null,
  logs: [],
  isSimulating: false,
  studyMode: false,

  environment: 'HOSPITAL',
  team: [
    { id: '1', role: 'NURSE', name: 'Nurse Sarah', status: 'IDLE' },
    { id: '2', role: 'RT', name: 'RT Mike', status: 'IDLE' }
  ],
  progress: { xp: 0, level: 1, mastery: {} },
  activeChallenge: null,
  activeProcedure: 'NONE',
  hints: [],

  setEnvironment: (environment) => set({ environment }),

  assignTeamTask: (memberId, task) => set(state => ({
    team: state.team.map(m => m.id === memberId ? { ...m, status: 'BUSY', currentTask: task } : m),
    logs: [...state.logs, `Team: ${state.team.find(m => m.id === memberId)?.name} is now ${task}`]
  })),

  solveChallenge: (answer) => {
    const { activeChallenge, progress, logs } = get();
    if (activeChallenge && answer === activeChallenge.correctDose) {
        set({
            activeChallenge: null,
            progress: { ...progress, xp: progress.xp + 50 },
            logs: [...logs, "Correct dosage calculated! +50 XP"]
        });
        get().applyAction(`DRUG_${activeChallenge.drug}`);
    } else {
        set({ logs: [...logs, "Incorrect dosage! High risk of medication error."] });
    }
  },

  setProcedure: (activeProcedure) => set({ activeProcedure }),

  addXP: (amount) => set(state => {
    const newXP = state.progress.xp + amount;
    const newLevel = Math.floor(newXP / 1000) + 1;
    return { progress: { ...state.progress, xp: newXP, level: newLevel } };
  }),

  addHint: (hint) => set(state => ({ hints: [hint, ...state.hints].slice(0, 5) })),

  startScenario: (id: string) => {
    const scenario = SCENARIOS.find(s => s.id === id);
    if (scenario) {
      const engine = new PhysiologyEngine(scenario.initialState);
      set({
        scenario,
        engine,
        patientState: scenario.initialState,
        logs: [`Scenario started: ${scenario.title}`],
        isSimulating: true,
        studyMode: false
      });
    }
  },

  applyAction: (action: string) => {
    const { engine, logs, scenario } = get();

    // Intercept drugs for PALS/NRP if weight-based math is needed
    if (action.startsWith('EPINEPHRINE') && (scenario?.protocol === 'PALS' || scenario?.protocol === 'NRP')) {
        const weight = scenario.patientWeight || 10;
        const dose = +(weight * 0.01).toFixed(2);
        set({ activeChallenge: {
            drug: 'Epinephrine (0.01mg/kg)',
            correctDose: dose,
            unit: 'mg',
            options: [dose, +(dose * 2).toFixed(2), +(dose / 2).toFixed(2), +(dose + 0.1).toFixed(2)].sort()
        }});
        return;
    }

    if (engine) {
      engine.applyIntervention(action);
      set({ logs: [...logs, `Applied: ${action}`] });
    }
  },

  tick: () => {
    const { engine, isSimulating } = get();
    if (engine && isSimulating) {
      const newState = engine.update();
      set({ patientState: { ...newState } });
    }
  },

  toggleStudyMode: () => set((state) => ({ studyMode: !state.studyMode }))
    }),
    {
        name: 'ems-tutor-storage',
        partialize: (state) => ({ progress: state.progress }), // Only persist career progress
    }
  )
);
