/**
 * PATTYDE VAAL - Web Audio API Synthesizer
 * 100% self-contained synthesized retro-lab and cartoon comedy sound effects.
 * Safe for all CSPs (zero eval, zero external audio assets).
 */

class SoundEffects {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.machineOsc1 = null;
    this.machineOsc2 = null;
    this.machineGain = null;
    this.stretchOsc = null;
    this.stretchGain = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted && this.machineGain) {
      this.machineGain.gain.setValueAtTime(0, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  // Dramatic countdown beep (3, 2, 1... GO)
  playCountdownBeep(isFinal = false) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = isFinal ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(isFinal ? 880 : 440, now);
    if (isFinal) {
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.3);
    }

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (isFinal ? 0.45 : 0.2));

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + (isFinal ? 0.5 : 0.25));
  }

  // Interactive stretch tension sound (pitch rises as user pulls tail)
  startStretchSound() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    if (this.stretchOsc) return;

    this.stretchOsc = this.ctx.createOscillator();
    this.stretchGain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    this.stretchOsc.type = 'sawtooth';
    this.stretchOsc.frequency.setValueAtTime(180, now);

    // Lowpass filter to make it sound like rubbery tension
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, now);

    this.stretchGain.gain.setValueAtTime(0.01, now);
    this.stretchGain.gain.linearRampToValueAtTime(0.12, now + 0.1);

    this.stretchOsc.connect(filter);
    filter.connect(this.stretchGain);
    this.stretchGain.connect(this.ctx.destination);

    this.stretchOsc.start(now);
  }

  updateStretchPitch(stretchFraction) {
    if (this.isMuted || !this.stretchOsc || !this.ctx) return;
    const freq = 180 + Math.min(stretchFraction, 1.5) * 320;
    this.stretchOsc.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.05);
  }

  stopStretchSound() {
    if (!this.stretchOsc || !this.ctx) return;
    const now = this.ctx.currentTime;
    try {
      this.stretchGain.gain.linearRampToValueAtTime(0.001, now + 0.05);
      this.stretchOsc.stop(now + 0.06);
    } catch (e) {
      // Ignored if already stopped
    }
    this.stretchOsc = null;
    this.stretchGain = null;
  }

  // Classic cartoon elastic boing when tail snaps back
  playBoing() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(550, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.4);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.5);

    // Secondary vibrato boing
    setTimeout(() => {
      if (this.isMuted || !this.ctx) return;
      const t = this.ctx.currentTime;
      const o2 = this.ctx.createOscillator();
      const g2 = this.ctx.createGain();
      o2.type = 'triangle';
      o2.frequency.setValueAtTime(220, t);
      o2.frequency.linearRampToValueAtTime(140, t + 0.25);
      g2.gain.setValueAtTime(0.2, t);
      g2.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      o2.connect(g2);
      g2.connect(this.ctx.destination);
      o2.start(t);
      o2.stop(t + 0.32);
    }, 80);
  }

  // Suction whoosh when tail is inserted into AI tube
  playSuctionWhoosh() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(750, now + 0.15);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.35);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.42);
  }

  // AI Machine hum & vibration during 10s process
  startMachineHum() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    if (this.machineOsc1) return;

    const now = this.ctx.currentTime;
    this.machineOsc1 = this.ctx.createOscillator();
    this.machineOsc2 = this.ctx.createOscillator();
    this.machineGain = this.ctx.createGain();

    this.machineOsc1.type = 'sawtooth';
    this.machineOsc1.frequency.setValueAtTime(65, now); // 65Hz heavy hum

    this.machineOsc2.type = 'square';
    this.machineOsc2.frequency.setValueAtTime(130, now); // Detuned octave

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, now);

    this.machineGain.gain.setValueAtTime(0.01, now);
    this.machineGain.gain.linearRampToValueAtTime(0.18, now + 0.4);

    this.machineOsc1.connect(filter);
    this.machineOsc2.connect(filter);
    filter.connect(this.machineGain);
    this.machineGain.connect(this.ctx.destination);

    this.machineOsc1.start(now);
    this.machineOsc2.start(now);
  }

  stopMachineHum() {
    if (!this.machineGain || !this.ctx) return;
    const now = this.ctx.currentTime;
    try {
      this.machineGain.gain.linearRampToValueAtTime(0.001, now + 0.2);
      if (this.machineOsc1) this.machineOsc1.stop(now + 0.25);
      if (this.machineOsc2) this.machineOsc2.stop(now + 0.25);
    } catch (e) {}
    this.machineOsc1 = null;
    this.machineOsc2 = null;
    this.machineGain = null;
  }

  // Electric spark zap
  playSparkZap() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1200 + Math.random() * 800, now);
    osc.frequency.linearRampToValueAtTime(200, now + 0.08);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  // AI scanner beam sweep
  playLaserSweep() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.25);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  // Pop sound when tail ejects from machine
  playPop() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.1);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.13);
  }

  // Sunglasses bling chime (cool guy sound)
  playSunglassesBling() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const notes = [1046.5, 1318.5, 1567.98, 2093.0]; // C6, E6, G6, C7
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.38);
      }, idx * 75);
    });
  }

  // Comical failure horn / sad trombone
  playFailureFanfare() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const pitches = [349.23, 329.63, 311.13, 293.66]; // F4, E4, Eb4, D4
    pitches.forEach((freq, i) => {
      setTimeout(() => {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);
        if (i === pitches.length - 1) {
          osc.frequency.linearRampToValueAtTime(freq - 25, now + 0.7); // Slide down on last note
        }

        const dur = i === pitches.length - 1 ? 0.8 : 0.3;
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(700, now);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + dur + 0.05);
      }, i * 320);
    });
  }

  // Celebration / useless victory fanfare
  playVictoryJingle() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      setTimeout(() => {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.45);
      }, i * 110);
    });
  }
}

// Export singleton instance
window.sfx = new SoundEffects();
