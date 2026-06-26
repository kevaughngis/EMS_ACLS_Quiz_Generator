import type { PatientState } from '../types';

export class PhysiologyEngine {
  private state: PatientState;
  private lastUpdate: number;
  private drugs: Map<string, {
    central: number,
    peripheral: number,
    halfLife: number,
    alpha: number,
    beta1: number,
    beta2: number,
    k12: number,
    k21: number
  }> = new Map();
  private oxygen: number = 100;
  private ph: number = 7.4;
  private potassium: number = 4.0;
  private volume: number = 5.0; // Liters
  private altitude: number = 0; // Feet
  private cumulativeCPR: number = 0;
  private uterineTone: number = 100; // 0 to 100
  private seizureActivity: number = 0; // 0 to 1
  private acetylcholinesterase: number = 100; // 0 to 100 (for Nerve Agents)
  private burnTBSA: number = 0;

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
      // 2-Compartment Model ODE Approximation
      const centralToPeripheral = d.central * d.k12 * dt;
      const peripheralToCentral = d.peripheral * d.k21 * dt;
      const elimination = d.central * (Math.LN2 / d.halfLife) * dt;

      d.central += peripheralToCentral - centralToPeripheral - elimination;
      d.peripheral += centralToPeripheral - peripheralToCentral;

