class SoundEngine {
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  private hrOscillator: OscillatorNode | null = null;
  private isMuted = false;

  constructor() {
    // Initialized on first user interaction to comply with browser policies
  }

  private init() {
    if (this.audioCtx) return;
    this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.masterGain = this.audioCtx.createGain();
    this.masterGain.connect(this.audioCtx.destination);
    this.masterGain.gain.value = 0.3;
  }

  playBeep(hr: number, spo2: number) {
    this.init();
    if (!this.audioCtx || !this.masterGain || this.isMuted) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    // Map SpO2 to pitch (90-100% -> 440Hz-880Hz)
    const frequency = 440 + (spo2 - 90) * 44;
    osc.frequency.setValueAtTime(frequency, this.audioCtx.currentTime);
    osc.type = 'sine';

    gain.gain.setValueAtTime(0, this.audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.2, this.audioCtx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.1);
  }

  playHeartSound(hr: number) {
    this.init();
    if (!this.audioCtx || !this.masterGain || this.isMuted) return;

    // S1 (Low thud)
    this.createThud(60, 0.1);
    // S2 (Slightly higher, shorter) - delayed by 300ms (standard systole approx)
    setTimeout(() => this.createThud(80, 0.08), 300 * (60/hr));
  }

  private createThud(freq: number, duration: number) {
    if (!this.audioCtx || !this.masterGain) return;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + duration);

    gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.audioCtx.currentTime + duration);
  }

  playCriticalAlarm() {
    this.init();
    if (!this.audioCtx || !this.masterGain || this.isMuted) return;

    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(900, now);
    osc.frequency.setValueAtTime(700, now + 0.1);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.setValueAtTime(0, now + 0.2);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(now + 0.2);
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  speak(text: string, voiceType: 'TEAM' | 'PATIENT' | 'SYSTEM' = 'TEAM') {
    if (this.isMuted || !window.speechSynthesis) return;

    // Cancel existing speech to avoid overlap pile-ups in fast scenarios
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Attempt to select distinct voices if available
    const voices = window.speechSynthesis.getVoices();

    switch (voiceType) {
      case 'TEAM':
        utterance.pitch = 1.0;
        utterance.rate = 1.1;
        break;
      case 'PATIENT':
        utterance.pitch = 0.8;
        utterance.rate = 0.9;
        break;
      case 'SYSTEM':
        utterance.pitch = 1.2;
        utterance.rate = 1.0;
        break;
    }

    window.speechSynthesis.speak(utterance);
  }
}

export const soundEngine = new SoundEngine();
