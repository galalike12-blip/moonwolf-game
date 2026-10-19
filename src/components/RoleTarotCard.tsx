import React from 'react';
import { soundEngine } from '../audio/soundEngine';
import { ROLE_CARD_THEMES, RoleCharacterArt } from './RoleIllustration';

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
  const theme = ROLE_CARD_THEMES[role] || ROLE_CARD_THEMES.VILLAGER;

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
              BACK OF CARD (EXACT STYLE FROM USER REFERENCE IMAGE - 1792393082533.jpg)
             ================================================================= */}
          <div
            style={{
              backgroundColor: theme.cardBg,
              borderColor: theme.borderColor,
            }}
            className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-[28px] p-3.5 flex flex-col justify-between overflow-hidden border-[4px] shadow-2xl"
          >
            {/* Fine Paper / Vignette Texture Overlay */}
            <div className="absolute inset-0 bg-radial from-transparent via-black/10 to-black/50 pointer-events-none rounded-[24px]" />

            <div className="relative z-10 w-full h-full flex flex-col justify-between">
              {/* Header: English Title & Faction Pill */}
              <div className="flex items-center justify-between text-xs pb-1.5 border-b border-white/20">
                <span className="font-black tracking-widest text-zinc-100 font-mono-num drop-shadow">
                  {roleData.roleNameEn.toUpperCase()}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black border shadow-sm ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`}
                >
                  {roleData.factionNameTh}
                </span>
              </div>

              {/* Character Artwork Matching User's Reference Card */}
              <div className="my-auto py-1 flex items-center justify-center">
                <div className="w-36 h-44 flex items-center justify-center drop-shadow-xl">
                  <RoleCharacterArt role={role} className="w-full h-full" />
                </div>
              </div>

              {/* Title & Tactical Rules */}
              <div className="text-center space-y-1 bg-black/40 backdrop-blur-xs p-2.5 rounded-2xl border border-white/15">
                <h3 className="text-base font-black tracking-tight text-white drop-shadow">
                  {roleData.roleNameTh}
                </h3>
                <p className="text-[11px] text-zinc-200 leading-tight line-clamp-2">
                  {roleData.description}
                </p>

                {roleData.fellowWerewolves && roleData.fellowWerewolves.length > 0 && (
                  <div className="rounded-lg bg-red-950/90 border border-red-500/80 px-2 py-0.5 text-[10px] text-red-200 font-bold">
                    🐺 พรรคพวกหมาป่า: {roleData.fellowWerewolves.map((w) => w.name).join(', ')}
                  </div>
                )}

                <p className="text-[10px] text-amber-200/90 font-medium leading-tight pt-0.5">
                  💡 {roleData.advice}
                </p>
              </div>

              <div className="text-center pt-1">
                <span className="text-[10px] text-white/80 font-bold bg-black/30 px-2.5 py-0.5 rounded-full border border-white/10">
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
