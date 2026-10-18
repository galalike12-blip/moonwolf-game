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
  const isMystic = role === 'SEER' || role === 'WITCH';
  const isProtector = role === 'BODYGUARD' || role === 'HUNTER';
  const isFool = role === 'FOOL';

  const handleFlip = () => {
    soundEngine.unlockAudioAndSpeech();
    soundEngine.playCardFlip();
    onToggleFlip();
  };

  return (
    <div className="w-full max-w-[300px] mx-auto select-none">
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
        aria-label={isFlipped ? 'ซ่อนไพ่บทบาท' : 'แตะเพื่อเปิดดูไพ่บทบาท'}
        className="perspective-1000 w-full h-[440px] cursor-pointer group focus:outline-none"
      >
        <div
          className={`relative w-full h-full transform-style-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* FRONT OF CARD (UNFLIPPED MYSTICAL BACK) */}
          <div className="absolute inset-0 w-full h-full backface-hidden rounded-2xl bg-[#0b1021] border border-purple-400/30 shadow-2xl shadow-purple-950/50 p-4 flex flex-col justify-between overflow-hidden">
            <div className="relative w-full h-full rounded-xl border border-slate-700/70 bg-gradient-to-b from-[#111832] via-[#090d1a] to-[#130d26] p-5 flex flex-col items-center justify-between">
              <div className="w-full flex justify-between items-center text-purple-300/50 text-xs font-display tracking-widest">
                <span>✦ MOONWOLF</span>
                <span>DESTINY TAROT</span>
              </div>

              <div className="relative flex items-center justify-center my-2">
                <svg
                  viewBox="0 0 200 200"
                  className="w-44 h-44 text-purple-300/80 transition-transform duration-500 group-hover:scale-105"
                >
                  <defs>
                    <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#a855f7" stopOpacity="0.35" />
                      <stop offset="70%" stopColor="#6366f1" stopOpacity="0.08" />
                      <stop offset="100%" stopColor="#070a12" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                  <circle cx="100" cy="100" r="88" fill="url(#moonGlow)" />
                  <circle
                    cx="100"
                    cy="100"
                    r="82"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                    opacity="0.45"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="68"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    opacity="0.6"
                  />
                  <polygon
                    points="100,26 122,78 174,100 122,122 100,174 78,122 26,100 78,78"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    opacity="0.35"
                  />
                  <path
                    d="M115 48 A52 52 0 1 0 148 134 A42 42 0 1 1 115 48 Z"
                    fill="#e2e8f0"
                    opacity="0.9"
                  />
                  <path
                    d="M78 142 L84 114 L76 98 L85 86 L83 72 L95 80 L106 74 L112 62 L117 77 L126 84 L118 96 L122 118 L130 142 Z"
                    fill="#1e1b4b"
                    stroke="#c084fc"
                    strokeWidth="1.5"
                  />
                  <circle cx="103" cy="84" r="2" fill="#f43f5e" />
                </svg>
              </div>

              <div className="text-center space-y-1.5">
                <p className="font-display text-sm tracking-widest text-purple-200 uppercase">
                  แตะเพื่อเปิดไพ่บทบาทลับ
                </p>
                <p className="text-xs text-slate-400">
                  โปรดระวังอย่าให้ผู้เล่นคนอื่นเห็นหน้าจอของคุณ
                </p>
              </div>
            </div>
          </div>

          {/* BACK OF CARD (REVEALED SECRET ROLE) */}
          <div
            className={`absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-2xl p-4 flex flex-col justify-between overflow-hidden border shadow-2xl ${
              isEvil
                ? 'bg-[#14070c] border-rose-500/50 shadow-rose-950/60'
                : isMystic
                ? 'bg-[#0f0a1e] border-purple-400/50 shadow-purple-950/60'
                : isProtector
                ? 'bg-[#071713] border-emerald-400/50 shadow-emerald-950/60'
                : isFool
                ? 'bg-[#1a1206] border-amber-400/50 shadow-amber-950/60'
                : 'bg-[#09131f] border-sky-400/40 shadow-sky-950/50'
            }`}
          >
            <div className="relative w-full h-full rounded-xl border border-white/10 bg-black/30 p-4 flex flex-col justify-between">
              {/* Top Role & Faction Line */}
              <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2.5">
                <span className="font-display tracking-wider text-slate-300 uppercase">
                  {roleData.roleNameEn}
                </span>
                <span
                  className={`font-medium ${
                    isEvil
                      ? 'text-rose-400'
                      : isMystic
                      ? 'text-purple-300'
                      : isProtector
                      ? 'text-emerald-300'
                      : isFool
                      ? 'text-amber-300'
                      : 'text-sky-300'
                  }`}
                >
                  {roleData.factionNameTh}
                </span>
              </div>

              {/* Custom Role Tarot SVG Illustration */}
              <div className="my-1.5 flex items-center justify-center">
                {(role === 'WEREWOLF' || role === 'MINION') && (
                  <svg viewBox="0 0 180 150" className="w-36 h-28">
                    <defs>
                      <radialGradient id="bloodMoon" cx="50%" cy="45%" r="45%">
                        <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.9" />
                        <stop offset="65%" stopColor="#9f1239" stopOpacity="0.45" />
                        <stop offset="100%" stopColor="#14070c" stopOpacity="0" />
                      </radialGradient>
                    </defs>
                    <circle cx="90" cy="68" r="56" fill="url(#bloodMoon)" />
                    <circle cx="90" cy="68" r="36" fill="#e11d48" opacity="0.85" />
                    <path
                      d="M52 138 L62 96 L48 76 L64 62 L58 38 L78 54 L90 48 L102 54 L122 38 L116 62 L132 76 L118 96 L128 138 Z"
                      fill="#090406"
                      stroke="#fb7185"
                      strokeWidth="1.8"
                    />
                    <polygon points="72,72 84,76 75,80" fill="#ffe4e6" />
                    <polygon points="108,72 96,76 105,80" fill="#ffe4e6" />
                  </svg>
                )}

                {role === 'SEER' && (
                  <svg viewBox="0 0 180 150" className="w-36 h-28">
                    <defs>
                      <radialGradient id="seerOrb" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#e9d5ff" stopOpacity="0.95" />
                        <stop offset="45%" stopColor="#a855f7" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#0f0a1e" stopOpacity="0" />
                      </radialGradient>
                    </defs>
                    <circle cx="90" cy="75" r="58" fill="url(#seerOrb)" />
                    <circle
                      cx="90"
                      cy="75"
                      r="38"
                      fill="#1e1035"
                      stroke="#d8b4fe"
                      strokeWidth="2"
                    />
                    <path
                      d="M58 75 Q90 46 122 75 Q90 104 58 75 Z"
                      fill="#3b0764"
                      stroke="#f3e8ff"
                      strokeWidth="1.8"
                    />
                    <circle cx="90" cy="75" r="11" fill="#c084fc" />
                    <circle cx="90" cy="75" r="5" fill="#ffffff" />
                  </svg>
                )}

                {role === 'WITCH' && (
                  <svg viewBox="0 0 180 150" className="w-36 h-28">
                    <defs>
                      <radialGradient id="witchBrew" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#c084fc" stopOpacity="0.85" />
                        <stop offset="55%" stopColor="#10b981" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#0f0a1e" stopOpacity="0" />
                      </radialGradient>
                    </defs>
                    <circle cx="90" cy="75" r="56" fill="url(#witchBrew)" />
                    {/* Two Potion Elixirs (Heal & Poison) */}
                    <path
                      d="M62 42 H74 V56 L86 92 C88 100 82 112 72 112 H64 C54 112 48 100 50 92 L62 56 Z"
                      fill="#064e3b"
                      stroke="#34d399"
                      strokeWidth="2"
                    />
                    <path
                      d="M106 42 H118 V56 L130 92 C132 100 126 112 116 112 H108 C98 112 92 100 94 92 L106 56 Z"
                      fill="#4c0519"
                      stroke="#fb7185"
                      strokeWidth="2"
                    />
                    <circle cx="68" cy="88" r="6" fill="#6ee7b7" />
                    <circle cx="112" cy="88" r="6" fill="#f43f5e" />
                  </svg>
                )}

                {role === 'BODYGUARD' && (
                  <svg viewBox="0 0 180 150" className="w-36 h-28">
                    <defs>
                      <radialGradient id="aegisGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#34d399" stopOpacity="0.85" />
                        <stop offset="55%" stopColor="#059669" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#071713" stopOpacity="0" />
                      </radialGradient>
                    </defs>
                    <circle cx="90" cy="75" r="58" fill="url(#aegisGlow)" />
                    <path
                      d="M90 24 L130 40 V76 C130 104 112 124 90 134 C68 124 50 104 50 76 V40 L90 24 Z"
                      fill="#06281e"
                      stroke="#6ee7b7"
                      strokeWidth="2.2"
                    />
                    <path
                      d="M90 48 L96 68 L116 74 L96 80 L90 100 L84 80 L64 74 L84 68 Z"
                      fill="#d1fae5"
                    />
                  </svg>
                )}

                {role === 'HUNTER' && (
                  <svg viewBox="0 0 180 150" className="w-36 h-28">
                    <circle
                      cx="90"
                      cy="75"
                      r="46"
                      fill="#06281e"
                      stroke="#34d399"
                      strokeWidth="2"
                    />
                    <circle
                      cx="90"
                      cy="75"
                      r="26"
                      fill="none"
                      stroke="#6ee7b7"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                    />
                    <line
                      x1="90"
                      y1="18"
                      x2="90"
                      y2="132"
                      stroke="#a7f3d0"
                      strokeWidth="1.8"
                    />
                    <line
                      x1="33"
                      y1="75"
                      x2="147"
                      y2="75"
                      stroke="#a7f3d0"
                      strokeWidth="1.8"
                    />
                    <circle cx="90" cy="75" r="6" fill="#f43f5e" />
                  </svg>
                )}

                {role === 'FOOL' && (
                  <svg viewBox="0 0 180 150" className="w-36 h-28">
                    <circle
                      cx="90"
                      cy="75"
                      r="50"
                      fill="#291805"
                      stroke="#fbbf24"
                      strokeWidth="2"
                    />
                    {/* Jester Crown */}
                    <path
                      d="M50 96 L44 54 L72 74 L90 42 L108 74 L136 54 L130 96 Z"
                      fill="#78350f"
                      stroke="#fde68a"
                      strokeWidth="2"
                    />
                    <circle cx="44" cy="50" r="5" fill="#fde68a" />
                    <circle cx="90" cy="38" r="5" fill="#fde68a" />
                    <circle cx="136" cy="50" r="5" fill="#fde68a" />
                  </svg>
                )}

                {role === 'VILLAGER' && (
                  <svg viewBox="0 0 180 150" className="w-36 h-28">
                    <defs>
                      <radialGradient id="lanternGlow" cx="50%" cy="55%" r="50%">
                        <stop offset="0%" stopColor="#fde68a" stopOpacity="0.85" />
                        <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#09131f" stopOpacity="0" />
                      </radialGradient>
                    </defs>
                    <circle cx="90" cy="78" r="56" fill="url(#lanternGlow)" />
                    <path
                      d="M78 36 L102 36 L108 50 L72 50 Z"
                      fill="#1e293b"
                      stroke="#94a3b8"
                      strokeWidth="1.8"
                    />
                    <rect
                      x="74"
                      y="50"
                      width="32"
                      height="48"
                      rx="4"
                      fill="#0f172a"
                      stroke="#bae6fd"
                      strokeWidth="1.8"
                    />
                    <path
                      d="M90 60 C98 72, 98 84, 90 90 C82 84, 82 72, 90 60 Z"
                      fill="#fbbf24"
                    />
                    <path
                      d="M66 98 L114 98 L120 112 L60 112 Z"
                      fill="#1e293b"
                      stroke="#94a3b8"
                      strokeWidth="1.8"
                    />
                  </svg>
                )}
              </div>

              {/* Role Title & Description */}
              <div className="text-center space-y-1.5">
                <h3
                  className={`text-xl font-bold tracking-tight ${
                    isEvil
                      ? 'text-rose-400'
                      : isMystic
                      ? 'text-purple-200'
                      : isProtector
                      ? 'text-emerald-300'
                      : isFool
                      ? 'text-amber-300'
                      : 'text-sky-200'
                  }`}
                >
                  {roleData.roleNameTh}
                </h3>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {roleData.description}
                </p>

                {/* Show fellow werewolves if Minion or multiple Werewolves */}
                {roleData.fellowWerewolves && roleData.fellowWerewolves.length > 0 && (
                  <div className="rounded-lg bg-rose-950/60 border border-rose-500/40 px-2.5 py-1.5 text-[11px] text-rose-200">
                    พรรคพวกหมาป่า:{' '}
                    <strong>
                      {roleData.fellowWerewolves.map((w) => w.name).join(', ')}
                    </strong>
                  </div>
                )}

                <div className="pt-1.5 border-t border-white/10">
                  <p className="text-[11px] text-slate-400 leading-normal">
                    {roleData.advice}
                  </p>
                </div>
              </div>

              <div className="text-center pt-1">
                <span className="text-[11px] text-slate-400 underline decoration-slate-600">
                  แตะที่ไพ่อีกครั้งเพื่อคว่ำไพ่ซ่อนหน้าจอ
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
