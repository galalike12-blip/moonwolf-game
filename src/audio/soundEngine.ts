// Web Audio API Synthesizer & Web Speech API Thai GM Announcer (Zero External Assets)

class MoonwolfAudioEngine {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;
  public isVoiceEnabled: boolean = true;
  private isSpeakingCallback: ((speaking: boolean) => void) | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public onSpeakingStateChange(cb: (speaking: boolean) => void) {
    this.isSpeakingCallback = cb;
  }

  public unlockAudioAndSpeech() {
    const ctx = this.getContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
  }

  // 1. Wolf Howl (Night Phase & Werewolf Action)
  public playHowl() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Main howl oscillator
    const osc = ctx.createOscillator();
    const subOsc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    // Vibrato LFO
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.setValueAtTime(5.2, now);
    lfoGain.gain.setValueAtTime(10, now);
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    osc.type = 'sawtooth';
    subOsc.type = 'sine';

    // Pitch envelope: eerie rise and mournful fall
    osc.frequency.setValueAtTime(185, now);
    osc.frequency.exponentialRampToValueAtTime(415, now + 0.75);
    osc.frequency.setValueAtTime(415, now + 1.1);
    osc.frequency.exponentialRampToValueAtTime(340, now + 1.8);
    osc.frequency.exponentialRampToValueAtTime(165, now + 2.7);

    subOsc.frequency.setValueAtTime(92.5, now);
    subOsc.frequency.exponentialRampToValueAtTime(207.5, now + 0.75);
    subOsc.frequency.exponentialRampToValueAtTime(130, now + 2.7);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(350, now);
    filter.frequency.exponentialRampToValueAtTime(980, now + 0.8);
    filter.frequency.exponentialRampToValueAtTime(280, now + 2.7);
    filter.Q.setValueAtTime(4.5, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.24, now + 0.45);
    gain.gain.setValueAtTime(0.22, now + 1.3);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);

    osc.connect(filter);
    subOsc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    subOsc.start(now);
    lfo.start(now);

    osc.stop(now + 2.85);
    subOsc.stop(now + 2.85);
    lfo.stop(now + 2.85);
  }

  // 2. Dawn Bell Chime (Dawn Discussion & Role Reveal)
  public playBellChime() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const partials = [
      { freq: 523.25, amp: 0.25, dur: 2.2 }, // C5
      { freq: 783.99, amp: 0.16, dur: 1.8 }, // G5
      { freq: 1046.5, amp: 0.12, dur: 1.5 }, // C6
      { freq: 1567.98, amp: 0.06, dur: 1.0 }, // G6
    ];

    partials.forEach((p, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(p.freq, now + idx * 0.04);

      gain.gain.setValueAtTime(0.001, now + idx * 0.04);
      gain.gain.linearRampToValueAtTime(p.amp, now + idx * 0.04 + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + p.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.04);
      osc.stop(now + p.dur + 0.05);
    });
  }

  // 3. Gavel Hit (Voting Phase & Exile Resolution)
  public playGavelHit() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const strikes = [0, 0.24];
    strikes.forEach((offset) => {
      const t = ctx.currentTime + offset;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(195, t);
      osc.frequency.exponentialRampToValueAtTime(48, t + 0.16);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.45, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.22);
    });
  }

  // 4. Tarot Card Flip Shimmer
  public playCardFlip() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.045);

      gain.gain.setValueAtTime(0.001, now + i * 0.045);
      gain.gain.linearRampToValueAtTime(0.1, now + i * 0.045 + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.045 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.045);
      osc.stop(now + i * 0.045 + 0.38);
    });
  }

  // 5. Countdown Tension Tick (When timer <= 5s)
  public playTick(urgent: boolean = false) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(urgent ? 880 : 660, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.06);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  // 6. Victory Fanfare
  public playVictoryFanfare(faction: 'WEREWOLF' | 'VILLAGER') {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const freqs =
      faction === 'VILLAGER'
        ? [523.25, 659.25, 783.99, 1046.5] // C Major triumphant
        : [220, 261.63, 311.13, 415.3]; // A Minor / Dark gothic chord

    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = faction === 'VILLAGER' ? 'triangle' : 'sawtooth';
      osc.frequency.setValueAtTime(f, now + i * 0.14);

      gain.gain.setValueAtTime(0.001, now + i * 0.14);
      gain.gain.linearRampToValueAtTime(0.18, now + i * 0.14 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.14 + 1.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.14);
      osc.stop(now + i * 0.14 + 1.85);
    });
  }

  // 7. Web Speech API Thai Game Master Voice Narration
  public speakThaiGM(text: string) {
    if (this.isMuted || !this.isVoiceEnabled) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'th-TH';
      utterance.rate = 0.96;
      utterance.pitch = 0.9;
      utterance.volume = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const thaiVoice =
        voices.find((v) => v.lang === 'th-TH' || v.lang === 'th_TH') ||
        voices.find((v) => v.lang.toLowerCase().startsWith('th'));
      if (thaiVoice) {
        utterance.voice = thaiVoice;
      }

      utterance.onstart = () => {
        this.isSpeakingCallback?.(true);
      };
      utterance.onend = () => {
        this.isSpeakingCallback?.(false);
      };
      utterance.onerror = () => {
        this.isSpeakingCallback?.(false);
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      this.isSpeakingCallback?.(false);
    }
  }
}

export const soundEngine = new MoonwolfAudioEngine();
