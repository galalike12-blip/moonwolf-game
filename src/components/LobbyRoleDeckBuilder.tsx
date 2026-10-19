import { Check, Hand, Info, Minus, Plus, Sparkles, Wand2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import React, { useMemo, useState } from 'react';
import { soundEngine } from '../audio/soundEngine';
import { FactionType, RoleType } from './RoleTarotCard';

export type RoleConfigMap = Record<RoleType, number>;

export interface RoleVisualMeta {
  role: RoleType;
  nameTh: string;
  shortNameTh: string;
  nameEn: string;
  faction: FactionType;
  factionLabelTh: string;
  shortDesc: string;
  cardBgClass: string;
  borderClass: string;
  accentTextClass: string;
  badgeBgClass: string;
  glowColor: string;
  scatterRotate: number;
  scatterOffsetY: number;
  scatterOffsetX: number;
}

export const ROLE_VISUAL_CATALOG: RoleVisualMeta[] = [
  {
    role: 'WEREWOLF',
    nameTh: 'มนุษย์หมาป่า',
    shortNameTh: 'หมาป่า',
    nameEn: 'WEREWOLF',
    faction: 'WEREWOLF',
    factionLabelTh: 'ฝ่ายรัตติกาล',
    shortDesc: 'ตื่นช่วงที่ 1 ยามวิกาลเพื่อเลือกสังหารเหยื่อคืนละ 1 คน',
    cardBgClass: 'from-[#260810] via-[#15060b] to-[#0c0306]',
    borderClass: 'border-rose-500/70 shadow-rose-950/70',
    accentTextClass: 'text-rose-300',
    badgeBgClass: 'bg-rose-600 text-white border-rose-400',
    glowColor: 'rgba(244, 63, 94, 0.35)',
    scatterRotate: -4.5,
    scatterOffsetY: 2,
    scatterOffsetX: -2,
  },
  {
    role: 'MINION',
    nameTh: 'ลูกสมุนหมาป่า',
    shortNameTh: 'ลูกสมุน',
    nameEn: 'MINION',
    faction: 'WEREWOLF',
    factionLabelTh: 'ฝ่ายรัตติกาล',
    shortDesc: 'รู้ตัวหมาป่าตั้งแต่เริ่มเกม แม่หมอส่องจะเห็นเป็นชาวบ้าน',
    cardBgClass: 'from-[#220a16] via-[#13070e] to-[#0a0408]',
    borderClass: 'border-rose-400/60 shadow-rose-950/60',
    accentTextClass: 'text-rose-200',
    badgeBgClass: 'bg-rose-700 text-rose-100 border-rose-400',
    glowColor: 'rgba(251, 113, 133, 0.28)',
    scatterRotate: 3.8,
    scatterOffsetY: -3,
    scatterOffsetX: 2,
  },
  {
    role: 'BODYGUARD',
    nameTh: 'บอดี้การ์ด',
    shortNameTh: 'บอดี้การ์ด',
    nameEn: 'BODYGUARD',
    faction: 'VILLAGER',
    factionLabelTh: 'ฝ่ายชาวบ้าน',
    shortDesc: 'ตื่นช่วงที่ 2 กางโล่คุ้มครองผู้เล่นคืนละ 1 คน (ห้ามซ้ำคนเดิมติดกัน)',
    cardBgClass: 'from-[#06291f] via-[#051813] to-[#030d0a]',
    borderClass: 'border-emerald-400/70 shadow-emerald-950/70',
    accentTextClass: 'text-emerald-300',
    badgeBgClass: 'bg-emerald-600 text-white border-emerald-300',
    glowColor: 'rgba(16, 185, 129, 0.32)',
    scatterRotate: -2.8,
    scatterOffsetY: 4,
    scatterOffsetX: 1,
  },
  {
    role: 'SEER',
    nameTh: 'ผู้หยั่งรู้ (แม่หมอ)',
    shortNameTh: 'แม่หมอ',
    nameEn: 'SEER',
    faction: 'VILLAGER',
    factionLabelTh: 'ฝ่ายชาวบ้าน',
    shortDesc: 'ตื่นช่วงที่ 3 ส่องตรวจสอบผู้ต้องสงสัยคืนละ 1 คนว่าเป็นหมาป่าหรือไม่',
    cardBgClass: 'from-[#1d0e38] via-[#110824] to-[#080412]',
    borderClass: 'border-purple-400/70 shadow-purple-950/70',
    accentTextClass: 'text-purple-200',
    badgeBgClass: 'bg-purple-600 text-white border-purple-300',
    glowColor: 'rgba(168, 85, 247, 0.35)',
    scatterRotate: 4.2,
    scatterOffsetY: -1,
    scatterOffsetX: -2,
  },
  {
    role: 'WITCH',
    nameTh: 'แม่มด',
    shortNameTh: 'แม่มด',
    nameEn: 'WITCH',
    faction: 'VILLAGER',
    factionLabelTh: 'ฝ่ายชาวบ้าน',
    shortDesc: 'ตื่นช่วงที่ 4 มียาชุบชีวิต 1 ขวด และยาพิษสังหาร 1 ขวดตลอดเกม',
    cardBgClass: 'from-[#280c33] via-[#17071f] to-[#0b0310]',
    borderClass: 'border-fuchsia-400/70 shadow-fuchsia-950/70',
    accentTextClass: 'text-fuchsia-200',
    badgeBgClass: 'bg-fuchsia-600 text-white border-fuchsia-300',
    glowColor: 'rgba(217, 70, 239, 0.32)',
    scatterRotate: 3.2,
    scatterOffsetY: 3,
    scatterOffsetX: 2,
  },
  {
    role: 'HUNTER',
    nameTh: 'นายพราน',
    shortNameTh: 'นายพราน',
    nameEn: 'HUNTER',
    faction: 'VILLAGER',
    factionLabelTh: 'ฝ่ายชาวบ้าน',
    shortDesc: 'ล็อกเป้าปืนไว้ตลอดเวลา หากตายจะลั่นไกยิงเป้าหมายตายตามทันที 1 คน',
    cardBgClass: 'from-[#072629] via-[#051618] to-[#030b0c]',
    borderClass: 'border-teal-400/70 shadow-teal-950/70',
    accentTextClass: 'text-teal-200',
    badgeBgClass: 'bg-teal-600 text-white border-teal-300',
    glowColor: 'rgba(20, 184, 166, 0.32)',
    scatterRotate: -4.0,
    scatterOffsetY: -2,
    scatterOffsetX: -1,
  },
  {
    role: 'FOOL',
    nameTh: 'คนบ้า (โจ๊กเกอร์)',
    shortNameTh: 'คนบ้า',
    nameEn: 'FOOL',
    faction: 'NEUTRAL',
    factionLabelTh: 'ฝ่ายอิสระ',
    shortDesc: 'ชนะเดี่ยวทันทีหากหลอกให้หมู่บ้านโหวตประหารตัวเองในตอนกลางวันสำเร็จ!',
    cardBgClass: 'from-[#2e1c05] via-[#1c1003] to-[#0d0802]',
    borderClass: 'border-amber-400/75 shadow-amber-950/70',
    accentTextClass: 'text-amber-300',
    badgeBgClass: 'bg-amber-500 text-slate-950 border-amber-300',
    glowColor: 'rgba(245, 158, 11, 0.32)',
    scatterRotate: 4.8,
    scatterOffsetY: 2,
    scatterOffsetX: 1,
  },
  {
    role: 'VILLAGER',
    nameTh: 'ชาวบ้าน',
    shortNameTh: 'ชาวบ้าน',
    nameEn: 'VILLAGER',
    faction: 'VILLAGER',
    factionLabelTh: 'ฝ่ายชาวบ้าน',
    shortDesc: 'ชาวบ้านผู้บริสุทธิ์ ใช้ตรรกะจับพิรุธและโหวตขับไล่หมาป่าในตอนกลางวัน',
    cardBgClass: 'from-[#0b1d33] via-[#071221] to-[#040912]',
    borderClass: 'border-sky-400/65 shadow-sky-950/70',
    accentTextClass: 'text-sky-200',
    badgeBgClass: 'bg-sky-600 text-white border-sky-300',
    glowColor: 'rgba(56, 189, 248, 0.3)',
    scatterRotate: -3.2,
    scatterOffsetY: -2,
    scatterOffsetX: 2,
  },
];

export const ROLE_VISUAL_MAP: Record<RoleType, RoleVisualMeta> =
  ROLE_VISUAL_CATALOG.reduce((acc, item) => {
    acc[item.role] = item;
    return acc;
  }, {} as Record<RoleType, RoleVisualMeta>);

export const RoleArtworkSvg: React.FC<{ role: RoleType; className?: string }> = ({
  role,
  className = 'w-12 h-12',
}) => {
  switch (role) {
    case 'WEREWOLF':
      return (
        <svg viewBox="0 0 120 120" className={className}>
          <circle cx="60" cy="54" r="38" fill="#e11d48" opacity="0.28" />
          <circle cx="60" cy="54" r="26" fill="#f43f5e" opacity="0.8" />
          <path
            d="M32 104 L40 72 L28 56 L42 46 L36 24 L52 38 L60 34 L68 38 L84 24 L78 46 L92 56 L80 72 L88 104 Z"
            fill="#0b0406"
            stroke="#fda4af"
            strokeWidth="2.2"
          />
          <polygon points="46,54 55,58 48,61" fill="#ffe4e6" />
          <polygon points="74,54 65,58 72,61" fill="#ffe4e6" />
        </svg>
      );
    case 'MINION':
      return (
        <svg viewBox="0 0 120 120" className={className}>
          <circle cx="60" cy="58" r="36" fill="#9f1239" opacity="0.3" />
          {/* Hooded Cultist & Twin Daggers */}
          <path
            d="M32 102 C34 74 44 58 60 58 C76 58 86 74 88 102 Z"
            fill="#1f0812"
            stroke="#fb7185"
            strokeWidth="2"
          />
          <path
            d="M60 22 L84 52 L74 72 L46 72 L36 52 Z"
            fill="#14050b"
            stroke="#fda4af"
            strokeWidth="2"
          />
          <circle cx="52" cy="52" r="3" fill="#f43f5e" />
          <circle cx="68" cy="52" r="3" fill="#f43f5e" />
          <line
            x1="34"
            y1="88"
            x2="86"
            y2="36"
            stroke="#fecdd3"
            strokeWidth="2.2"
          />
        </svg>
      );
    case 'BODYGUARD':
      return (
        <svg viewBox="0 0 120 120" className={className}>
          <circle cx="60" cy="60" r="38" fill="#10b981" opacity="0.22" />
          <path
            d="M60 18 L92 31 V60 C92 82 77 98 60 106 C43 98 28 82 28 60 V31 L60 18 Z"
            fill="#062e22"
            stroke="#6ee7b7"
            strokeWidth="2.4"
          />
          <path
            d="M60 36 L65 53 L82 58 L65 63 L60 80 L55 63 L38 58 L55 53 Z"
            fill="#d1fae5"
          />
        </svg>
      );
    case 'SEER':
      return (
        <svg viewBox="0 0 120 120" className={className}>
          <circle cx="60" cy="60" r="38" fill="#a855f7" opacity="0.28" />
          <circle
            cx="60"
            cy="60"
            r="28"
            fill="#1e1035"
            stroke="#d8b4fe"
            strokeWidth="2.2"
          />
          <path
            d="M36 60 Q60 38 84 60 Q60 82 36 60 Z"
            fill="#4c1d95"
            stroke="#f3e8ff"
            strokeWidth="2"
          />
          <circle cx="60" cy="60" r="8" fill="#c084fc" />
          <circle cx="60" cy="60" r="3.5" fill="#ffffff" />
        </svg>
      );
    case 'WITCH':
      return (
        <svg viewBox="0 0 120 120" className={className}>
          <circle cx="60" cy="60" r="38" fill="#d946ef" opacity="0.24" />
          <path
            d="M38 30 H48 V42 L58 72 C60 80 54 90 45 90 H40 C31 90 25 80 27 72 L38 42 Z"
            fill="#064e3b"
            stroke="#34d399"
            strokeWidth="2.2"
          />
          <path
            d="M72 30 H82 V42 L93 72 C95 80 89 90 80 90 H75 C66 90 60 80 62 72 L72 42 Z"
            fill="#4c0519"
            stroke="#fb7185"
            strokeWidth="2.2"
          />
          <circle cx="43" cy="68" r="5" fill="#6ee7b7" />
          <circle cx="77" cy="68" r="5" fill="#f43f5e" />
        </svg>
      );
    case 'HUNTER':
      return (
        <svg viewBox="0 0 120 120" className={className}>
          <circle
            cx="60"
            cy="60"
            r="34"
            fill="#042f2e"
            stroke="#2dd4bf"
            strokeWidth="2.2"
          />
          <circle
            cx="60"
            cy="60"
            r="19"
            fill="none"
            stroke="#99f6e4"
            strokeWidth="1.6"
            strokeDasharray="3 3"
          />
          <line
            x1="60"
            y1="16"
            x2="60"
            y2="104"
            stroke="#ccfbf1"
            strokeWidth="2"
          />
          <line
            x1="16"
            y1="60"
            x2="104"
            y2="60"
            stroke="#ccfbf1"
            strokeWidth="2"
          />
          <circle cx="60" cy="60" r="5.5" fill="#f43f5e" />
        </svg>
      );
    case 'FOOL':
      return (
        <svg viewBox="0 0 120 120" className={className}>
          <circle
            cx="60"
            cy="62"
            r="35"
            fill="#291805"
            stroke="#fbbf24"
            strokeWidth="2.2"
          />
          <path
            d="M30 82 L25 46 L46 62 L60 32 L74 62 L95 46 L90 82 Z"
            fill="#78350f"
            stroke="#fde68a"
            strokeWidth="2.2"
          />
          <circle cx="25" cy="42" r="4.5" fill="#fde68a" />
          <circle cx="60" cy="28" r="4.5" fill="#fde68a" />
          <circle cx="95" cy="42" r="4.5" fill="#fde68a" />
        </svg>
      );
    case 'VILLAGER':
    default:
      return (
        <svg viewBox="0 0 120 120" className={className}>
          <circle cx="60" cy="62" r="36" fill="#38bdf8" opacity="0.22" />
          <path
            d="M48 28 L72 28 L78 40 L42 40 Z"
            fill="#1e293b"
            stroke="#bae6fd"
            strokeWidth="2"
          />
          <rect
            x="44"
            y="40"
            width="32"
            height="42"
            rx="4"
            fill="#0f172a"
            stroke="#7dd3fc"
            strokeWidth="2"
          />
          <path
            d="M60 48 C67 58 67 68 60 74 C53 68 53 58 60 48 Z"
            fill="#fbbf24"
          />
          <path
            d="M38 82 L82 82 L86 92 L34 92 Z"
            fill="#1e293b"
            stroke="#bae6fd"
            strokeWidth="2"
          />
        </svg>
      );
  }
};

interface LobbyRoleDeckBuilderProps {
  isHost: boolean;
  targetPlayerCount: number;
  roleConfig: RoleConfigMap;
  recommendationNoteTh: string;
  onUpdateSettings: (payload: {
    targetPlayerCount?: number;
    preset?: 'BALANCED' | 'CHAOS' | 'SPECIAL';
    customRoleDelta?: { role: RoleType; delta: number };
  }) => void;
  onAutoBalanceVillagers: () => void;
}

export const LobbyRoleDeckBuilder: React.FC<LobbyRoleDeckBuilderProps> = ({
  isHost,
  targetPlayerCount,
  roleConfig,
  recommendationNoteTh,
  onUpdateSettings,
  onAutoBalanceVillagers,
}) => {
  const [inspectedRole, setInspectedRole] = useState<RoleType | null>(null);
  const [lastAddedRole, setLastAddedRole] = useState<RoleType | null>(null);

  // Build ordered list of individual card instances currently in the deck ("Hand")
  const handCards = useMemo(() => {
    const list: { key: string; meta: RoleVisualMeta; copyIndex: number }[] = [];
    for (const meta of ROLE_VISUAL_CATALOG) {
      const count = Math.max(0, roleConfig[meta.role] || 0);
      for (let i = 0; i < count; i++) {
        list.push({
          key: `${meta.role}-${i}`,
          meta,
          copyIndex: i + 1,
        });
      }
    }
    return list;
  }, [roleConfig]);

  const totalConfiguredRoles = handCards.length;

  const handleAddRoleCard = (role: RoleType) => {
    if (!isHost) {
      setInspectedRole((prev) => (prev === role ? null : role));
      return;
    }
    soundEngine.unlockAudioAndSpeech();
    soundEngine.playCardFlip();
    setLastAddedRole(role);
    setInspectedRole(role);
    onUpdateSettings({
      customRoleDelta: { role, delta: 1 },
    });
  };

  const handleRemoveRoleCard = (role: RoleType, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!isHost) return;
    soundEngine.unlockAudioAndSpeech();
    soundEngine.playTick(false);
    onUpdateSettings({
      customRoleDelta: { role, delta: -1 },
    });
  };

  const inspectedMeta = inspectedRole ? ROLE_VISUAL_MAP[inspectedRole] : null;

  return (
    <div className="rounded-2xl bg-[#0c1222]/95 border border-slate-800 p-4 space-y-4 shadow-2xl">
      {/* Section Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-purple-400" />
          <h2 className="text-sm font-semibold text-white">
            {isHost
              ? 'จัดสำรับไพ่บทบาท (แตะไพ่บนโต๊ะเพื่อหยิบเข้ามือ)'
              : 'ไพ่บทบาทที่หัวหน้าห้องกำหนดในเกมนี้'}
          </h2>
        </div>
        <span
          className={`text-[11px] font-mono-num font-bold px-2.5 py-0.5 rounded-md border ${
            totalConfiguredRoles === targetPlayerCount
              ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
              : 'bg-amber-950/80 border-amber-500/40 text-amber-300'
          }`}
        >
          รวม {totalConfiguredRoles} / {targetPlayerCount} โรล
        </span>
      </div>

      {/* Target Player Count Controls */}
      <div className="rounded-xl bg-[#070a12] border border-slate-800 p-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-300">
            จำนวนผู้เล่นในหมู่บ้าน (4–12 คน)
          </span>
          <div className="flex items-center gap-2">
            {isHost && (
              <button
                type="button"
                disabled={targetPlayerCount <= 4}
                onClick={() =>
                  onUpdateSettings({
                    targetPlayerCount: targetPlayerCount - 1,
                  })
                }
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 flex items-center justify-center text-white"
                aria-label="ลดจำนวนผู้เล่น"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
            )}
            <span className="font-mono-num text-sm font-bold text-purple-300 min-w-[54px] text-center">
              {targetPlayerCount} คน
            </span>
            {isHost && (
              <button
                type="button"
                disabled={targetPlayerCount >= 12}
                onClick={() =>
                  onUpdateSettings({
                    targetPlayerCount: targetPlayerCount + 1,
                  })
                }
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 flex items-center justify-center text-white"
                aria-label="เพิ่มจำนวนผู้เล่น"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {isHost && (
          <div className="grid grid-cols-5 gap-1.5">
            {[4, 5, 6, 8, 10].map((cnt) => (
              <button
                key={cnt}
                type="button"
                onClick={() => onUpdateSettings({ targetPlayerCount: cnt })}
                className={`min-h-[34px] rounded-lg text-xs font-mono-num font-medium border transition-colors ${
                  targetPlayerCount === cnt
                    ? 'bg-purple-600 text-white border-purple-400'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {cnt} คน
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Preset Buttons (Host Only) + Smart Recommendation Banner */}
      <div className="space-y-2">
        {isHost && (
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => {
                soundEngine.playCardFlip();
                onUpdateSettings({ preset: 'BALANCED' });
              }}
              className="min-h-[38px] px-2 py-1.5 rounded-xl bg-purple-950/50 hover:bg-purple-900/60 border border-purple-500/40 text-purple-200 text-xs font-medium transition-colors"
            >
              ✨ แนะนำสมดุล
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playCardFlip();
                onUpdateSettings({ preset: 'SPECIAL' });
              }}
              className="min-h-[38px] px-2 py-1.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/40 text-emerald-200 text-xs font-medium transition-colors"
            >
              ⚡ พลังพิเศษล้วน
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playCardFlip();
                onUpdateSettings({ preset: 'CHAOS' });
              }}
              className="min-h-[38px] px-2 py-1.5 rounded-xl bg-amber-950/40 hover:bg-amber-900/50 border border-amber-500/40 text-amber-200 text-xs font-medium transition-colors"
            >
              🃏 ปาร์ตี้คนบ้า
            </button>
          </div>
        )}

        <div className="rounded-xl bg-purple-950/30 border border-purple-500/30 px-3 py-2 text-[11px] text-purple-200 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span>{recommendationNoteTh}</span>
        </div>
      </div>

      {/* ===================================================================
          CASE 1: PARTICIPANT VIEW (!isHost) -> 4-COLUMN GRID OF SELECTED CARDS ONLY
         =================================================================== */}
      {!isHost && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>สำรับไพ่ที่หัวหน้าห้องเลือกไว้ (4 คอลัมน์):</span>
            <span className="text-[11px] text-purple-300">
              แตะที่การ์ดเพื่อดูความสามารถ
            </span>
          </div>

          {handCards.length === 0 ? (
            <div className="rounded-xl bg-[#070a12] border border-dashed border-slate-800 p-6 text-center text-xs text-slate-500">
              หัวหน้าห้องกำลังเลือกหยิบไพ่บทบาทเข้าสู่สำรับ...
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              <AnimatePresence mode="popLayout">
                {handCards.map((card, idx) => {
                  const isInspected = inspectedRole === card.meta.role;
                  return (
                    <motion.button
                      key={card.key}
                      layout
                      initial={{ opacity: 0, scale: 0.7, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.6, y: 15 }}
                      transition={{
                        type: 'spring',
                        stiffness: 340,
                        damping: 24,
                      }}
                      type="button"
                      onClick={() =>
                        setInspectedRole((prev) =>
                          prev === card.meta.role ? null : card.meta.role
                        )
                      }
                      className={`group relative aspect-[3/4.3] rounded-xl bg-gradient-to-b ${
                        card.meta.cardBgClass
                      } border ${
                        card.meta.borderClass
                      } p-1.5 flex flex-col items-center justify-between shadow-lg overflow-hidden transition-transform active:scale-95 ${
                        isInspected ? 'ring-2 ring-white/80 scale-[1.03]' : ''
                      }`}
                    >
                      {/* Top Card Index & Faction Dot */}
                      <div className="w-full flex items-center justify-between px-0.5 text-[9px] font-mono-num text-slate-300/80">
                        <span>#{idx + 1}</span>
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            card.meta.faction === 'WEREWOLF'
                              ? 'bg-rose-400'
                              : card.meta.faction === 'NEUTRAL'
                              ? 'bg-amber-400'
                              : 'bg-emerald-400'
                          }`}
                        />
                      </div>

                      {/* Role Tarot Artwork */}
                      <div className="my-auto flex items-center justify-center">
                        <RoleArtworkSvg
                          role={card.meta.role}
                          className="w-10 h-10 sm:w-11 sm:h-11 drop-shadow"
                        />
                      </div>

                      {/* Bottom Role Name */}
                      <div className="w-full text-center bg-black/50 backdrop-blur-[2px] rounded-md py-0.5 px-1 border border-white/10">
                        <p
                          className={`text-[10px] font-bold truncate ${card.meta.accentTextClass}`}
                        >
                          {card.meta.shortNameTh}
                        </p>
                      </div>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================
          CASE 2: HOST VIEW (isHost) -> CENTER FANNED HAND + SCATTERED TABLETOP
         =================================================================== */}
      {isHost && (
        <div className="space-y-4">
          {/* 1. CENTER SCREEN: THE FANNED HAND ("ไพ่โรลที่ถืออยู่ในมือกลางจอ") */}
          <div className="relative rounded-2xl bg-gradient-to-b from-[#130f29] via-[#0b0f1f] to-[#070a14] border border-purple-500/40 pt-3 pb-5 px-3 overflow-hidden shadow-2xl">
            {/* Ambient Spotlight behind the Hand */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="w-56 h-56 rounded-full bg-purple-500/15 blur-2xl" />
            </div>

            <div className="relative z-10 flex items-center justify-between text-xs mb-2">
              <div className="flex items-center gap-1.5 text-purple-200 font-semibold">
                <Hand className="w-4 h-4 text-purple-400" />
                <span>ไพ่โรลในมือของคุณ ({totalConfiguredRoles}/{targetPlayerCount} ใบ)</span>
              </div>
              <span className="text-[10px] text-slate-400">
                แตะไพ่ในมือเพื่อวางคืนโต๊ะ
              </span>
            </div>

            {/* Fanned Cards in Hand Container */}
            <div className="relative z-10 min-h-[168px] flex items-center justify-center py-2">
              {handCards.length === 0 ? (
                <div className="text-center space-y-1.5 py-6">
                  <p className="text-xs font-medium text-slate-400">
                    ในมือยังว่างเปล่า
                  </p>
                  <p className="text-[11px] text-slate-500">
                    แตะเลือกการ์ดโรลที่วางอยู่บนโต๊ะด้านล่าง เพื่อให้การ์ดลอยเข้ามาในมือ
                  </p>
                </div>
              ) : (
                <div className="relative flex items-center justify-center w-full overflow-x-visible py-2">
                  <div className="flex items-end justify-center">
                    <AnimatePresence mode="popLayout">
                      {handCards.map((card, idx) => {
                        const total = handCards.length;
                        const mid = (total - 1) / 2;
                        const offsetFromCenter = idx - mid;
                        // Calculate fan rotation angle & parabolic arc height so it looks like cards held in a real hand
                        const maxSpreadAngle = total > 8 ? 3.8 : total > 5 ? 5.2 : 7;
                        const rotateDeg = offsetFromCenter * maxSpreadAngle;
                        const arcTranslateY =
                          Math.abs(offsetFromCenter) *
                          Math.abs(offsetFromCenter) *
                          (total > 8 ? 1.4 : 2.2);
                        const negativeMargin =
                          total >= 10
                            ? '-ml-7'
                            : total >= 7
                            ? '-ml-5'
                            : total >= 5
                            ? '-ml-3.5'
                            : '-ml-2';

                        return (
                          <motion.button
                            key={card.key}
                            layout
                            initial={{
                              opacity: 0,
                              y: 130,
                              scale: 0.45,
                              rotate: card.meta.scatterRotate * 2,
                            }}
                            animate={{
                              opacity: 1,
                              y: arcTranslateY,
                              scale:
                                lastAddedRole === card.meta.role &&
                                idx ===
                                  handCards
                                    .map((c) => c.meta.role)
                                    .lastIndexOf(card.meta.role)
                                  ? 1.04
                                  : 1,
                              rotate: rotateDeg,
                            }}
                            exit={{
                              opacity: 0,
                              y: 110,
                              scale: 0.4,
                              rotate: 15,
                            }}
                            whileHover={{
                              y: -14,
                              scale: 1.12,
                              zIndex: 40,
                            }}
                            transition={{
                              type: 'spring',
                              stiffness: 320,
                              damping: 22,
                            }}
                            type="button"
                            onClick={() => handleRemoveRoleCard(card.meta.role)}
                            style={{ zIndex: idx + 1 }}
                            className={`relative ${
                              idx === 0 ? '' : negativeMargin
                            } w-[68px] h-[102px] sm:w-[74px] sm:h-[110px] rounded-xl bg-gradient-to-b ${
                              card.meta.cardBgClass
                            } border-2 ${
                              card.meta.borderClass
                            } p-1.5 flex flex-col items-center justify-between shadow-xl cursor-pointer select-none origin-bottom`}
                            title={`แตะเพื่อนำ "${card.meta.nameTh}" ออกจากมือ`}
                          >
                            {/* Top Mini Header */}
                            <div className="w-full flex items-center justify-between px-0.5">
                              <span className="text-[8px] font-mono-num text-slate-300/90">
                                #{idx + 1}
                              </span>
                              <span className="w-3.5 h-3.5 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-[9px] text-rose-300">
                                −
                              </span>
                            </div>

                            {/* Center Role Artwork */}
                            <RoleArtworkSvg
                              role={card.meta.role}
                              className="w-9 h-9 sm:w-10 sm:h-10 drop-shadow"
                            />

                            {/* Bottom Label */}
                            <div className="w-full rounded bg-black/65 px-1 py-0.5 border border-white/10 text-center">
                              <p
                                className={`text-[9px] font-bold truncate ${card.meta.accentTextClass}`}
                              >
                                {card.meta.shortNameTh}
                              </p>
                            </div>
                          </motion.button>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </div>

            {/* Stylized Dealer Hands / Velvet Wrist Rest Under the Fanned Cards */}
            <div className="relative z-20 -mt-2 flex flex-col items-center pointer-events-none">
              <svg
                viewBox="0 0 320 42"
                className="w-64 h-8 text-purple-300/40 drop-shadow"
              >
                {/* Left & Right Stylized Arcane Hands cradling the deck */}
                <path
                  d="M52 38 C68 18, 96 12, 134 16 C122 24, 108 32, 92 38 Z"
                  fill="#1e1b4b"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M268 38 C252 18, 224 12, 186 16 C198 24, 212 32, 228 38 Z"
                  fill="#1e1b4b"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M90 36 Q160 20 230 36"
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="1.5"
                  strokeOpacity="0.45"
                />
              </svg>
            </div>
          </div>

          {/* 2. SCATTERED TABLETOP ("การ์ดทุกใบบนโต๊ะที่วางกระจัดกระจาย") */}
          <div className="rounded-2xl bg-[#070b14] border border-slate-800/90 p-3.5 space-y-3 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200">
                โต๊ะวางไพ่โรลทั้งหมด (แตะการ์ดเพื่อให้ลอยเข้ามือ)
              </span>
              <span className="text-[11px] text-purple-300">
                แสดงครบทั้ง 8 โรลเสมอ
              </span>
            </div>

            {/* 4-Column Scattered Tabletop Surface */}
            <div className="grid grid-cols-4 gap-x-2.5 gap-y-4 py-2 px-1">
              {ROLE_VISUAL_CATALOG.map((meta) => {
                const countInHand = roleConfig[meta.role] || 0;
                const isSelected = countInHand > 0;

                return (
                  <motion.div
                    key={meta.role}
                    initial={false}
                    animate={{
                      rotate: meta.scatterRotate,
                      y: meta.scatterOffsetY,
                      x: meta.scatterOffsetX,
                    }}
                    whileHover={{
                      rotate: 0,
                      y: -6,
                      scale: 1.05,
                      zIndex: 20,
                    }}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => handleAddRoleCard(meta.role)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleAddRoleCard(meta.role);
                      }
                    }}
                    className={`relative aspect-[3/4.4] rounded-xl bg-gradient-to-b ${
                      meta.cardBgClass
                    } border ${
                      isSelected
                        ? `${meta.borderClass} ring-1 ring-white/30`
                        : 'border-slate-700/80 opacity-85 hover:opacity-100'
                    } p-1.5 flex flex-col items-center justify-between shadow-lg cursor-pointer select-none transition-shadow`}
                    style={{
                      boxShadow: isSelected
                        ? `0 8px 20px -4px ${meta.glowColor}`
                        : undefined,
                    }}
                  >
                    {/* Top Bar: Info + Count Badge */}
                    <div className="w-full flex items-center justify-between gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setInspectedRole((prev) =>
                            prev === meta.role ? null : meta.role
                          );
                        }}
                        className="w-5 h-5 rounded-md bg-black/50 hover:bg-black/80 border border-white/15 flex items-center justify-center text-slate-300"
                        aria-label={`ดูข้อมูล ${meta.nameTh}`}
                      >
                        <Info className="w-3 h-3" />
                      </button>

                      {countInHand > 0 ? (
                        <span
                          className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono-num font-bold border shadow ${meta.badgeBgClass}`}
                        >
                          ×{countInHand}
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded-md text-[9px] font-mono-num bg-black/50 text-slate-400 border border-white/10">
                          +หยิบ
                        </span>
                      )}
                    </div>

                    {/* Center Artwork */}
                    <div className="my-auto flex items-center justify-center">
                      <RoleArtworkSvg
                        role={meta.role}
                        className="w-10 h-10 sm:w-11 sm:h-11 drop-shadow"
                      />
                    </div>

                    {/* Bottom Name + Quick Minus Button if > 0 */}
                    <div className="w-full space-y-1">
                      <div className="w-full rounded bg-black/65 px-1 py-0.5 border border-white/10 text-center">
                        <p
                          className={`text-[10px] font-bold truncate ${meta.accentTextClass}`}
                        >
                          {meta.shortNameTh}
                        </p>
                      </div>

                      {countInHand > 0 && (
                        <button
                          type="button"
                          onClick={(e) => handleRemoveRoleCard(meta.role, e)}
                          className="w-full py-0.5 rounded bg-rose-950/90 hover:bg-rose-800 border border-rose-500/40 text-[9px] font-medium text-rose-200 flex items-center justify-center gap-0.5"
                        >
                          <Minus className="w-2.5 h-2.5" />
                          <span>ลด 1 ใบ</span>
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Role Ability Inspector Banner (When any card is tapped/inspected) */}
      {inspectedMeta && (
        <div className="rounded-xl bg-[#090d1a] border border-slate-700/90 p-3 flex items-start justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <RoleArtworkSvg
              role={inspectedMeta.role}
              className="w-9 h-9 shrink-0"
            />
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className={`font-bold ${inspectedMeta.accentTextClass}`}>
                  {inspectedMeta.nameTh}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                  {inspectedMeta.factionLabelTh}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {inspectedMeta.shortDesc}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setInspectedRole(null)}
            className="text-[11px] text-slate-400 hover:text-white shrink-0"
          >
            ปิด
          </button>
        </div>
      )}

      {/* Mismatch Warning & One-Tap Auto-Balance Button */}
      {totalConfiguredRoles !== targetPlayerCount && (
        <div className="rounded-xl bg-amber-950/40 border border-amber-500/40 p-3 flex items-center justify-between gap-2 text-xs text-amber-200">
          <span>
            ไพ่ในมือ ({totalConfiguredRoles} ใบ) ยังไม่เท่ากับจำนวนผู้เล่น (
            {targetPlayerCount} คน)
          </span>
          {isHost && (
            <button
              type="button"
              onClick={onAutoBalanceVillagers}
              className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-100 font-semibold shrink-0 flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>ปรับชาวบ้านให้พอดี</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
