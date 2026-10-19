import { Check, Hand, Info, Minus, Plus, Sparkles, Wand2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import React, { useMemo, useState } from 'react';
import { soundEngine } from '../audio/soundEngine';
import { ROLE_CARD_THEMES, RoleCharacterArt } from './RoleIllustration';
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
    factionLabelTh: 'ฝ่ายหมาป่า',
    shortDesc: 'ตื่นช่วงที่ 1 ยามวิกาลเพื่อเลือกสังหารเหยื่อคืนละ 1 คน',
    cardBgClass: 'from-[#2b1419] to-[#180d10]',
    borderClass: 'border-rose-600/90',
    accentTextClass: 'text-rose-400',
    badgeBgClass: 'bg-rose-600 text-white border-rose-400',
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
    factionLabelTh: 'ฝ่ายหมาป่า',
    shortDesc: 'รู้ตัวหมาป่าตั้งแต่เริ่มเกม แม่หมอส่องจะเห็นเป็นชาวบ้าน',
    cardBgClass: 'from-[#291620] to-[#160d13]',
    borderClass: 'border-rose-500/80',
    accentTextClass: 'text-rose-300',
    badgeBgClass: 'bg-rose-700 text-rose-100 border-rose-400',
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
    cardBgClass: 'from-[#13281e] to-[#0c1813]',
    borderClass: 'border-emerald-500/90',
    accentTextClass: 'text-emerald-300',
    badgeBgClass: 'bg-emerald-600 text-white border-emerald-400',
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
    cardBgClass: 'from-[#261f12] to-[#14100a]',
    borderClass: 'border-amber-500/90',
    accentTextClass: 'text-amber-400',
    badgeBgClass: 'bg-amber-600 text-zinc-950 font-bold border-amber-300',
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
    cardBgClass: 'from-[#12241e] to-[#0a1613]',
    borderClass: 'border-emerald-500/90',
    accentTextClass: 'text-emerald-300',
    badgeBgClass: 'bg-emerald-600 text-white border-emerald-300',
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
    cardBgClass: 'from-[#12282b] to-[#0a1719]',
    borderClass: 'border-teal-400/90',
    accentTextClass: 'text-teal-300',
    badgeBgClass: 'bg-teal-600 text-white border-teal-300',
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
    cardBgClass: 'from-[#2b2111] to-[#171108]',
    borderClass: 'border-amber-400/90',
    accentTextClass: 'text-amber-300',
    badgeBgClass: 'bg-amber-500 text-zinc-950 font-bold border-amber-300',
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
    cardBgClass: 'from-[#14202d] to-[#0c141d]',
    borderClass: 'border-sky-400/90',
    accentTextClass: 'text-sky-300',
    badgeBgClass: 'bg-sky-600 text-white border-sky-300',
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
  className = 'w-10 h-10',
}) => {
  return <RoleCharacterArt role={role} className={className} />;
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
    <div className="rounded-2xl bg-[#14161c] border-2 border-zinc-800 p-4 space-y-4 cartoon-card-shadow">
      {/* Section Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-amber-400">
            <Wand2 className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold text-zinc-100">
            {isHost
              ? 'จัดสำรับการ์ด (แตะการ์ดบนโต๊ะเพื่อหยิบเข้ามือ)'
              : 'การ์ดบทบาทที่ใช้ในเกมนี้'}
          </h2>
        </div>
        <span
          className={`text-xs font-mono-num font-black px-2.5 py-1 rounded-lg border-2 ${
            totalConfiguredRoles === targetPlayerCount
              ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
              : 'bg-amber-950 text-amber-300 border-amber-600'
          }`}
        >
          {totalConfiguredRoles} / {targetPlayerCount} ใบ
        </span>
      </div>

      {/* Target Player Count Controls */}
      <div className="rounded-xl bg-[#101216] border-2 border-zinc-800 p-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-300">
            จำนวนผู้เล่นในห้อง (4–12 คน)
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
                className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 disabled:opacity-40 flex items-center justify-center text-white cartoon-btn-shadow"
                aria-label="ลดจำนวนผู้เล่น"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
            )}
            <span className="font-mono-num text-sm font-black text-amber-400 min-w-[50px] text-center">
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
                className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 disabled:opacity-40 flex items-center justify-center text-white cartoon-btn-shadow"
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
                className={`min-h-[34px] rounded-lg text-xs font-mono-num font-bold border-2 transition-colors cartoon-btn-shadow ${
                  targetPlayerCount === cnt
                    ? 'bg-amber-500 text-zinc-950 border-amber-300'
                    : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-750'
                }`}
              >
                {cnt} คน
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Preset Recommendation Buttons & Notes */}
      <div className="space-y-2">
        {isHost && (
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => {
                soundEngine.playCardFlip();
                onUpdateSettings({ preset: 'BALANCED' });
              }}
              className="min-h-[38px] px-2 py-1 rounded-xl bg-zinc-800 hover:bg-zinc-750 border-2 border-zinc-700 text-zinc-200 text-xs font-bold transition-colors cartoon-btn-shadow"
            >
              ✨ สมดุลมาตรฐาน
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playCardFlip();
                onUpdateSettings({ preset: 'SPECIAL' });
              }}
              className="min-h-[38px] px-2 py-1 rounded-xl bg-zinc-800 hover:bg-zinc-750 border-2 border-zinc-700 text-zinc-200 text-xs font-bold transition-colors cartoon-btn-shadow"
            >
              ⚡ พลังพิเศษ
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playCardFlip();
                onUpdateSettings({ preset: 'CHAOS' });
              }}
              className="min-h-[38px] px-2 py-1 rounded-xl bg-zinc-800 hover:bg-zinc-750 border-2 border-zinc-700 text-zinc-200 text-xs font-bold transition-colors cartoon-btn-shadow"
            >
              🃏 ปาร์ตี้คนบ้า
            </button>
          </div>
        )}

        <div className="rounded-xl bg-[#101216] border border-zinc-800 px-3 py-2 text-[11px] text-zinc-300 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>{recommendationNoteTh}</span>
        </div>
      </div>

      {/* ===================================================================
          PARTICIPANT VIEW (!isHost) -> 4-COLUMN CARTOON CARDS OF SELECTED ROLES
         =================================================================== */}
      {!isHost && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-bold">
            <span>การ์ดที่หัวหน้าห้องกำหนด ({handCards.length} ใบ):</span>
            <span className="text-[11px] text-amber-400 font-normal">
              แตะการ์ดเพื่อดูพลัง
            </span>
          </div>

          {handCards.length === 0 ? (
            <div className="rounded-xl bg-[#101216] border-2 border-dashed border-zinc-800 p-6 text-center text-xs text-zinc-500">
              กำลังรอหัวหน้าห้องจัดสำรับการ์ด...
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              <AnimatePresence mode="popLayout">
                {handCards.map((card, idx) => {
                  const isInspected = inspectedRole === card.meta.role;
                  const theme = ROLE_CARD_THEMES[card.meta.role] || ROLE_CARD_THEMES.VILLAGER;
                  return (
                    <motion.button
                      key={card.key}
                      layout
                      initial={{ opacity: 0, scale: 0.7, y: 15 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.6, y: 10 }}
                      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                      type="button"
                      onClick={() =>
                        setInspectedRole((prev) =>
                          prev === card.meta.role ? null : card.meta.role
                        )
                      }
                      style={{
                        backgroundColor: theme.cardBg,
                        borderColor: theme.borderColor,
                      }}
                      className={`group relative aspect-[3/4.4] rounded-[18px] border-[3px] p-1.5 flex flex-col items-center justify-between shadow-lg active:scale-95 transition-transform overflow-hidden ${
                        isInspected ? 'ring-3 ring-amber-400 scale-105' : ''
                      }`}
                    >
                      {/* Card Vignette Overlay */}
                      <div className="absolute inset-0 bg-radial from-transparent to-black/40 pointer-events-none rounded-[15px]" />

                      {/* Top Header */}
                      <div className="relative z-10 w-full flex items-center justify-between px-0.5 text-[9px] font-mono-num font-black text-white drop-shadow">
                        <span>#{idx + 1}</span>
                        <span
                          className={`px-1 rounded text-[8px] border ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`}
                        >
                          {theme.shortNameTh}
                        </span>
                      </div>

                      {/* Center Cartoon Artwork */}
                      <div className="relative z-10 my-auto w-full h-[62px] flex items-center justify-center p-0.5">
                        <RoleCharacterArt role={card.meta.role} className="w-full h-full drop-shadow" />
                      </div>

                      {/* Bottom Role Label */}
                      <div className="relative z-10 w-full text-center bg-black/60 rounded-full py-0.5 px-1 border border-white/20">
                        <p className="text-[10px] font-black text-white truncate drop-shadow">
                          {card.meta.nameTh}
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
          HOST VIEW (isHost) -> CENTER FANNED HAND + SCATTERED TABLETOP
         =================================================================== */}
      {isHost && (
        <div className="space-y-4">
          {/* 1. CENTER SCREEN: FANNED HAND OF CARDS */}
          <div className="relative rounded-2xl bg-gradient-to-b from-[#181b22] to-[#101217] border-2 border-zinc-700/80 pt-3.5 pb-4 px-3 overflow-hidden cartoon-card-shadow">
            <div className="relative z-10 flex items-center justify-between text-xs mb-2">
              <div className="flex items-center gap-1.5 text-zinc-200 font-bold">
                <Hand className="w-4 h-4 text-amber-400" />
                <span>การ์ดในมือของคุณ ({totalConfiguredRoles}/{targetPlayerCount} ใบ)</span>
              </div>
              <span className="text-[10px] text-zinc-400">
                แตะการ์ดในมือเพื่อนำออก
              </span>
            </div>

            {/* Hand Area with Parabolic Arc Fanning */}
            <div className="relative z-10 min-h-[160px] flex items-center justify-center py-2">
              {handCards.length === 0 ? (
                <div className="text-center space-y-1 py-6">
                  <p className="text-xs font-bold text-zinc-400">
                    ในมือยังว่างเปล่า
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    แตะการ์ดบนโต๊ะด้านล่าง เพื่อหยิบการ์ดขึ้นมาถือไว้ในมือ
                  </p>
                </div>
              ) : (
                <div className="relative flex items-center justify-center w-full py-2">
                  <div className="flex items-end justify-center">
                    <AnimatePresence mode="popLayout">
                      {handCards.map((card, idx) => {
                        const total = handCards.length;
                        const mid = (total - 1) / 2;
                        const offsetFromCenter = idx - mid;
                        const maxSpreadAngle = total > 8 ? 4 : total > 5 ? 5.5 : 7.5;
                        const rotateDeg = offsetFromCenter * maxSpreadAngle;
                        const arcTranslateY =
                          Math.abs(offsetFromCenter) * Math.abs(offsetFromCenter) * (total > 8 ? 1.4 : 2.2);
                        const negativeMargin =
                          total >= 10 ? '-ml-7' : total >= 7 ? '-ml-5' : total >= 5 ? '-ml-3.5' : '-ml-2';

                        const theme = ROLE_CARD_THEMES[card.meta.role] || ROLE_CARD_THEMES.VILLAGER;
                        return (
                          <motion.button
                            key={card.key}
                            layout
                            initial={{ opacity: 0, y: 120, scale: 0.5, rotate: card.meta.scatterRotate * 2 }}
                            animate={{ opacity: 1, y: arcTranslateY, scale: 1, rotate: rotateDeg }}
                            exit={{ opacity: 0, y: 90, scale: 0.4, rotate: 12 }}
                            whileHover={{ y: -14, scale: 1.14, zIndex: 50 }}
                            transition={{ type: 'spring', stiffness: 340, damping: 22 }}
                            type="button"
                            onClick={() => handleRemoveRoleCard(card.meta.role)}
                            style={{
                              zIndex: idx + 1,
                              backgroundColor: theme.cardBg,
                              borderColor: theme.borderColor,
                            }}
                            className={`relative ${
                              idx === 0 ? '' : negativeMargin
                            } w-[72px] h-[110px] sm:w-[78px] sm:h-[118px] rounded-[18px] border-[3px] p-1.5 flex flex-col items-center justify-between shadow-xl cursor-pointer select-none origin-bottom overflow-hidden`}
                            title={`แตะเพื่อนำ "${card.meta.nameTh}" ออกจากมือ`}
                          >
                            {/* Card Vignette Overlay */}
                            <div className="absolute inset-0 bg-radial from-transparent to-black/40 pointer-events-none rounded-[15px]" />

                            <div className="relative z-10 w-full flex items-center justify-between px-0.5">
                              <span className="text-[8px] font-mono-num font-black text-white drop-shadow">
                                #{idx + 1}
                              </span>
                              <span className="w-4 h-4 rounded-full bg-black/80 border border-white/30 flex items-center justify-center text-[10px] text-white font-black">
                                −
                              </span>
                            </div>

                            <div className="relative z-10 w-full h-[58px] flex items-center justify-center p-0.5">
                              <RoleCharacterArt role={card.meta.role} className="w-full h-full drop-shadow" />
                            </div>

                            <div className="relative z-10 w-full rounded-full bg-black/70 px-1 py-0.5 border border-white/20 text-center">
                              <p className="text-[9px] font-black text-white truncate drop-shadow">
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

            {/* Stylized Hands holding the deck */}
            <div className="relative z-20 -mt-2 flex flex-col items-center pointer-events-none">
              <svg viewBox="0 0 320 38" className="w-64 h-7 text-zinc-700/80 drop-shadow">
                <path d="M52 34 C72 16, 102 12, 134 16 C122 22, 106 28, 92 34 Z" fill="#20232b" stroke="currentColor" strokeWidth="2" />
                <path d="M268 34 C248 16, 218 12, 186 16 C198 22, 214 28, 228 34 Z" fill="#20232b" stroke="currentColor" strokeWidth="2" />
                <path d="M96 32 Q160 18 224 32" fill="none" stroke="#d97706" strokeWidth="2" strokeOpacity="0.5" />
              </svg>
            </div>
          </div>

          {/* 2. SCATTERED TABLETOP ("การ์ดทุกใบเสมออยู่บนโต๊ะที่วางกระจัดกระจาย") */}
          <div className="rounded-2xl bg-[#111317] border-2 border-zinc-800 p-3.5 space-y-3 cartoon-card-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-200">
                โต๊ะวางการ์ดบทบาททั้งหมด (แตะเพื่อหยิบขึ้นมือ)
              </span>
              <span className="text-[11px] text-zinc-400">
                ครบทั้ง 8 โรล
              </span>
            </div>

            {/* 4-Column Scattered Layout */}
            <div className="grid grid-cols-4 gap-x-2 gap-y-3.5 py-1 px-1">
              {ROLE_VISUAL_CATALOG.map((meta) => {
                const countInHand = roleConfig[meta.role] || 0;
                const isSelected = countInHand > 0;
                const theme = ROLE_CARD_THEMES[meta.role] || ROLE_CARD_THEMES.VILLAGER;

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
                      y: -8,
                      scale: 1.08,
                      zIndex: 30,
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
                    style={{
                      backgroundColor: theme.cardBg,
                      borderColor: isSelected ? theme.borderColor : `${theme.borderColor}80`,
                    }}
                      className={`relative aspect-[3/4.4] rounded-[18px] border-[3px] p-1.5 flex flex-col items-center justify-between shadow-xl cursor-pointer select-none overflow-hidden ${
                        isSelected ? 'ring-3 ring-amber-400' : 'opacity-85 hover:opacity-100'
                      }`}
                    >
                      {/* Card Vignette Overlay */}
                      <div className="absolute inset-0 bg-radial from-transparent to-black/40 pointer-events-none rounded-[15px]" />

                      {/* Top Bar: Info + Count */}
                      <div className="relative z-10 w-full flex items-center justify-between gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setInspectedRole((prev) => (prev === meta.role ? null : meta.role));
                          }}
                          className="w-5 h-5 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 flex items-center justify-center text-zinc-300"
                          aria-label={`ดูข้อมูล ${meta.nameTh}`}
                        >
                          <Info className="w-3 h-3" />
                        </button>

                        {countInHand > 0 ? (
                          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono-num font-black border ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`}>
                            ×{countInHand}
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-mono-num bg-black/60 text-zinc-300 border border-white/20 font-bold">
                            +หยิบ
                          </span>
                        )}
                      </div>

                      {/* Artwork */}
                      <div className="relative z-10 my-auto w-full h-[64px] flex items-center justify-center p-0.5">
                        <RoleCharacterArt role={meta.role} className="w-full h-full drop-shadow" />
                      </div>

                      {/* Bottom Label + Minus button */}
                      <div className="relative z-10 w-full space-y-1">
                        <div className="w-full rounded-full bg-black/70 px-1 py-0.5 border border-white/20 text-center">
                          <p className="text-[10px] font-black text-white truncate drop-shadow">
                            {meta.shortNameTh}
                          </p>
                        </div>

                        {countInHand > 0 && (
                          <button
                            type="button"
                            onClick={(e) => handleRemoveRoleCard(meta.role, e)}
                            className="w-full py-0.5 rounded-full bg-zinc-900/90 hover:bg-rose-950 border border-zinc-700 hover:border-rose-500/50 text-[9px] font-bold text-zinc-200 hover:text-rose-200 flex items-center justify-center gap-0.5"
                          >
                            <Minus className="w-2.5 h-2.5" />
                            <span>ลด 1</span>
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

      {/* Role Inspector Modal Bar */}
      {inspectedMeta && (
        <div className="rounded-xl bg-[#101216] border-2 border-zinc-700 p-3 flex items-start justify-between gap-3 text-xs cartoon-card-shadow">
          <div className="flex items-start gap-2.5">
            <RoleArtworkSvg role={inspectedMeta.role} className="w-9 h-9 shrink-0" />
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className={`font-black ${inspectedMeta.accentTextClass}`}>
                  {inspectedMeta.nameTh}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-bold">
                  {inspectedMeta.factionLabelTh}
                </span>
              </div>
              <p className="text-[11px] text-zinc-300 leading-snug">
                {inspectedMeta.shortDesc}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setInspectedRole(null)}
            className="text-[11px] text-zinc-400 hover:text-white font-bold shrink-0"
          >
            ปิด
          </button>
        </div>
      )}

      {/* Role Count Mismatch Helper */}
      {totalConfiguredRoles !== targetPlayerCount && (
        <div className="rounded-xl bg-amber-950 border-2 border-amber-600 p-3 flex items-center justify-between gap-2 text-xs text-amber-200">
          <span>
            การ์ดในมือ ({totalConfiguredRoles} ใบ) ยังไม่เท่ากับจำนวนผู้เล่น ({targetPlayerCount} คน)
          </span>
          {isHost && (
            <button
              type="button"
              onClick={onAutoBalanceVillagers}
              className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black shrink-0 flex items-center gap-1 cartoon-btn-shadow"
            >
              <Check className="w-3.5 h-3.5" />
              <span>ปรับชาวบ้าน</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
