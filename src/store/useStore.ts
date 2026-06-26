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
  activeProcedure: 'NONE' | 'INTUBATION' | 'IO' | 'HANDOVER' | 'DEFIB_INTERFACE' | 'HISTORY' | 'EQUIPMENT' | 'VITALS_TRENDS' | 'CAREER' | 'PHYSICAL_EXAM' | 'VENTILATOR' | 'PHARMACY' | 'POCUS' | 'CONSULT' | 'PROTOCOL_TABLET' | 'IV_TITRATION' | 'NEURO_EXAM' | 'ABG_LAB' | 'ANALYTICS' | 'BROSELOW' | 'LEADERSHIP' | 'PCR_CHART' | 'TRAUMA_SUITE' | 'VASCULAR_ACCESS' | 'RADIOLOGY' | 'ALGORITHM_AR' | 'CRISIS_FIX' | 'MATERNAL_SUITE' | 'TCCC_SUITE' | 'TOXIDROME_LAB' | 'FLIGHT_DECK' | 'CARDIOLOGY_SUITE' | 'CBRNE_SUITE' | 'BURN_SUITE';
  hints: string[];
  activeCrisis: { id: string, label: string, description: string } | null;

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
  setProcedure: (proc: 'NONE' | 'INTUBATION' | 'IO' | 'HANDOVER' | 'DEFIB_INTERFACE' | 'HISTORY' | 'EQUIPMENT' | 'VITALS_TRENDS' | 'CAREER' | 'PHYSICAL_EXAM' | 'VENTILATOR' | 'PHARMACY' | 'POCUS' | 'CONSULT' | 'PROTOCOL_TABLET' | 'IV_TITRATION' | 'NEURO_EXAM' | 'ABG_LAB' | 'ANALYTICS' | 'BROSELOW' | 'LEADERSHIP' | 'PCR_CHART' | 'TRAUMA_SUITE' | 'VASCULAR_ACCESS' | 'RADIOLOGY' | 'ALGORITHM_AR' | 'CRISIS_FIX' | 'MATERNAL_SUITE' | 'TCCC_SUITE' | 'TOXIDROME_LAB' | 'FLIGHT_DECK' | 'CARDIOLOGY_SUITE' | 'CBRNE_SUITE' | 'BURN_SUITE') => void;
  addXP: (amount: number) => void;
  addHint: (hint: string) => void;
  setStore: (partial: Partial<AppState>) => void;
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
    { id: '1', role: 'NURSE', name: 'Nurse Sarah', status: 'IDLE', stress: 0 },
    { id: '2', role: 'RT', name: 'RT Mike', status: 'IDLE', stress: 0 }
  ],
  progress: { xp: 0, level: 1, mastery: {} },
  activeChallenge: null,
  activeProcedure: 'NONE',
  hints: [],
  activeCrisis: null,

  setStore: (partial) => set(state => ({ ...state, ...partial })),

  defibEnergy: 200,
  defibCharge: 0,
  isSync: false,

  setEnvironment: (environment) => set({ environment }),

  assignTeamTask: (memberId, task) => set(state => {
    const member = state.team.find(m => m.id === memberId);
    const newStress = Math.min(100, (member?.stress || 0) + 15);
    return {
        team: state.team.map(m => m.id === memberId ? { ...m, status: 'BUSY', currentTask: task, stress: newStress } : m),
        logs: [...state.logs, `Team: ${state.team.find(m => m.id === memberId)?.name} is now ${task}`]
    };
  }),

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
    let scenario = SCENARIOS.find(s => s.id === id);
    let initialState = scenario?.initialState;

    // Sandbox interception
    if ((window as any).customSandboxState) {
        initialState = (window as any).customSandboxState;
        (window as any).customSandboxState = null;
    }

    if (scenario && initialState) {
      const engine = new PhysiologyEngine(initialState);
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
    const { engine, secondaryEngine, isSimulating, activeCrisis } = get();
    if (isSimulating) {
        // Random Crisis Chance (0.1% per tick)
        if (!activeCrisis && Math.random() < 0.001) {
            const crises = [
                { id: 'suction_clog', label: 'Suction Unit Clogged', description: 'Debris has obstructed the canister. Airway management is compromised.' },
                { id: 'monitor_fail', label: 'Monitor Lead Detached', description: 'Signal lost on Lead II. Please reattach electrodes.' },
                { id: 'iv_infil', label: 'IV Infiltration', description: 'The primary IV site has blown. New access required.' },
                { id: 'bystander_interference', label: 'Bystander Interference', description: 'A distraught family member is obstructing the workspace. Calm them down.' }
            ];
            const randomCrisis = crises[Math.floor(Math.random() * crises.length)];
            set({ activeCrisis: randomCrisis, logs: [...get().logs, `CRISIS: ${randomCrisis.label}`] });
        }

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