      if (d.central + d.peripheral < 0.001) this.drugs.delete(k);
    });
  }

  private simulate(dt: number) {
    const { vitals, rhythm } = this.state;

    // Gas Physics - Boyle's & Dalton's Laws
    // Atmospheric pressure P(h) = P0 * (1 - L*h/T0)^(g*M/(R*L))
    const pAtmSeaLevel = 760; // mmHg
    const pAtm = pAtmSeaLevel * Math.pow(1 - 0.0000065 * this.altitude / 288.15, 5.255);
    const pO2_Ambient = pAtm * 0.21; // Dalton's Law: Partial pressure of Oxygen

    // Boyle's Law: P1V1 = P2V2 => V2 = V1 * (P1/P2)
    // As altitude increases, gas volume expands.
    const volumeExpansionFactor = pAtmSeaLevel / pAtm;

    // Maternal High-Stakes Logic
    if (rhythm === 'PPH') {
        this.volume -= dt * 0.05 * (1 - this.uterineTone/100);
        if (this.uterineTone < 30) this.volume -= dt * 0.1; // Gush
    }
    if (rhythm === 'ECLAMPSIA') {
        this.seizureActivity = Math.min(1, this.seizureActivity + dt * 0.2);
        this.oxygen -= dt * 3.0 * this.seizureActivity;
        vitals.hr += dt * 20 * this.seizureActivity;
    }

    // CBRNE / Nerve Agent Logic (SLUDGEM)
    if (this.acetylcholinesterase < 50) {
        const severity = (100 - this.acetylcholinesterase) / 100;
        this.oxygen -= dt * 5.0 * severity;
        vitals.hr -= dt * 30 * severity;
        this.ph -= dt * 0.05 * severity;
    }

    // Burn Fluid Shifts
    if (this.burnTBSA > 0) {
        this.volume -= dt * (this.burnTBSA / 100) * 0.05;
    }

    // 1. Vasoactive/Inotropic Influences (from Central Compartment)
    let alpha1 = 0, beta1 = 0, beta2 = 0;
    this.drugs.forEach(d => {
      alpha1 += d.alpha * d.central;
      beta1 += d.beta1 * d.central;
      beta2 += d.beta2 * d.central;
    });

    // 2. Cardiac Output & MAP (Frank-Starling & SVR)
    const rhythmEff = this.getEfficiency(rhythm);

    // Frank-Starling Law: Stroke volume increases with preload (volume) up to a point
    // Simplified as a curve SV = V / (1 + V/K)
    const baseSV = 70;
    const preloadFactor = (this.volume / 5.0);
    const frankStarling = preloadFactor < 1.2 ? preloadFactor : 1.2 - (preloadFactor - 1.2) * 0.5;

    const targetHr = (this.getBaseHr(rhythm) + beta1 * 40) * (this.ph < 7.1 ? 0.6 : 1.0);
    vitals.hr += (targetHr - vitals.hr) * dt * 0.4;

    const sv = baseSV * frankStarling * (1 + beta2 * 0.3) * rhythmEff;
    vitals.co = (vitals.hr * sv) / 1000;

    const baseSVR = 1200;
    const svr = baseSVR + alpha1 * 1000; // Vasoconstriction increases SVR

    // MAP = CO * SVR / 80 (approx)
    const targetMap = (vitals.co * svr) / 80;
    vitals.map += (targetMap - vitals.map) * dt * 0.2;

    // 3. Respiratory & Metabolic
    const isArrest = ['VF', 'ASYSTOLE', 'PEA'].includes(rhythm);
    if (isArrest && this.cumulativeCPR < 0.1) {
      this.oxygen -= dt * 2.5;
      this.ph -= dt * 0.02;
    } else {
      const ventRate = vitals.rr;
      const airwayResist = this.state.airway === 'CLEAR' ? 1.0 : 0.2;

      // Effective Alveolar Ventilation
      const alvVent = (ventRate / 12) * airwayResist;

      // Dalton's Law influence on SpO2
      // SpO2 target decreases as ambient pO2 drops with altitude
      const oxyTarget = Math.min(100, (pO2_Ambient / 159) * 100);
      this.oxygen += (oxyTarget - this.oxygen) * dt * 0.3 * (alvVent + (isArrest ? 0.2 : 0));
      this.ph += (7.4 - this.ph) * dt * 0.1 * alvVent;
    }

    // Tension Pneumothorax Expansion (Boyle's Law)
    if (this.state.breathing === 'PNEUMOTHORAX') {
        const expansionPressure = (volumeExpansionFactor - 1.0) * 5;
        vitals.map -= dt * expansionPressure; // Mediastinal shift / restricted venous return
        this.oxygen -= dt * volumeExpansionFactor * 2;
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
      } else if (rhythm === 'WELLENS') {
        if (['V2', 'V3'].includes(l)) st = -2.0; // Biphasic or deep inverted T waves
      } else if (rhythm === 'DE_WINTER') {
        if (['V1', 'V2', 'V3', 'V4'].includes(l)) st = -1.0; // Upsloping ST depression with tall, symmetric T waves
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
      case 'EPINEPHRINE': this.addDrug('Epi', 180, 1.0, 1.0, 0.5, 0.5, 0.2); break;
      case 'AMIODARONE': this.addDrug('Amio', 900, -0.2, -0.4, 0, 0.1, 0.05); break;
      case 'ATROPINE': this.addDrug('Atropine', 120, 0, 1.5, 0, 0.3, 0.1); break;
      case 'ADENOSINE': this.addDrug('Adenosine', 6, 0, -2.0, 0, 0.8, 0.8); break;
      case 'NARCAN': this.oxygen = Math.min(100, this.oxygen + 30); break;
      case 'DEXTROSE': this.ph = Math.min(7.45, this.ph + 0.05); break;
      case 'CPR_COMPRESSION': this.cumulativeCPR = 1.0; break;
      case 'DEFIBRILLATION': this.shock(); break;
      case 'INTUBATE_SUCCESS': this.state.airway = 'INTUBATED'; break;
      case 'VENTILATE_SUCCESS': this.oxygen = Math.min(100, this.oxygen + 15); break;
      case 'SUCTION': if(this.state.airway === 'OBSTRUCTED') this.state.airway = 'CLEAR'; break;
      case 'NEEDLE_DECOMPRESSION_SUCCESS': this.state.breathing = 'NORMAL'; this.oxygen = Math.min(100, this.oxygen + 20); break;
      case 'TOURNIQUET_SUCCESS': this.volume = Math.max(2.0, this.volume + 0.1); break; // Stop volume loss
      case 'FUNDAL_MASSAGE': this.uterineTone = Math.min(100, this.uterineTone + 15); break;
      case 'MAGNESIUM_SULFATE': this.seizureActivity = Math.max(0, this.seizureActivity - 0.4); break;
      case 'OXYTOCIN': this.uterineTone = Math.min(100, this.uterineTone + 40); break;
      case 'TV_PACING_START': this.state.rhythm = 'PACED'; break;
      case 'PERICARDIOCENTESIS_DRAIN':
        if (this.state.rhythm === 'TAMPONADE') {
            this.volume = Math.min(5.0, this.volume + 0.1);
            this.state.vitals.hr -= 5;
        }
        break;
      case 'WOUND_PACKING': this.volume += 0.05; break;
      case 'CAT_TOURNIQUET': this.volume += 0.1; break;
      case 'PELVIC_SLING': this.volume += 0.15; break;
      case 'ASCEND': this.altitude = Math.min(30000, this.altitude + 1000); break;
      case 'DESCEND': this.altitude = Math.max(0, this.altitude - 1000); break;
      case 'EXPOSURE_NERVE_AGENT': this.acetylcholinesterase = 10; break;
      case 'PRALIDOXIME_2PAM': this.acetylcholinesterase = Math.min(100, this.acetylcholinesterase + 40); break;
      case 'ATROPINE_CBRNE': this.addDrug('Atropine', 120, 0, 1.5, 0, 0.3, 0.1); break;
      case 'BURN_INITIALIZE': this.burnTBSA = 30; break;
      case 'FLUID_BOLUS_250': this.volume = Math.min(6.0, this.volume + 0.25); break;
    }
  }

  private addDrug(name: string, hl: number, a: number, b1: number, b2: number, k12 = 0.2, k21 = 0.1) {
    this.drugs.set(name, { central: 1.0, peripheral: 0, halfLife: hl, alpha: a, beta1: b1, beta2: b2, k12, k21 });
  }

  private shock() {
    if (['VF', 'VT'].includes(this.state.rhythm)) {
      if (Math.random() < (this.oxygen / 100) * 0.8) this.state.rhythm = 'SINUS';
    }
  }
}
