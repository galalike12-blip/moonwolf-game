import React from 'react';
import { soundEngine } from '../audio/soundEngine';

export type RoleType =
  | 'WEREWOLF'
  | 'MINION'
  | 'SEER'
  | 'BODYGUARD'
  | 'WITCH'
  | 'HUNTER'
  | 'FOOL'
  | 'VILLAGER';

export type FactionType = 'WEREWOLF' | 'VILLAGER' | 'NEUTRAL';

export interface PrivateRoleData {
  role: RoleType;
  roleNameTh: string;
  roleNameEn: string;
  faction: FactionType;
  factionNameTh: string;
  description: string;
  advice: string;
  hasActedNight?: boolean;
  myVoteTargetId?: string | null;
  lastProtectedId?: string | null;
  witchHealAvailable?: boolean;
  witchPoisonAvailable?: boolean;
  witchAttackedVictim?: { id: string; name: string } | null;
  hunterTargetId?: string | null;
  fellowWerewolves?: { id: string; name: string; role: RoleType }[];
}

interface RoleTarotCardProps {
  roleData: PrivateRoleData;
  isFlipped: boolean;
  onToggleFlip: () => void;
}

export const RoleTarotCard: React.FC<RoleTarotCardProps> = ({
  roleData,
  isFlipped,
  onToggleFlip,
}) => {
  const { role } = roleData;
  const isEvil = role === 'WEREWOLF' || role === 'MINION';
  const isFool = role === 'FOOL';

  const handleFlip = () => {
    soundEngine.unlockAudioAndSpeech();
    soundEngine.playCardFlip();
    onToggleFlip();
  };

  return (
    <div className="w-full max-w-[310px] mx-auto select-none">
      <div
        onClick={handleFlip}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleFlip();
          }
        }}
        aria-label={isFlipped ? 'ซ่อนการ์ดบทบาท' : 'แตะเพื่อเปิดดูการ์ดบทบาทลับ'}
        className="perspective-1000 w-full h-[450px] cursor-pointer group focus:outline-none"
      >
        <div
          className={`relative w-full h-full transform-style-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* =================================================================
              FRONT OF CARD (CARTOON BOARD GAME CARD BACK - DEEP CHARCOAL)
             ================================================================= */}
          <div className="absolute inset-0 w-full h-full backface-hidden rounded-2xl bg-[#14161b] border-[3px] border-zinc-700/80 cartoon-card-shadow p-3.5 flex flex-col justify-between overflow-hidden">
            <div className="relative w-full h-full rounded-xl border-2 border-dashed border-zinc-600/60 bg-gradient-to-b from-[#1c1f26] via-[#15171d] to-[#101216] p-4 flex flex-col items-center justify-between">
              {/* Top Banner */}
              <div className="w-full flex justify-between items-center text-zinc-400 text-[11px] font-bold tracking-wider">
                <span className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-amber-400">
                  ✦ MOONWOLF
                </span>
                <span className="text-zinc-500 font-mono-num">SECRET CARD</span>
              </div>

              {/* Expressive Cartoon Mascot Emblem */}
              <div className="relative flex flex-col items-center justify-center my-auto">
                <div className="relative w-40 h-40 rounded-full bg-[#20242c] border-4 border-zinc-600/80 flex items-center justify-center shadow-inner">
                  {/* Cartoon Golden Moon */}
                  <div className="absolute w-28 h-28 rounded-full bg-amber-500 border-4 border-amber-600/80 top-3 left-4 opacity-90" />
                  
                  {/* Cartoon Wolf Silhouette with Thick Lineart */}
                  <svg viewBox="0 0 120 120" className="relative z-10 w-32 h-32 drop-shadow-md">
                    <path
                      d="M26 100 L38 68 L24 50 L40 40 L34 18 L52 32 L60 28 L68 32 L86 18 L80 40 L96 50 L82 68 L94 100 Z"
                      fill="#121418"
                      stroke="#f3f4f6"
                      strokeWidth="3.5"
                      strokeLinejoin="round"
                    />
                    <circle cx="48" cy="48" r="4.5" fill="#ef4444" />
                    <circle cx="72" cy="48" r="4.5" fill="#ef4444" />
                    <circle cx="49" cy="47" r="1.5" fill="#ffffff" />
                    <circle cx="73" cy="47" r="1.5" fill="#ffffff" />
                    <path d="M52 64 Q60 70 68 64" fill="none" stroke="#f3f4f6" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </div>
              </div>

              {/* Tap to Reveal Prompt */}
              <div className="w-full text-center space-y-1">
                <div className="py-2 px-3 rounded-xl bg-amber-500 text-zinc-950 font-black text-xs uppercase tracking-wide cartoon-btn-shadow transition-transform group-hover:scale-[1.02]">
                  แตะเพื่อเปิดดูการ์ดบทบาท
                </div>
                <p className="text-[11px] text-zinc-400">
                  ระวังอย่าให้เพื่อนข้างๆ แอบดูหน้าจอ
                </p>
              </div>
            </div>
          </div>

          {/* =================================================================
              BACK OF CARD (REVEALED CARTOON ROLE - CHARCOAL WITH BOLD ACCENT)
             ================================================================= */}
          <div
            className={`absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-2xl p-3.5 flex flex-col justify-between overflow-hidden border-[3px] cartoon-card-shadow ${
              isEvil
                ? 'bg-[#181113] border-rose-600'
                : isFool
                ? 'bg-[#1b1710] border-amber-500'
                : 'bg-[#12161c] border-emerald-500'
            }`}
          >
            <div className="relative w-full h-full rounded-xl border border-white/10 bg-[#16181e] p-3.5 flex flex-col justify-between">
              {/* Header: English Title & Faction Pill */}
              <div className="flex items-center justify-between text-xs pb-2 border-b border-zinc-700/80">
                <span className="font-bold tracking-wider text-zinc-300 font-mono-num">
                  {roleData.roleNameEn}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md text-[11px] font-black border ${
                    isEvil
                      ? 'bg-rose-950 text-rose-300 border-rose-600'
                      : isFool
                      ? 'bg-amber-950 text-amber-300 border-amber-600'
                      : 'bg-emerald-950 text-emerald-300 border-emerald-600'
                  }`}
                >
                  {roleData.factionNameTh}
                </span>
              </div>

              {/* Expressive Cartoon Role Artwork */}
              <div className="my-2 flex items-center justify-center">
                {role === 'WEREWOLF' && (
                  <div className="w-28 h-28 rounded-2xl bg-[#241317] border-2 border-rose-500/80 p-2 flex items-center justify-center shadow-inner">
                    <svg viewBox="0 0 100 100" className="w-24 h-24">
                      <circle cx="50" cy="50" r="38" fill="#e11d48" opacity="0.25" />
                      <path
                        d="M24 84 L32 54 L18 40 L34 30 L28 12 L44 24 L50 20 L56 24 L72 12 L66 30 L82 40 L68 54 L76 84 Z"
                        fill="#101216"
                        stroke="#fb7185"
                        strokeWidth="3"
                        strokeLinejoin="round"
                      />
                      <polygon points="38,44 46,47 40,50" fill="#ffffff" />
                      <polygon points="62,44 54,47 60,50" fill="#ffffff" />
                      <circle cx="42" cy="46" r="2" fill="#ef4444" />
                      <circle cx="58" cy="46" r="2" fill="#ef4444" />
                    </svg>
                  </div>
                )}

                {role === 'MINION' && (
                  <div className="w-28 h-28 rounded-2xl bg-[#241317] border-2 border-rose-500/80 p-2 flex items-center justify-center shadow-inner">
                    <svg viewBox="0 0 100 100" className="w-24 h-24">
                      <circle cx="50" cy="50" r="36" fill="#9f1239" opacity="0.3" />
                      <path d="M26 84 C28 58 38 46 50 46 C62 46 72 58 74 84 Z" fill="#14171d" stroke="#fb7185" strokeWidth="2.5" />
                      <path d="M50 18 L70 44 L62 60 L38 60 L30 44 Z" fill="#0d0f13" stroke="#fda4af" strokeWidth="2.5" />
                      <circle cx="44" cy="44" r="3" fill="#ef4444" />
                      <circle cx="56" cy="44" r="3" fill="#ef4444" />
                      <line x1="26" y1="74" x2="74" y2="28" stroke="#fecdd3" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                  </div>
                )}

                {role === 'BODYGUARD' && (
                  <div className="w-28 h-28 rounded-2xl bg-[#12241b] border-2 border-emerald-500/80 p-2 flex items-center justify-center shadow-inner">
                    <svg viewBox="0 0 100 100" className="w-24 h-24">
                      <circle cx="50" cy="50" r="38" fill="#10b981" opacity="0.2" />
                      <path d="M50 14 L80 26 V52 C80 72 66 86 50 92 C34 86 20 72 20 52 V26 L50 14 Z" fill="#0c1f16" stroke="#34d399" strokeWidth="3" />
                      <path d="M50 32 L54 46 L68 50 L54 54 L50 68 L46 54 L32 50 L46 46 Z" fill="#a7f3d0" />
                    </svg>
                  </div>
                )}

                {role === 'SEER' && (
                  <div className="w-28 h-28 rounded-2xl bg-[#1e1c15] border-2 border-amber-500/80 p-2 flex items-center justify-center shadow-inner">
                    <svg viewBox="0 0 100 100" className="w-24 h-24">
                      <circle cx="50" cy="50" r="38" fill="#f59e0b" opacity="0.2" />
                      <circle cx="50" cy="50" r="26" fill="#181a20" stroke="#f59e0b" strokeWidth="3" />
                      <path d="M28 50 Q50 32 72 50 Q50 68 28 50 Z" fill="#2d2412" stroke="#fde68a" strokeWidth="2.5" />
                      <circle cx="50" cy="50" r="8" fill="#f59e0b" />
                      <circle cx="50" cy="50" r="3.5" fill="#ffffff" />
                    </svg>
                  </div>
                )}

                {role === 'WITCH' && (
                  <div className="w-28 h-28 rounded-2xl bg-[#131d1a] border-2 border-emerald-500/80 p-2 flex items-center justify-center shadow-inner">
                    <svg viewBox="0 0 100 100" className="w-24 h-24">
                      <circle cx="50" cy="50" r="38" fill="#10b981" opacity="0.15" />
                      <path d="M30 26 H40 V36 L48 62 C50 70 44 78 36 78 H34 C26 78 20 70 22 62 L30 36 Z" fill="#064e3b" stroke="#34d399" strokeWidth="2.5" />
                      <path d="M60 26 H70 V36 L78 62 C80 70 74 78 66 78 H64 C56 78 50 70 52 62 L60 36 Z" fill="#7f1d1d" stroke="#f87171" strokeWidth="2.5" />
                      <circle cx="35" cy="58" r="4" fill="#6ee7b7" />
                      <circle cx="65" cy="58" r="4" fill="#fca5a5" />
                    </svg>
                  </div>
                )}

                {role === 'HUNTER' && (
                  <div className="w-28 h-28 rounded-2xl bg-[#122426] border-2 border-teal-400/80 p-2 flex items-center justify-center shadow-inner">
                    <svg viewBox="0 0 100 100" className="w-24 h-24">
                      <circle cx="50" cy="50" r="36" fill="#042f2e" stroke="#2dd4bf" strokeWidth="3" />
                      <circle cx="50" cy="50" r="18" fill="none" stroke="#99f6e4" strokeWidth="2" strokeDasharray="3 3" />
                      <line x1="50" y1="12" x2="50" y2="88" stroke="#ccfbf1" strokeWidth="2.5" />
                      <line x1="12" y1="50" x2="88" y2="50" stroke="#ccfbf1" strokeWidth="2.5" />
                      <circle cx="50" cy="50" r="5" fill="#ef4444" />
                    </svg>
                  </div>
                )}

                {role === 'FOOL' && (
                  <div className="w-28 h-28 rounded-2xl bg-[#281e10] border-2 border-amber-400/80 p-2 flex items-center justify-center shadow-inner">
                    <svg viewBox="0 0 100 100" className="w-24 h-24">
                      <circle cx="50" cy="52" r="35" fill="#291805" stroke="#fbbf24" strokeWidth="3" />
                      <path d="M24 70 L20 38 L38 52 L50 26 L62 52 L80 38 L76 70 Z" fill="#78350f" stroke="#fde68a" strokeWidth="2.5" />
                      <circle cx="20" cy="34" r="4" fill="#fde68a" />
                      <circle cx="50" cy="22" r="4" fill="#fde68a" />
                      <circle cx="80" cy="34" r="4" fill="#fde68a" />
                    </svg>
                  </div>
                )}

                {role === 'VILLAGER' && (
                  <div className="w-28 h-28 rounded-2xl bg-[#141b24] border-2 border-sky-400/80 p-2 flex items-center justify-center shadow-inner">
                    <svg viewBox="0 0 100 100" className="w-24 h-24">
                      <circle cx="50" cy="52" r="36" fill="#0284c7" opacity="0.2" />
                      <path d="M40 22 L60 22 L66 32 L34 32 Z" fill="#1e293b" stroke="#7dd3fc" strokeWidth="2.5" />
                      <rect x="36" y="32" width="28" height="38" rx="4" fill="#0f172a" stroke="#7dd3fc" strokeWidth="2.5" />
                      <circle cx="50" cy="50" r="7" fill="#f59e0b" />
                      <path d="M30 70 L70 70 L74 80 L26 80 Z" fill="#1e293b" stroke="#7dd3fc" strokeWidth="2.5" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Title & Tactical Rules */}
              <div className="text-center space-y-1">
                <h3
                  className={`text-lg font-black tracking-tight ${
                    isEvil
                      ? 'text-rose-400'
                      : isFool
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {roleData.roleNameTh}
                </h3>
                <p className="text-xs text-zinc-200 leading-snug">
                  {roleData.description}
                </p>

                {roleData.fellowWerewolves && roleData.fellowWerewolves.length > 0 && (
                  <div className="rounded-lg bg-rose-950 border border-rose-600 px-2 py-1 text-[11px] text-rose-200 font-bold">
                    🐺 พรรคพวกหมาป่า: {roleData.fellowWerewolves.map((w) => w.name).join(', ')}
                  </div>
                )}

                <div className="pt-1 border-t border-zinc-700/80">
                  <p className="text-[11px] text-zinc-400 leading-tight">
                    {roleData.advice}
                  </p>
                </div>
              </div>

              <div className="text-center pt-1">
                <span className="text-[10px] text-zinc-400 font-medium underline">
                  แตะที่การ์ดเพื่อคว่ำการ์ดกลับ
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
