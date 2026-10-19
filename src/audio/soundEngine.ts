// Web Audio API Synthesizer & Google Gemini AI / Web Speech API Thai GM Announcer
// High fidelity audio streaming for iOS, Android, and Desktop with identical voice timbre

export type GeminiVoiceId = 'Fenrir' | 'Charon' | 'Kore' | 'Puck' | 'Zephyr';
export type TTSEngineType = 'GEMINI' | 'NATIVE';

export interface GeminiVoiceOption {
  id: GeminiVoiceId;
  nameTh: string;
  genderTh: string;
  styleTh: string;
}

export const GEMINI_VOICES_LIST: GeminiVoiceOption[] = [
  {
    id: 'Fenrir',
    nameTh: 'เฟนรีร์ (Fenrir)',
    genderTh: 'ชาย (ทุ้มลึก)',
    styleTh: 'เสียงลึก ดุดัน น่าเกรงขาม สไตล์หมาป่ารัตติกาล (แนะนำ)',
  },
  {
    id: 'Charon',
    nameTh: 'คารอน (Charon)',
    genderTh: 'ชาย (สุขุม)',
    styleTh: 'เสียงทุ้มลึก สุขุม นิ่ง เยือกเย็น เหมาะกับบรรยากาศมืดมิดกอธิค',
  },
  {
    id: 'Kore',
    nameTh: 'คอร์ (Kore)',
    genderTh: 'หญิง (สงบ)',
    styleTh: 'เสียงผู้หญิง นุ่มนวล สงบ ชัดเจน สไตล์แม่มดมนต์ดำ',
  },
  {
    id: 'Puck',
    nameTh: 'พัค (Puck)',
    genderTh: 'กลาง (สดใส)',
    styleTh: 'เสียงกระฉับกระเฉง เล่าเรื่องสนุก มีชีวิตชีวา สไตล์นักเล่านิทาน',
  },
  {
    id: 'Zephyr',
    nameTh: 'เซเฟอร์ (Zephyr)',
    genderTh: 'หญิง (เป็นธรรมชาติ)',
    styleTh: 'เสียงฟังสบาย นุ่มนวล เป็นธรรมชาติ ชัดถ้อยชัดคำ',
  },
];

class MoonwolfAudioEngine {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;
  public isVoiceEnabled: boolean = true;
  public ttsEngine: TTSEngineType = 'GEMINI';
  public selectedGeminiVoice: GeminiVoiceId = 'Fenrir';

