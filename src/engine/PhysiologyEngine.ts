import type { PatientState } from '../types';

export interface DrugEffect {
  name: string;
  concentration: number;
  halfLife: number; // in seconds
  hrEffect: number; // max impact on HR
  mapEffect: number; // max impact on MAP
}

export class PhysiologyEngine {
  private state: PatientState;
  private lastUpdate: number;
  private drugs: Map<string, DrugEffect> = new Map();
  private oxygenLevel: number = 100; // Intracellular/tissue oxygen
  private ph: number = 7.4;

  constructor(initialState: PatientState) {
    this.state = JSON.parse(JSON.stringify(initialState));
    this.lastUpdate = Date.now();
    this.initializeDrugs();
  }

  private initializeDrugs() {
    // Empty for now, populated on applyIntervention
  }

  public update(): PatientState {
    const now = Date.now();
    const dt = Math.min((now - this.lastUpdate) / 1000, 1.0); // Cap dt to avoid huge jumps
    this.lastUpdate = now;

    this.updateDrugs(dt);
    this.simulate(dt);
    return this.state;
  }

  private updateDrugs(dt: number) {
    this.drugs.forEach((drug, key) => {
      // Simple exponential decay: C = C0 * e^(-kt) where k = ln(2)/halfLife
      const k = Math.LN2 / drug.halfLife;
      drug.concentration *= Math.exp(-k * dt);
      if (drug.concentration < 0.01) this.drugs.delete(key);
    });
  }

  private simulate(dt: number) {
    const { vitals, rhythm } = this.state;

    // 1. Calculate Drug Influences
    let drugHrMod = 0;
    let drugMapMod = 0;
    this.drugs.forEach(drug => {
      drugHrMod += drug.hrEffect * drug.concentration;
      drugMapMod += drug.mapEffect * drug.concentration;
    });

    // 2. Cardiac Output influence
    // CO = HR * SV
    const svEfficiency = this.getRhythmEfficiency(rhythm);
    const hypoxiaModifier = Math.max(0.2, this.oxygenLevel / 100);
    const baselineSV = 70 * hypoxiaModifier;

    // Smoothly adjust HR towards target including drug effects
    const baseHr = this.getBaseHrForRhythm(rhythm);
    const targetHr = Math.max(0, baseHr + drugHrMod);
    vitals.hr += (targetHr - vitals.hr) * dt * 0.2;

    vitals.co = (vitals.hr * baselineSV * svEfficiency) / 1000; // L/min

    // Temperature Effect (Hypothermia slows metabolism)
    const tempModifier = Math.max(0.5, 1 - (37 - vitals.temp) * 0.1);
    this.oxygenLevel -= dt * 1.5 * tempModifier;

    // 3. MAP (Mean Arterial Pressure)
    // SVR influenced by drugs (e.g. Epi increases SVR)
    const baselineSVR = 1200;
    const currentSVR = baselineSVR + drugMapMod;
    const targetMap = (vitals.co * currentSVR) / 80;
    vitals.map += (targetMap - vitals.map) * dt * 0.1;

    // 4. Oxygen & pH Dynamics
    if (this.state.breathing === 'APNEIC' || vitals.co < 1) {
      this.oxygenLevel -= dt * 1.5; // Tissues consuming oxygen
      this.ph -= dt * 0.01; // Metabilic/Respiratory Acidosis
    } else {
      this.oxygenLevel += (100 - this.oxygenLevel) * dt * 0.1;
      this.ph += (7.4 - this.ph) * dt * 0.05;
    }
    this.oxygenLevel = Math.max(0, this.oxygenLevel);
    vitals.spo2 = Math.max(0, Math.min(100, this.oxygenLevel + (Math.random() * 2 - 1)));

    // 5. ETCO2 dynamics
    if (vitals.co < 1) {
      vitals.etco2 = Math.max(5, vitals.etco2 - dt * 1.5); // Minimal CO2 during CPR
    } else {
      const targetEtco2 = 40 - (vitals.rr - 12) * 0.5; // Ventilation affects ETCO2
      vitals.etco2 += (targetEtco2 - vitals.etco2) * dt * 0.05;
    }

    this.applyRhythmConstraints();
  }

  private getBaseHrForRhythm(rhythm: string): number {
    switch (rhythm) {
      case 'SINUS': return 75;
      case 'SBAD': return 40;
      case 'STACH': return 120;
      case 'SVT': return 180;
      case 'ASYSTOLE': return 0;
      default: return 70;
    }
  }

  private getRhythmEfficiency(rhythm: string): number {
    switch (rhythm) {
      case 'SINUS': return 1.0;
      case 'STACH': return 0.9;
      case 'AFIB': return 0.75;
      case 'VT': return 0.2;
      case 'VF': return 0.0;
      case 'ASYSTOLE': return 0.0;
      case 'PEA': return 0.0;
      default: return 0.8;
    }
  }

  private applyRhythmConstraints() {
    const { vitals, rhythm } = this.state;
    if (rhythm === 'VF' || rhythm === 'ASYSTOLE' || rhythm === 'PEA') {
      this.state.circulation = 'PULSELESS';
      if (rhythm === 'ASYSTOLE') vitals.hr = 0;
    } else {
      this.state.circulation = (vitals.map > 40) ? 'PULSE' : 'PULSELESS';
    }
  }

  public applyIntervention(type: string, _value?: any) {
    switch (type) {
      case 'EPINEPHRINE':
        this.addDrug('Epinephrine', 1.0, 180, 30, 500);
        break;
      case 'AMIODARONE':
        this.addDrug('Amiodarone', 1.0, 600, -10, -50);
        break;
      case 'ATROPINE':
        this.addDrug('Atropine', 1.0, 120, 40, 0);
        break;
      case 'DEFIBRILLATION':
        this.handleDefib();
        break;
      case 'CPR_COMPRESSION':
        this.state.vitals.co = Math.max(this.state.vitals.co, 1.5); // Manual CO
        this.state.vitals.map = Math.max(this.state.vitals.map, 30);
        this.state.vitals.etco2 = Math.max(this.state.vitals.etco2, 12);
        break;
    }
  }

  private addDrug(name: string, conc: number, hl: number, hrE: number, mapE: number) {
    const existing = this.drugs.get(name);
    if (existing) {
      existing.concentration += conc;
    } else {
      this.drugs.set(name, { name, concentration: conc, halfLife: hl, hrEffect: hrE, mapEffect: mapE });
    }
  }

  private handleDefib() {
    const { rhythm } = this.state;
    const shockable = rhythm === 'VF' || rhythm === 'VT';
    if (shockable) {
      // Chance of conversion increases with better oxygenation and pH
      const successChance = (this.oxygenLevel / 100) * (this.ph / 7.4) * 0.7;
      if (Math.random() < successChance) {
        this.state.rhythm = 'SINUS';
      }
    }
  }

  public getState(): PatientState {
    return this.state;
  }
}
