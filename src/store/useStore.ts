import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PatientState, Scenario, TeamMember, UserProgress, EnvironmentType, CalculationChallenge } from '../types';
import { PhysiologyEngine } from '../engine/PhysiologyEngine';
import { SCENARIOS } from '../data/scenarios';

interface AppState {
  scenario: Scenario | null;
  patientState: PatientState | null;
  secondaryPatientState: PatientState | null;
  activePatientIndex: 0 | 1;
  engine: PhysiologyEngine | null;
  secondaryEngine: PhysiologyEngine | null;
  logs: string[];
  isSimulating: boolean;
  studyMode: boolean;

  // New Upgrades
  environment: EnvironmentType;
  team: TeamMember[];
  progress: UserProgress;
  activeChallenge: CalculationChallenge | null;
  activeProcedure: 'NONE' | 'INTUBATION' | 'IO' | 'HANDOVER' | 'DEFIB_INTERFACE' | 'HISTORY' | 'EQUIPMENT' | 'VITALS_TRENDS' | 'CAREER';
  hints: string[];

  // Defib State
  defibEnergy: number;
  defibCharge: number; // 0 to 100
  isSync: boolean;

  startScenario: (id: string) => void;
  applyAction: (action: string, skipChallenge?: boolean) => void;
  setActivePatient: (index: 0 | 1) => void;
  triagePatient: (index: 0 | 1, tag: 'RED' | 'YELLOW' | 'GREEN' | 'BLACK') => void;
  tick: () => void;
  toggleStudyMode: () => void;

  // Action Handlers
  setEnvironment: (env: EnvironmentType) => void;
  assignTeamTask: (memberId: string, task: string) => void;
  solveChallenge: (answer: number) => void;
  setProcedure: (proc: 'NONE' | 'INTUBATION' | 'IO' | 'HANDOVER' | 'DEFIB_INTERFACE' | 'HISTORY' | 'EQUIPMENT' | 'VITALS_TRENDS' | 'CAREER') => void;
  addXP: (amount: number) => void;
  addHint: (hint: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
  scenario: null,
  patientState: null,
  secondaryPatientState: null,
  activePatientIndex: 0,
  engine: null,
  secondaryEngine: null,
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

  defibEnergy: 200,
  defibCharge: 0,
  isSync: false,

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
        get().applyAction(activeChallenge.protocolAction, true);
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
      const secondaryEngine = scenario.difficulty === 'HARD' ? new PhysiologyEngine({ ...scenario.initialState, rhythm: 'SBAD' }) : null;
      set({
        scenario,
        engine,
        secondaryEngine,
        patientState: scenario.initialState,
        secondaryPatientState: secondaryEngine ? secondaryEngine.update() : null,
        activePatientIndex: 0,
        logs: [`Scenario started: ${scenario.title}`],
        isSimulating: true,
        studyMode: false
      });
    }
  },

  setActivePatient: (activePatientIndex) => set({ activePatientIndex }),

  triagePatient: (index, tag) => set(state => ({
    logs: [...state.logs, `Patient ${index === 0 ? 'A' : 'B'} triaged as ${tag}`]
  })),

  applyAction: (action: string, skipChallenge: boolean = false) => {
    const { engine, secondaryEngine, activePatientIndex, logs, scenario } = get();
    const currentEngine = activePatientIndex === 0 ? engine : secondaryEngine;

    // Intercept drugs for PALS/NRP if weight-based math is needed
    if (!skipChallenge && action.startsWith('EPINEPHRINE') && (scenario?.protocol === 'PALS' || scenario?.protocol === 'NRP')) {
        const weight = scenario.patientWeight || 10;
        const dose = +(weight * 0.01).toFixed(2);
        set({ activeChallenge: {
            drug: 'Epinephrine (0.01mg/kg)',
            protocolAction: 'EPINEPHRINE',
            correctDose: dose,
            unit: 'mg',
            options: [dose, +(dose * 2).toFixed(2), +(dose / 2).toFixed(2), +(dose + 0.1).toFixed(2)].sort()
        }});
        return;
    }

    if (currentEngine) {
      currentEngine.applyIntervention(action);
      set({ logs: [...logs, `Patient ${activePatientIndex === 0 ? 'A' : 'B'}: Applied ${action}`] });
    }
  },

  tick: () => {
    const { engine, secondaryEngine, isSimulating } = get();
    if (isSimulating) {
        if (engine) {
            const newState = engine.update();
            set({ patientState: { ...newState } });
        }
        if (secondaryEngine) {
            const newState = secondaryEngine.update();
            set({ secondaryPatientState: { ...newState } });
        }
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
