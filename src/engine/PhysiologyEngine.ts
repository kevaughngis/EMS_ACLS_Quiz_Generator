import type { PatientState } from '../types';

export class PhysiologyEngine {
  private state: PatientState;
  private lastUpdate: number;
  private drugs: Map<string, any> = new Map();
  private oxygen: number = 100;
  private ph: number = 7.4;
  private potassium: number = 4.0;
  private volume: number = 5.0; // Liters
  private cumulativeCPR: number = 0;

  constructor(initialState: PatientState) {
    this.state = JSON.parse(JSON.stringify(initialState));
    this.lastUpdate = Date.now();
  }

  public update(): PatientState {
    const now = Date.now();
    const dt = Math.min((now - this.lastUpdate) / 1000, 1.0);
    this.lastUpdate = now;

    this.processKinetics(dt);
    this.simulate(dt);
    return this.state;
  }

  private processKinetics(dt: number) {
    this.drugs.forEach((d, k) => {
      d.concentration *= Math.exp(-(Math.LN2 / d.halfLife) * dt);
      if (d.concentration < 0.001) this.drugs.delete(k);
    });
  }

  private simulate(dt: number) {
    const { vitals, rhythm } = this.state;

    // 1. Vasoactive/Inotropic Influences
    let alpha1 = 0, beta1 = 0, beta2 = 0;
    this.drugs.forEach(d => {
      alpha1 += d.alpha * d.concentration;
      beta1 += d.beta1 * d.concentration;
      beta2 += d.beta2 * d.concentration;
    });

    // 2. Cardiac Output & MAP
    const eff = this.getEfficiency(rhythm);
    const targetHr = (this.getBaseHr(rhythm) + beta1 * 40) * (this.ph < 7.1 ? 0.6 : 1.0);
    vitals.hr += (targetHr - vitals.hr) * dt * 0.4;

    const sv = (60 + beta2 * 20) * eff * (this.oxygen / 100) * (this.volume / 5);
    vitals.co = (vitals.hr * sv) / 1000;

    const svr = 1200 + alpha1 * 800;
    const targetMap = (vitals.co * svr) / 80;
    vitals.map += (targetMap - vitals.map) * dt * 0.2;

    // 3. Respiratory & Metabolic
    const isArrest = ['VF', 'ASYSTOLE', 'PEA'].includes(rhythm);
    if (isArrest && this.cumulativeCPR < 0.1) {
      this.oxygen -= dt * 2.5;
      this.ph -= dt * 0.02;
    } else {
      const vent = (vitals.rr / 12) * (this.state.airway === 'CLEAR' ? 1 : 0.1);
      this.oxygen += (100 - this.oxygen) * dt * 0.3 * (vent + (isArrest ? 0.2 : 0));
      this.ph += (7.4 - this.ph) * dt * 0.1 * vent;
    }

    this.cumulativeCPR = Math.max(0, this.cumulativeCPR - dt * 0.5);
    vitals.spo2 = Math.max(0, Math.min(100, this.oxygen + (Math.random() - 0.5)));

    this.updateTwelveLead();
    this.updateClinicalStatus();
  }

  private updateTwelveLead() {
    const rhythm = this.state.rhythm;
    const leads = ['I', 'II', 'III', 'aVR', 'aVL', 'aVF', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6'];

    this.state.twelveLead = leads.map(l => {
      let st = 0;

      if (rhythm === 'STEMI_ANTERIOR') {
        if (['V1', 'V2', 'V3', 'V4'].includes(l)) st = 4.5;
        if (['II', 'III', 'aVF'].includes(l)) st = -1.0; // Reciprocal
      } else if (rhythm === 'STEMI_INFERIOR') {
        if (['II', 'III', 'aVF'].includes(l)) st = 3.0;
        if (['I', 'aVL'].includes(l)) st = -1.5; // Reciprocal
      } else if (rhythm === 'HYPERKALEMIA') {
        st = 0.5; // Mild elevation or peaked T (simulated as slight ST elevation for now)
      }

      return { lead: l, stSegment: st };
    });
  }

  private updateClinicalStatus() {
    const { vitals } = this.state;
    if (vitals.map < 45) this.state.circulation = 'PULSELESS';
    else this.state.circulation = 'PULSE';

    if (vitals.map < 60 || this.oxygen < 80) this.state.consciousness = 'ALTERED';
    if (vitals.map < 40 || this.oxygen < 60) this.state.consciousness = 'UNCONSCIOUS';
    if (vitals.map > 70 && this.oxygen > 90) this.state.consciousness = 'AWAKE';
  }

  private getEfficiency(r: string): number {
    const m: any = { SINUS: 1, STACH: 0.9, SBAD: 1, SVT: 0.5, AFIB: 0.7, VT: 0.1, VF: 0, ASYSTOLE: 0, PEA: 0 };
    return m[r] || 0.8;
  }

  private getBaseHr(r: string): number {
    const m: any = { SINUS: 70, STACH: 130, SBAD: 35, SVT: 190, AFIB: 120, VT: 160, VF: 0, ASYSTOLE: 0, PEA: 80 };
    return m[r] || 70;
  }

  public applyIntervention(type: string) {
    switch (type) {
      case 'EPINEPHRINE': this.addDrug('Epi', 180, 1.0, 1.0, 0.5); break;
      case 'AMIODARONE': this.addDrug('Amio', 900, -0.2, -0.4, 0); break;
      case 'CPR_COMPRESSION': this.cumulativeCPR = 1.0; break;
      case 'DEFIBRILLATION': this.shock(); break;
    }
  }

  private addDrug(name: string, hl: number, a: number, b1: number, b2: number) {
    this.drugs.set(name, { concentration: 1.0, halfLife: hl, alpha: a, beta1: b1, beta2: b2 });
  }

  private shock() {
    if (['VF', 'VT'].includes(this.state.rhythm)) {
      if (Math.random() < (this.oxygen / 100) * 0.8) this.state.rhythm = 'SINUS';
    }
  }
}