  private isSpeakingCallback: ((speaking: boolean) => void) | null = null;
  private currentSourceNode: AudioBufferSourceNode | null = null;
  private currentAudioElement: HTMLAudioElement | null = null;
  private currentAbortController: AbortController | null = null;
  private localAudioCache = new Map<string, AudioBuffer>();
  private preloadedGMAudio = new Map<string, AudioBuffer>();
  private isPreloading: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const savedEngine = localStorage.getItem('moonwolf_tts_engine');
      if (savedEngine === 'GEMINI' || savedEngine === 'NATIVE') {
        this.ttsEngine = savedEngine;
      }
      const savedVoice = localStorage.getItem('moonwolf_gemini_voice') as GeminiVoiceId;
      if (['Fenrir', 'Charon', 'Kore', 'Puck', 'Zephyr'].includes(savedVoice)) {
        this.selectedGeminiVoice = savedVoice;
      }
    }
  }

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

  public async preloadCoreGMAudio() {
    if (this.isPreloading) return;
    this.isPreloading = true;
    const ctx = this.getContext();
    if (!ctx) {
      this.isPreloading = false;
      return;
    }

    const coreIds = [
      'role_reveal',
      'night_werewolf',
      'night_bodyguard',
      'night_seer',
      'night_witch',
      'dawn_wake',
      'voting_start',
      'vote_tie',
      'vote_exiled',
      'dawn_no_kill',
    ];

    for (const id of coreIds) {
      if (this.preloadedGMAudio.has(id)) continue;
      try {
        const res = await fetch(`/audio/gm/${id}.wav`);
        if (res.ok) {
          const ab = await res.arrayBuffer();
          const audioBuffer = await ctx.decodeAudioData(ab);
          this.preloadedGMAudio.set(id, audioBuffer);
        }
      } catch {
        // Silently skip if not available yet
      }
    }
    this.isPreloading = false;
  }

  public onSpeakingStateChange(cb: (speaking: boolean) => void) {
    this.isSpeakingCallback = cb;
  }

  public setTTSEngine(engine: TTSEngineType) {
    this.ttsEngine = engine;
    if (typeof window !== 'undefined') {
      localStorage.setItem('moonwolf_tts_engine', engine);
    }
  }

  public setGeminiVoice(voice: GeminiVoiceId) {
    this.selectedGeminiVoice = voice;
    if (typeof window !== 'undefined') {
      localStorage.setItem('moonwolf_gemini_voice', voice);
    }
  }

  public unlockAudioAndSpeech() {
    const ctx = this.getContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    this.preloadCoreGMAudio().catch(() => {});
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
  }

  public stopAllSpeech() {
    // 1. Cancel in-flight network request
    if (this.currentAbortController) {
      this.currentAbortController.abort();
      this.currentAbortController = null;
    }

    // 2. Stop Web Audio buffer source
    if (this.currentSourceNode) {
      try {
        this.currentSourceNode.stop();
        this.currentSourceNode.disconnect();
      } catch {}
      this.currentSourceNode = null;
    }

    // 3. Stop HTMLAudio fallback element
    if (this.currentAudioElement) {
      try {
        this.currentAudioElement.pause();
        this.currentAudioElement.currentTime = 0;
      } catch {}
      this.currentAudioElement = null;
    }

    // 4. Cancel native SpeechSynthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    this.isSpeakingCallback?.(false);
  }

  // 1. Wolf Howl (Night Phase & Werewolf Action)
  public playHowl() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const subOsc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.setValueAtTime(5.2, now);
    lfoGain.gain.setValueAtTime(10, now);
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    osc.type = 'sawtooth';
    subOsc.type = 'sine';

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
      { freq: 523.25, amp: 0.25, dur: 2.2 },
      { freq: 783.99, amp: 0.16, dur: 1.8 },
      { freq: 1046.5, amp: 0.12, dur: 1.5 },
      { freq: 1567.98, amp: 0.06, dur: 1.0 },
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
        ? [523.25, 659.25, 783.99, 1046.5]
        : [220, 261.63, 311.13, 415.3];

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

  // 7. Automated Thai Game Master Voice Narration
  // Uses pre-rendered Studio Gemini AI audio for zero latency, or on-demand Gemini AI / Web Speech API
  public async speakThaiGM(text: string, audioId?: string) {
    if (this.isMuted || !this.isVoiceEnabled) return;

    const cleanText = text.trim();
    if (!cleanText) return;

    this.stopAllSpeech();

    // 1. High-speed 0ms playback: check if pre-rendered audio asset exists for this phase
    if (this.ttsEngine === 'GEMINI' && audioId) {
      const playedInstant = await this.playPreRenderedAudio(audioId);
      if (playedInstant) return;
    }

    // 2. Dynamic speech: try on-demand Gemini TTS
    if (this.ttsEngine === 'GEMINI') {
      const played = await this.playGeminiAudio(cleanText);
      if (!played) {
        // Fallback cleanly to device Web Speech API (zero delay, offline capable)
        this.speakWebSpeech(cleanText);
      }
    } else {
      this.speakWebSpeech(cleanText);
    }
  }

  // Ultra-fast instant playback of pre-rendered audio asset (< 2ms response time)
  private async playPreRenderedAudio(audioId: string): Promise<boolean> {
    const ctx = this.getContext();
    if (!ctx) return false;

    let buffer = this.preloadedGMAudio.get(audioId);
    if (!buffer) {
      try {
        const res = await fetch(`/audio/gm/${audioId}.wav`);
        if (!res.ok) return false;
        const ab = await res.arrayBuffer();
        buffer = await ctx.decodeAudioData(ab);
        this.preloadedGMAudio.set(audioId, buffer);
      } catch {
        return false;
      }
    }

    this.isSpeakingCallback?.(true);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);

    source.onended = () => {
      if (this.currentSourceNode === source) {
        this.currentSourceNode = null;
        this.isSpeakingCallback?.(false);
      }
    };

    this.currentSourceNode = source;
    source.start(0);
    return true;
  }

  // Play Cloud Gemini TTS via Web Audio API with seamless fallback
  private async playGeminiAudio(text: string): Promise<boolean> {
    const ctx = this.getContext();
    if (!ctx) return false;

    this.isSpeakingCallback?.(true);

    const cacheKey = `${this.selectedGeminiVoice}:${text}`;

    try {
      let audioBuffer: AudioBuffer;

      if (this.localAudioCache.has(cacheKey)) {
        audioBuffer = this.localAudioCache.get(cacheKey)!;
      } else {
        const controller = new AbortController();
        this.currentAbortController = controller;

        const res = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            voice: this.selectedGeminiVoice,
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          return false;
        }

        const data = await res.json();
        if (!data.ok || !data.audioBase64) {
          return false;
        }

        const binary = atob(data.audioBase64);
        const len = binary.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binary.charCodeAt(i);
        }

        audioBuffer = await ctx.decodeAudioData(bytes.buffer.slice(0));
        if (this.localAudioCache.size < 50) {
          this.localAudioCache.set(cacheKey, audioBuffer);
        }
      }

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);

      source.onended = () => {
        if (this.currentSourceNode === source) {
          this.currentSourceNode = null;
          this.isSpeakingCallback?.(false);
        }
      };

      this.currentSourceNode = source;
      source.start(0);
      return true;
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        return true; // Intentionally stopped
      }
      this.isSpeakingCallback?.(false);
      return false;
    } finally {
      this.currentAbortController = null;
    }
  }

  // Web Speech API fallback
  private speakWebSpeech(text: string) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      this.isSpeakingCallback?.(false);
      return;
    }

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
