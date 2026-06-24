import { create } from 'zustand';
import type { PatientState, Scenario } from '../types';
import { PhysiologyEngine } from '../engine/PhysiologyEngine';
import { SCENARIOS } from '../data/scenarios';

interface AppState {
  scenario: Scenario | null;
  patientState: PatientState | null;
  engine: PhysiologyEngine | null;
  logs: string[];
  isSimulating: boolean;
  studyMode: boolean;

  startScenario: (id: string) => void;
  applyAction: (action: string) => void;
  tick: () => void;
  toggleStudyMode: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  scenario: null,
  patientState: null,
  engine: null,
  logs: [],
  isSimulating: false,
  studyMode: false,

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
    const { engine, logs } = get();
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
}));
