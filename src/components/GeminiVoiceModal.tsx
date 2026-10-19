import { Bot, Check, Mic, Play, Sparkles, Volume2, X } from 'lucide-react';
import React, { useState } from 'react';
import {
  GEMINI_VOICES_LIST,
  GeminiVoiceId,
  soundEngine,
  TTSEngineType,
} from '../audio/soundEngine';

interface GeminiVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GeminiVoiceModal: React.FC<GeminiVoiceModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedVoice, setSelectedVoice] = useState<GeminiVoiceId>(
    soundEngine.selectedGeminiVoice
  );
  const [engine, setEngine] = useState<TTSEngineType>(soundEngine.ttsEngine);
  const [isPlayingTest, setIsPlayingTest] = useState(false);

  if (!isOpen) return null;

  const handleSelectVoice = (voiceId: GeminiVoiceId) => {
    setSelectedVoice(voiceId);
    soundEngine.setGeminiVoice(voiceId);
  };

  const handleToggleEngine = (newEngine: TTSEngineType) => {
    setEngine(newEngine);
    soundEngine.setTTSEngine(newEngine);
  };

  const handleTestAudio = async () => {
    soundEngine.unlockAudioAndSpeech();
    setIsPlayingTest(true);
    const testSample =
      'ขอให้ทุกคนหลับตาลง มนุษย์หมาป่าจงตื่นขึ้น และเลือกเหยื่อที่ต้องการสังหาร';
    const previewAudioId = selectedVoice === 'Fenrir' ? 'night_werewolf' : undefined;

    await soundEngine.speakThaiGM(testSample, previewAudioId);
    setTimeout(() => {
      setIsPlayingTest(false);
    }, 3500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md max-h-[90vh] rounded-2xl bg-[#14161c] border-2 border-zinc-700 flex flex-col cartoon-card-shadow overflow-hidden text-zinc-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b-2 border-zinc-800 bg-[#181a22]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border-2 border-amber-500/50 flex items-center justify-center">
              <Bot className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-black text-zinc-100">
                ตั้งค่าเสียง GM ผู้บรรยาย (Google Gemini)
              </h2>
              <p className="text-[11px] text-amber-400/90 font-medium">
                ✨ เสียงพากย์ภาษาไทยแบบเดียวกันทั้ง iPhone & Android
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            aria-label="ปิด"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto">
          {/* Feature Badge Banner */}
          <div className="rounded-xl bg-emerald-950/40 border-2 border-emerald-600/40 p-3 flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xs space-y-1">
              <div className="font-bold text-emerald-300">
                หมดปัญหา iPhone กับ Android เสียงไม่ตรงกัน
              </div>
              <p className="text-[11px] text-zinc-300 leading-relaxed">
                ระบบสังเคราะห์เสียงด้วย <strong className="text-emerald-300">Google Gemini Audio (WAV 24kHz)</strong> ส่งตรงจากเซิร์ฟเวอร์ ให้ทุกเครื่องได้ยินน้ำเสียงและจังหวะเดียวกัน 100%
              </p>
            </div>
          </div>

          {/* Engine Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-amber-400" />
              โหมดการออกเสียง:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleToggleEngine('GEMINI')}
                className={`min-h-[46px] p-2.5 rounded-xl border-2 text-left transition-all ${
                  engine === 'GEMINI'
                    ? 'bg-amber-500/15 border-amber-500 text-amber-300 font-bold'
                    : 'bg-zinc-800/60 border-zinc-700/80 text-zinc-400 hover:bg-zinc-800'
                }`}
              >
                <div className="text-xs flex items-center gap-1.5">
                  <span>🤖 Gemini AI (Cloud)</span>
                  {engine === 'GEMINI' && <Check className="w-3.5 h-3.5 text-amber-400 ml-auto" />}
                </div>
                <div className="text-[10px] text-zinc-400 font-normal mt-0.5">
                  เสียงเดียวกันทุกเครื่อง 100%
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleToggleEngine('NATIVE')}
                className={`min-h-[46px] p-2.5 rounded-xl border-2 text-left transition-all ${
                  engine === 'NATIVE'
                    ? 'bg-amber-500/15 border-amber-500 text-amber-300 font-bold'
                    : 'bg-zinc-800/60 border-zinc-700/80 text-zinc-400 hover:bg-zinc-800'
                }`}
              >
                <div className="text-xs flex items-center gap-1.5">
                  <span>📱 เบราว์เซอร์ในเครื่อง</span>
                  {engine === 'NATIVE' && <Check className="w-3.5 h-3.5 text-amber-400 ml-auto" />}
                </div>
                <div className="text-[10px] text-zinc-400 font-normal mt-0.5">
                  Siri (iOS) / Google (Android)
                </div>
              </button>
            </div>
          </div>

          {/* Gemini Voice Persona Choices (only when Gemini is enabled) */}
          {engine === 'GEMINI' && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-amber-400" />
                เลือกบุคลิกเสียง GM ของ Google Gemini:
              </label>

              <div className="space-y-2">
                {GEMINI_VOICES_LIST.map((v) => {
                  const isSelected = selectedVoice === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => handleSelectVoice(v.id)}
                      className={`w-full min-h-[52px] p-3 rounded-xl border-2 text-left transition-all flex items-start justify-between gap-3 ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500/90 text-zinc-100 shadow-md'
                          : 'bg-zinc-850/80 border-zinc-750 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-amber-300">
                            {v.nameTh}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700 font-medium">
                            {v.genderTh}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-tight">
                          {v.styleTh}
                        </p>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected
                            ? 'border-amber-400 bg-amber-500 text-zinc-950 font-bold'
                            : 'border-zinc-600'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Test Listen Button */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleTestAudio}
              disabled={isPlayingTest}
              className="w-full min-h-[46px] rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-zinc-950 font-black text-xs flex items-center justify-center gap-2 transition-all cartoon-btn-shadow disabled:opacity-60 cursor-pointer"
            >
              <Play className={`w-4 h-4 fill-zinc-950 ${isPlayingTest ? 'animate-pulse' : ''}`} />
              {isPlayingTest ? 'กำลังเล่นเสียงตัวอย่าง...' : '🔊 ทดสอบฟังเสียงพากย์ของ GM ตอนนี้'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t-2 border-zinc-800 bg-[#181a22] flex items-center justify-between text-xs text-zinc-400">
          <span>โมเดล: gemini-3.8-flash-lite-tts</span>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] px-4 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-200 font-bold border border-zinc-700"
          >
            ตกลง
          </button>
        </div>
      </div>
    </div>
  );
};
