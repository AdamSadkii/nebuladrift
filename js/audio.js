import { loadMuted, saveMuted } from "./storage.js";

/** Tiny Web Audio SFX — muted by default */
export class AudioBus {
  constructor() {
    this.muted = loadMuted();
    this.ctx = null;
    this.thrustGain = null;
    this.thrustOsc = null;
    this.thrusting = false;
  }

  ensure() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
  }

  resume() {
    this.ensure();
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  setMuted(muted) {
    this.muted = muted;
    saveMuted(muted);
    if (muted) this.stopThrust();
  }

  toggleMute() {
    this.setMuted(!this.muted);
    return this.muted;
  }

  beep(freq, dur, type = "sine", gain = 0.08) {
    if (this.muted) return;
    this.ensure();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(g);
    g.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  playPickup(multiplier) {
    const base = 520 + multiplier * 40;
    this.beep(base, 0.08, "triangle", 0.07);
    setTimeout(() => this.beep(base * 1.35, 0.1, "sine", 0.05), 40);
  }

  playDeath() {
    if (this.muted) return;
    this.ensure();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.45);
    g.gain.setValueAtTime(0.1, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    osc.connect(g);
    g.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.55);
  }

  playNearMiss() {
    this.beep(880, 0.04, "square", 0.03);
  }

  playPower() {
    this.beep(300, 0.06, "square", 0.05);
    setTimeout(() => this.beep(450, 0.08, "triangle", 0.05), 50);
    setTimeout(() => this.beep(600, 0.1, "sine", 0.04), 100);
  }

  playMilestone() {
    this.beep(400, 0.08, "square", 0.06);
    setTimeout(() => this.beep(500, 0.08, "square", 0.06), 80);
    setTimeout(() => this.beep(650, 0.12, "triangle", 0.07), 160);
  }

  startThrust() {
    if (this.muted || this.thrusting) return;
    this.ensure();
    if (!this.ctx) return;
    this.thrusting = true;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGaian();
    osc.type = "sawtooth";
    osc.frequency.value = 55;
    g.gain.value = 0.025;
    osc.connect(g);
    g.connect(this.ctx.destination);
    osc.start();
    this.thrustOsc = osc;
    this.thrustGain = g;
  }

  stopThrust() {
    this.thrusting = false;
    if (this.thrustOsc) {
      try {
        this.thrustOsc.stop();
      } catch (_) {}
      this.thrustOsc = null;
      this.thrustGain = null;
    }
  }

  setThrusting(on) {
    if (on) this.startThrust();
    else this.stopThrust();
  }
}
