import 'dotenv/config';
import crypto from 'crypto';
import express from 'express';
import fs from 'fs';
import { createServer } from 'http';
import path from 'path';
import { Server, Socket } from 'socket.io';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// GOOGLE GEMINI TTS CLIENT & IN-MEMORY AUDIO CACHE
// ============================================================================

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const ttsAudioCache = new Map<string, string>();
const MAX_TTS_CACHE_ENTRIES = 200;

export const GEMINI_AVAILABLE_VOICES = [
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
] as const;

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

export type GamePhase =
  | 'LOBBY'
  | 'ROLE_REVEAL'
  | 'NIGHT_WEREWOLF'
  | 'NIGHT_BODYGUARD'
  | 'NIGHT_SEER'
  | 'NIGHT_WITCH'
  | 'DAY_DISCUSSION'
  | 'VOTING'
  | 'REVOTE'
  | 'VOTE_RESULT'
  | 'GAME_OVER';

export interface RoleMetadata {
  role: RoleType;
  roleNameTh: string;
  roleNameEn: string;
  faction: FactionType;
  factionNameTh: string;
  shortDescTh: string;
  description: string;
  advice: string;
}

export const ALL_ROLES_ORDER: RoleType[] = [
  'WEREWOLF',
  'MINION',
  'SEER',
  'BODYGUARD',
  'WITCH',
  'HUNTER',
  'FOOL',
  'VILLAGER',
];

export const ROLE_METADATA: Record<RoleType, RoleMetadata> = {
  WEREWOLF: {
    role: 'WEREWOLF',
    roleNameTh: 'มนุษย์หมาป่า',
    roleNameEn: 'Werewolf',
    faction: 'WEREWOLF',
    factionNameTh: 'ฝ่ายรัตติกาล',
    shortDescTh: 'ตื่นยามวิกาลเพื่อเลือกสังหารเหยื่อคืนละ 1 คน',
    description:
      'ในยามวิกาลช่วงแรก คุณจะลืมตาตื่นขึ้นเพื่อเลือกสังหารเหยื่อ 1 คน ยามรุ่งอรุณจงแสร้งทำตัวเป็นชาวบ้านผู้บริสุทธิ์',
    advice:
      'กลยุทธ์: ระวังบอดี้การ์ดและแม่มด พยายามเลือกเหยื่อที่คาดไม่ถึงและโยนความสงสัยให้ผู้อื่นในตอนเช้า',
  },
  MINION: {
    role: 'MINION',
    roleNameTh: 'ลูกสมุนหมาป่า',
    roleNameEn: 'Minion',
    faction: 'WEREWOLF',
    factionNameTh: 'ฝ่ายรัตติกาล',
    shortDescTh: 'รู้ตัวจริงของหมาป่าตั้งแต่เริ่มเกม ช่วยปั่นหัวชาวบ้าน (แม่หมอส่องจะเห็นเป็นชาวบ้าน)',
    description:
      'คุณอยู่ฝ่ายรัตติกาลและรู้ว่าใครคือมนุษย์หมาป่าตั้งแต่เริ่มเกม แม้แม่หมอตรวจสอบคุณก็จะเห็นเป็นฝ่ายชาวบ้าน',
    advice:
      'กลยุทธ์: ออกตัวปกป้องหมาป่าอย่างแนบเนียน หรือแกล้งสวมรอยเป็นแม่หมอตัวปลอมเพื่อปั่นป่วนการโหวต',
  },
  SEER: {
    role: 'SEER',
    roleNameTh: 'ผู้หยั่งรู้ (แม่หมอ)',
    roleNameEn: 'Seer',
    faction: 'VILLAGER',
    factionNameTh: 'ฝ่ายชาวบ้าน',
    shortDescTh: 'ตื่นยามวิกาลเพื่อตรวจสอบว่าผู้ต้องสงสัยเป็นมนุษย์หมาป่าหรือไม่',
    description:
      'ในแต่ละคืน คุณสามารถใช้เนตรหยั่งรู้ตรวจสอบผู้เล่น 1 คน ว่าเขาเป็น "มนุษย์หมาป่า" หรือไม่',
    advice:
      'กลยุทธ์: ระวังอย่าเปิดเผยตัวตนเร็วเกินไปในวันแรก เพราะหมาป่าจะเล็งสังหารคุณทันที',
  },
  BODYGUARD: {
    role: 'BODYGUARD',
    roleNameTh: 'บอดี้การ์ด',
    roleNameEn: 'Bodyguard',
    faction: 'VILLAGER',
    factionNameTh: 'ฝ่ายชาวบ้าน',
    shortDescTh: 'เลือกกางโล่คุ้มครองผู้เล่นคืนละ 1 คน (ห้ามซ้ำคนเดิม 2 คืนติด)',
    description:
      'ในแต่ละคืน คุณสามารถเลือกผู้เล่น 1 คน (รวมถึงตัวเอง) เพื่อกางโล่คุ้มครองจากการถูกหมาป่าสังหาร (ห้ามปกป้องคนเดิมซ้ำ 2 คืนติดกัน)',
    advice:
      'กลยุทธ์: อ่านเกมว่าหมาป่าจะเล็งสังหารใครในคืนนี้ เช่น แม่หมอ หรือตัวเอง และอย่าเปิดเผยตัวตนให้หมาป่ารู้',
  },
  WITCH: {
    role: 'WITCH',
    roleNameTh: 'แม่มด',
    roleNameEn: 'Witch',
    faction: 'VILLAGER',
    factionNameTh: 'ฝ่ายชาวบ้าน',
    shortDescTh: 'มียาชุบชีวิต 1 ขวด และยาพิษสังหาร 1 ขวด (ใช้ได้ชนิดละ 1 ครั้งต่อเกม)',
    description:
      'คุณมีน้ำยาวิเศษ 2 ขวดตลอดทั้งเกม: "ยาชุบชีวิต" เพื่อช่วยคนที่ถูกหมาป่ากัดในคืนนั้น และ "ยาพิษ" เพื่อสังหารผู้ต้องสงสัย 1 คน',
    advice:
      'กลยุทธ์: เก็บยาชุบชีวิตไว้ช่วยคนสำคัญ และใช้ยาพิษเมื่อมั่นใจว่าใครคือมนุษย์หมาป่า',
  },
  HUNTER: {
    role: 'HUNTER',
    roleNameTh: 'นายพราน',
    roleNameEn: 'Hunter',
    faction: 'VILLAGER',
    factionNameTh: 'ฝ่ายชาวบ้าน',
    shortDescTh: 'ตั้งศูนย์เล็งปืนไว้ทุกคืน หากคุณตายจะลั่นไกยิงเป้าหมายตายตามทันที 1 คน',
    description:
      'ในแต่ละคืนคุณสามารถล็อกเป้าปืนลูกซองไว้ที่ผู้ต้องสงสัย 1 คน หากคุณถูกหมาป่าสังหารหรือถูกโหวตประหาร คุณจะยิงคนนั้นตายตามทันที!',
    advice:
      'กลยุทธ์: เล็งเป้าปืนไปที่คนที่คุณสงสัยที่สุดเสมอ หากยังไม่มั่นใจสามารถเลือกไม่ขึ้นนกปืนได้',
  },
  FOOL: {
    role: 'FOOL',
    roleNameTh: 'คนบ้า (โจ๊กเกอร์)',
    roleNameEn: 'Fool',
    faction: 'NEUTRAL',
    factionNameTh: 'ฝ่ายอิสระ (โจ๊กเกอร์)',
    shortDescTh: 'ชนะเดี่ยวทันทีหากหลอกให้หมู่บ้านโหวตประหารตัวเองในตอนกลางวันสำเร็จ!',
    description:
      'คุณไม่ได้อยู่ฝ่ายใดทั้งสิ้น! เป้าหมายเดียวของคุณคือแกล้งทำตัวมีพิรุธเพื่อให้ชาวบ้านโหวตขับไล่คุณในตอนกลางวัน หากถูกโหวตออกคุณจะชนะทันที!',
    advice:
      'กลยุทธ์: ทำตัวน่าสงสัยแต่พองาม อย่าให้หมาป่ากัดคุณตายตอนกลางคืน เพราะต้องตายจากการถูกโหวตเท่านั้นถึงจะชนะ',
  },
  VILLAGER: {
    role: 'VILLAGER',
    roleNameTh: 'ชาวบ้าน',
    roleNameEn: 'Villager',
    faction: 'VILLAGER',
    factionNameTh: 'ฝ่ายชาวบ้าน',
    shortDescTh: 'ชาวบ้านผู้บริสุทธิ์ ใช้ตรรกะและเสียงโหวตตามล่าหมาป่าในตอนกลางวัน',
    description:
      'คุณไม่มีพลังพิเศษในยามค่ำคืน อาวุธเดียวของคุณคือการสังเกตพิรุธ การวิเคราะห์ตรรกะ และเสียงโหวตอันทรงพลังในยามกลางวัน',
    advice:
      'กลยุทธ์: จับตาดูผู้เล่นที่เงียบผิดปกติหรือพยายามชี้นำการโหวตอย่างเร่งรีบ ร่วมมือกับผู้มีพลังพิเศษเพื่อขับไล่หมาป่า',
  },
};

export type RoleConfigMap = Record<RoleType, number>;

export function getRecommendedRoleConfig(
  playerCount: number,
  preset: 'BALANCED' | 'CHAOS' | 'SPECIAL' = 'BALANCED'
): { config: RoleConfigMap; recommendationNoteTh: string } {
  const clamped = Math.max(4, Math.min(12, playerCount));
  const config: RoleConfigMap = {
    WEREWOLF: 1,
    MINION: 0,
    SEER: 1,
    BODYGUARD: 0,
    WITCH: 0,
    HUNTER: 0,
    FOOL: 0,
    VILLAGER: 0,
  };

  let note = '';

  if (preset === 'CHAOS') {
    // Fun party mode with Fool, Witch, and Minion
    config.WEREWOLF = clamped >= 8 ? 2 : 1;
    config.MINION = clamped >= 7 ? 1 : 0;
    config.SEER = 1;
    config.WITCH = 1;
    config.FOOL = 1;
    config.BODYGUARD = clamped >= 6 ? 1 : 0;
    config.HUNTER = clamped >= 9 ? 1 : 0;
    note = `โหมดปาร์ตี้ปั่นประสาท (${clamped} คน): มีคนบ้าคอยหลอกให้โหวต และแม่มดถือยาพิษ`;
  } else if (preset === 'SPECIAL') {
    // High-power mode with minimal vanilla villagers
    config.WEREWOLF = clamped >= 7 ? 2 : 1;
    config.MINION = clamped >= 9 ? 1 : 0;
    config.SEER = 1;
    config.BODYGUARD = 1;
    config.WITCH = clamped >= 5 ? 1 : 0;
    config.HUNTER = clamped >= 6 ? 1 : 0;
    config.FOOL = clamped >= 8 ? 1 : 0;
    note = `โหมดสงครามพลังพิเศษ (${clamped} คน): จัดเต็มบทบาทความสามารถพิเศษครบมือ`;
  } else {
    // Default BALANCED recommendation per player count
    if (clamped === 4) {
      config.WEREWOLF = 1;
      config.SEER = 1;
      config.BODYGUARD = 1;
      note = 'แนะนำสำหรับ 4 คน: 1 หมาป่า, 1 แม่หมอ, 1 บอดี้การ์ด, 1 ชาวบ้าน (เกมเร็วและสูสี)';
    } else if (clamped === 5) {
      config.WEREWOLF = 1;
      config.SEER = 1;
      config.BODYGUARD = 1;
      note = 'แนะนำสำหรับ 5 คน: 1 หมาป่า, 1 บอดี้การ์ด, 1 แม่หมอ, 2 ชาวบ้าน (สมดุลมาตรฐาน)';
    } else if (clamped === 6) {
      config.WEREWOLF = 1;
      config.SEER = 1;
      config.BODYGUARD = 1;
      config.WITCH = 1;
      note = 'แนะนำสำหรับ 6 คน: เพิ่มแม่มด 1 คน เพื่อถ่วงดุลและเพิ่มลูกเล่นยาชุบ/ยาพิษ';
    } else if (clamped === 7) {
      config.WEREWOLF = 2;
      config.SEER = 1;
      config.BODYGUARD = 1;
      config.WITCH = 1;
      note = 'แนะนำสำหรับ 7 คน: 2 หมาป่า ปะทะ แม่หมอ + บอดี้การ์ด + แม่มด';
    } else if (clamped === 8) {
      config.WEREWOLF = 2;
      config.SEER = 1;
      config.BODYGUARD = 1;
      config.WITCH = 1;
      config.HUNTER = 1;
      note = 'แนะนำสำหรับ 8 คน: เพิ่มนายพรานมาช่วยยิงสวนหากฝั่งชาวบ้านเสียเปรียบ';
    } else if (clamped === 9) {
      config.WEREWOLF = 2;
      config.MINION = 1;
      config.SEER = 1;
      config.BODYGUARD = 1;
      config.WITCH = 1;
      config.HUNTER = 1;
      note = 'แนะนำสำหรับ 9 คน: เพิ่มลูกสมุนหมาป่า 1 คนช่วยปั่นหัวชาวบ้าน';
    } else if (clamped === 10) {
      config.WEREWOLF = 2;
      config.MINION = 1;
      config.SEER = 1;
      config.BODYGUARD = 1;
      config.WITCH = 1;
      config.HUNTER = 1;
      config.FOOL = 1;
      note = 'แนะนำสำหรับ 10 คน: ครบทั้ง 3 ฝ่าย (หมาป่า + ชาวบ้าน + คนบ้า)';
    } else {
      config.WEREWOLF = 3;
      config.MINION = clamped >= 12 ? 1 : 0;
      config.SEER = 1;
      config.BODYGUARD = 1;
      config.WITCH = 1;
      config.HUNTER = 1;
      config.FOOL = 1;
      note = `แนะนำสำหรับ ${clamped} คน: หมู่บ้านขนาดใหญ่ หมาป่า 3 ตัวพร้อมโรลพิเศษครบชุด`;
    }
  }

  // Fill remaining slots with VILLAGER (or trim excess if needed)
  const specialSum =
    config.WEREWOLF +
    config.MINION +
    config.SEER +
    config.BODYGUARD +
    config.WITCH +
    config.HUNTER +
    config.FOOL;

  if (specialSum <= clamped) {
    config.VILLAGER = clamped - specialSum;
  } else {
    config.VILLAGER = 0;
  }

  return { config, recommendationNoteTh: note };
}

export interface SeerInvestigationRecord {
  night: number;
  targetId: string;
  targetName: string;
  isWerewolf: boolean;
  factionNameTh: string;
}

export interface Player {
  id: string;
  socketId: string;
  name: string;
  isHost: boolean;
  isAlive: boolean;
  isSimulated: boolean;
  isConnected: boolean;
  role: RoleType | null;
  hasActedNight: boolean;
  hasVoted: boolean;
  isReadyForNext: boolean;
  seerHistory: SeerInvestigationRecord[];
  witchHealAvailable: boolean;
  witchPoisonAvailable: boolean;
  hunterTargetId: string | null;
}

export interface GameLogEntry {
  id: string;
  day: number;
  phase: GamePhase;
  message: string;
  timestamp: number;
  type: 'NIGHT_KILL' | 'DAWN_SAFE' | 'VOTE_EXILE' | 'VOTE_TIE' | 'SYSTEM' | 'VICTORY';
}

export interface VoteTallyItem {
  candidateId: string;
  candidateName: string;
  votes: number;
  voterNames: string[];
}

export interface RoomState {
  roomCode: string;
  phase: GamePhase;
  dayCount: number;
  targetPlayerCount: number;
  roleConfig: RoleConfigMap;
  recommendationNoteTh: string;
  activeNightSequence: ('NIGHT_WEREWOLF' | 'NIGHT_BODYGUARD' | 'NIGHT_SEER' | 'NIGHT_WITCH')[];
  players: Player[];
  remainingSeconds: number;
  totalSeconds: number;
  nightKillTargetId: string | null;
  nightGuardTargetId: string | null;
  lastNightGuardTargetId: string | null;
  witchSavedTonight: boolean;
  witchPoisonTargetId: string | null;
  werewolfHasActed: boolean;
  bodyguardHasActed: boolean;
  seerHasActed: boolean;
  witchHasActed: boolean;
  lastNightVictims: { id: string; name: string; reasonTh: string }[];
  wasSavedByProtection: boolean;
  lastExiledPlayer: { id: string; name: string } | null;
  votes: Record<string, string>;
  tiedCandidateIds: string[];
  lastVoteBreakdown: VoteTallyItem[];
  winnerFaction: FactionType | null;
  winReasonTh: string | null;
  logs: GameLogEntry[];
  lastNarration: {
    text: string;
    soundEffect: 'HOWL' | 'BELL' | 'GAVEL' | 'VICTORY' | 'NONE';
    timestamp: number;
  } | null;
  intervalRef: NodeJS.Timeout | null;
  botTimeoutRefs: NodeJS.Timeout[];
}

const PHASE_DURATIONS: Record<GamePhase, number> = {
  LOBBY: 0,
  ROLE_REVEAL: 15,
  NIGHT_WEREWOLF: 25,
  NIGHT_BODYGUARD: 22,
  NIGHT_SEER: 22,
  NIGHT_WITCH: 24,
  DAY_DISCUSSION: 55,
  VOTING: 35,
  REVOTE: 25,
  VOTE_RESULT: 10,
  GAME_OVER: 0,
};

const BOT_NAMES = [
  'อัศวินรัตติกาล',
  'แม่หมอพยากรณ์',
  'พรานป่าจันทรา',
  'นักพเนจรเงา',
  'ผู้เฒ่าแห่งหุบเขา',
  'จอมเวทย์ดารา',
  'ขุนศึกโล่เงิน',
  'แม่มดหมอกม่วง',
  'นักกวีพเนจร',
  'จอมโจรเงาจันทร์',
  'ผู้พิทักษ์หอคอย',
];

const rooms = new Map<string, RoomState>();

function generateRoomCode(): string {
  const digits = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = 'MW';
  for (let i = 0; i < 4; i++) {
    code += digits[crypto.randomInt(0, digits.length)];
  }
  if (rooms.has(code)) {
    return generateRoomCode();
  }
  return code;
}

function buildAndShuffleDeck(roleConfig: RoleConfigMap): RoleType[] {
  const deck: RoleType[] = [];
  for (const role of ALL_ROLES_ORDER) {
    const count = Math.max(0, roleConfig[role] || 0);
    for (let i = 0; i < count; i++) {
      deck.push(role);
    }
  }
  for (let i = deck.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    const temp = deck[i];
    deck[i] = deck[j];
    deck[j] = temp;
  }
  return deck;
}

function getTotalRolesInConfig(roleConfig: RoleConfigMap): number {
  return ALL_ROLES_ORDER.reduce((sum, r) => sum + Math.max(0, roleConfig[r] || 0), 0);
}

function clearRoomTimers(room: RoomState) {
  if (room.intervalRef) {
    clearInterval(room.intervalRef);
    room.intervalRef = null;
  }
  for (const t of room.botTimeoutRefs) {
    clearTimeout(t);
  }
  room.botTimeoutRefs = [];
}

function addRoomLog(
  room: RoomState,
  message: string,
  type: GameLogEntry['type'] = 'SYSTEM'
) {
  room.logs.unshift({
    id: crypto.randomUUID(),
    day: room.dayCount,
    phase: room.phase,
    message,
    timestamp: Date.now(),
    type,
  });
}

function getSanitizedRoomState(room: RoomState) {
  const isGameOver = room.phase === 'GAME_OVER';
  return {
    roomCode: room.roomCode,
    phase: room.phase,
    dayCount: room.dayCount,
    targetPlayerCount: room.targetPlayerCount,
    roleConfig: room.roleConfig,
    recommendationNoteTh: room.recommendationNoteTh,
    activeNightSequence: room.activeNightSequence,
    remainingSeconds: room.remainingSeconds,
    totalSeconds: room.totalSeconds,
    lastNightVictim:
      room.lastNightVictims.length > 0 ? room.lastNightVictims[0] : null,
    lastNightVictims: room.lastNightVictims,
    wasSavedByBodyguard: room.wasSavedByProtection,
    lastExiledPlayer: room.lastExiledPlayer,
    tiedCandidateIds: room.tiedCandidateIds,
    lastVoteBreakdown:
      room.phase === 'VOTE_RESULT' || room.phase === 'GAME_OVER'
        ? room.lastVoteBreakdown
        : [],
    winnerFaction: room.winnerFaction,
    winReasonTh: room.winReasonTh,
    logs: room.logs.slice(0, 30),
    lastNarration: room.lastNarration,
    players: room.players.map((p) => ({
      id: p.id,
      name: p.name,
      isHost: p.isHost,
      isAlive: p.isAlive,
      isSimulated: p.isSimulated,
      isConnected: p.isConnected,
      hasVoted: p.hasVoted,
      isReadyForNext: p.isReadyForNext,
      revealedRole: isGameOver && p.role ? p.role : undefined,
      revealedRoleNameTh:
        isGameOver && p.role ? ROLE_METADATA[p.role].roleNameTh : undefined,
      revealedFaction:
        isGameOver && p.role ? ROLE_METADATA[p.role].faction : undefined,
    })),
  };
}

function broadcastRoomState(io: Server, room: RoomState) {
  io.to(room.roomCode).emit('room_state_update', getSanitizedRoomState(room));
}

function emitPrivatePlayerState(io: Server, player: Player, room: RoomState) {
  if (player.isSimulated || !player.socketId) return;
  if (player.role && room.phase !== 'LOBBY') {
    // If player is WEREWOLF or MINION, let them see living/all Werewolves
    let fellowWerewolves: { id: string; name: string; role: RoleType }[] = [];
    if (player.role === 'WEREWOLF' || player.role === 'MINION') {
      fellowWerewolves = room.players
        .filter((p) => p.role === 'WEREWOLF' && p.id !== player.id)
        .map((p) => ({ id: p.id, name: p.name, role: 'WEREWOLF' }));
    }

    // If player is WITCH and phase is NIGHT_WITCH, tell them who is being attacked tonight (if not guarded by Bodyguard)
    let witchAttackedVictim: { id: string; name: string } | null = null;
    if (
      player.role === 'WITCH' &&
      room.phase === 'NIGHT_WITCH' &&
      room.nightKillTargetId &&
      room.nightKillTargetId !== room.nightGuardTargetId
    ) {
      const v = room.players.find((p) => p.id === room.nightKillTargetId);
      if (v) {
        witchAttackedVictim = { id: v.id, name: v.name };
      }
    }

    io.to(player.socketId).emit('private_role', {
      ...ROLE_METADATA[player.role],
      hasActedNight: player.hasActedNight,
      myVoteTargetId: room.votes[player.id] || null,
      seerHistory: player.seerHistory,
      lastProtectedId:
        player.role === 'BODYGUARD' ? room.lastNightGuardTargetId : null,
      witchHealAvailable: player.witchHealAvailable,
      witchPoisonAvailable: player.witchPoisonAvailable,
      witchAttackedVictim,
      hunterTargetId: player.hunterTargetId,
      fellowWerewolves,
    });
  }
}

function announceGM(
  io: Server,
  room: RoomState,
  text: string,
  soundEffect: 'HOWL' | 'BELL' | 'GAVEL' | 'VICTORY' | 'NONE' = 'NONE',
  audioId?: string
) {
  const narration = {
    text,
    soundEffect,
    audioId,
    phase: room.phase,
    timestamp: Date.now(),
  };
  room.lastNarration = narration;
  io.to(room.roomCode).emit('gm_narration', narration);
}

function checkVictoryCondition(room: RoomState): {
  isOver: boolean;
  winnerFaction: FactionType | null;
  reasonTh: string | null;
} {
  const livingPlayers = room.players.filter((p) => p.isAlive);
  const livingWolves = livingPlayers.filter((p) => p.role === 'WEREWOLF').length;
  const livingOthers = livingPlayers.filter((p) => p.role !== 'WEREWOLF').length;

  if (livingWolves === 0) {
    return {
      isOver: true,
      winnerFaction: 'VILLAGER',
      reasonTh:
        'ชาวบ้านร่วมมือกันกำจัดมนุษย์หมาป่าทั้งหมดได้สำเร็จ หมู่บ้านกลับมาสงบสุขอีกครั้ง!',
    };
  }

  if (livingWolves >= livingOthers) {
    return {
      isOver: true,
      winnerFaction: 'WEREWOLF',
      reasonTh:
        'จำนวนมนุษย์หมาป่าเทียบเท่าผู้รอดชีวิตที่เหลือ หมู่บ้านถูกกลืนกินด้วยความมืดมิดชั่วนิรันดร์!',
    };
  }

  return { isOver: false, winnerFaction: null, reasonTh: null };
}

function startPhaseTimer(
  io: Server,
  room: RoomState,
  durationSeconds: number,
  onExpire: () => void
) {
  clearRoomTimers(room);
  room.totalSeconds = durationSeconds;
  room.remainingSeconds = durationSeconds;

  room.intervalRef = setInterval(() => {
    room.remainingSeconds = Math.max(0, room.remainingSeconds - 1);
    io.to(room.roomCode).emit('timer_tick', {
      remainingSeconds: room.remainingSeconds,
      totalSeconds: room.totalSeconds,
      phase: room.phase,
    });

    if (room.remainingSeconds <= 0) {
      clearRoomTimers(room);
      onExpire();
    }
  }, 1000);
}

// ============================================================================
// DYNAMIC NIGHT SEQUENCE DISPATCHER
// ============================================================================

function buildActiveNightSequence(
  roleConfig: RoleConfigMap
): ('NIGHT_WEREWOLF' | 'NIGHT_BODYGUARD' | 'NIGHT_SEER' | 'NIGHT_WITCH')[] {
  const seq: ('NIGHT_WEREWOLF' | 'NIGHT_BODYGUARD' | 'NIGHT_SEER' | 'NIGHT_WITCH')[] = [
    'NIGHT_WEREWOLF',
  ];
  if ((roleConfig.BODYGUARD || 0) > 0) seq.push('NIGHT_BODYGUARD');
  if ((roleConfig.SEER || 0) > 0) seq.push('NIGHT_SEER');
  if ((roleConfig.WITCH || 0) > 0) seq.push('NIGHT_WITCH');
  return seq;
}

function advanceToNextNightSubPhase(
  io: Server,
  room: RoomState,
  currentSubPhase: 'NIGHT_WEREWOLF' | 'NIGHT_BODYGUARD' | 'NIGHT_SEER' | 'NIGHT_WITCH'
) {
  const idx = room.activeNightSequence.indexOf(currentSubPhase);
  const nextPhase =
    idx !== -1 && idx + 1 < room.activeNightSequence.length
      ? room.activeNightSequence[idx + 1]
      : null;

  if (!nextPhase) {
    resolveNightAndTransitionToDawn(io, room);
    return;
  }

  if (nextPhase === 'NIGHT_BODYGUARD') {
    transitionToNightBodyguard(io, room);
  } else if (nextPhase === 'NIGHT_SEER') {
    transitionToNightSeer(io, room);
  } else if (nextPhase === 'NIGHT_WITCH') {
    transitionToNightWitch(io, room);
  }
}

// ============================================================================
// AUTHORITATIVE GAME PHASE TRANSITIONS
// ============================================================================

function transitionToRoleReveal(io: Server, room: RoomState) {
  clearRoomTimers(room);
  room.phase = 'ROLE_REVEAL';
  room.dayCount = 0;
  room.winnerFaction = null;
  room.winReasonTh = null;
  room.lastNightVictims = [];
  room.wasSavedByProtection = false;
  room.nightKillTargetId = null;
  room.nightGuardTargetId = null;
  room.lastNightGuardTargetId = null;
  room.witchSavedTonight = false;
  room.witchPoisonTargetId = null;
  room.lastExiledPlayer = null;
  room.logs = [];

  room.activeNightSequence = buildActiveNightSequence(room.roleConfig);
  const roles = buildAndShuffleDeck(room.roleConfig);

  room.players.forEach((player, idx) => {
    player.role = roles[idx] || 'VILLAGER';
    player.isAlive = true;
    player.hasActedNight = false;
    player.hasVoted = false;
    player.isReadyForNext = player.isSimulated;
    player.seerHistory = [];
    player.witchHealAvailable = player.role === 'WITCH';
    player.witchPoisonAvailable = player.role === 'WITCH';
    player.hunterTargetId = null;
  });

  addRoomLog(
    room,
    `เกมเริ่มต้นขึ้น! ผู้เล่นทั้งหมด ${room.players.length} คนได้รับบทบาทลับแล้ว`,
    'SYSTEM'
  );

  for (const player of room.players) {
    emitPrivatePlayerState(io, player, room);
  }

  announceGM(
    io,
    room,
    'จงแตะที่ไพ่เพื่อดูบทบาทลับของคุณ และเก็บเป็นความลับสุดยอด',
    'BELL',
    'role_reveal'
  );

  startPhaseTimer(io, room, PHASE_DURATIONS.ROLE_REVEAL, () => {
    transitionToNightWerewolf(io, room);
  });

  broadcastRoomState(io, room);
}

// NIGHT STEP 1: WEREWOLF TURN
function transitionToNightWerewolf(io: Server, room: RoomState) {
  clearRoomTimers(room);
  room.phase = 'NIGHT_WEREWOLF';
  room.dayCount += 1;
  room.nightKillTargetId = null;
  room.nightGuardTargetId = null;
  room.witchSavedTonight = false;
  room.witchPoisonTargetId = null;
  room.werewolfHasActed = false;
  room.bodyguardHasActed = false;
  room.seerHasActed = false;
  room.witchHasActed = false;
  room.lastExiledPlayer = null;

  for (const p of room.players) {
    p.hasActedNight = false;
    p.hasVoted = false;
    p.isReadyForNext = false;
    emitPrivatePlayerState(io, p, room);
  }

  // Simulated Hunter sets a target automatically
  const livingBotHunters = room.players.filter(
    (p) => p.isAlive && p.isSimulated && p.role === 'HUNTER'
  );
  for (const h of livingBotHunters) {
    const others = room.players.filter((p) => p.isAlive && p.id !== h.id);
    if (others.length > 0) {
      h.hunterTargetId = others[crypto.randomInt(0, others.length)].id;
    }
  }

  addRoomLog(
    room,
    `คืนที่ ${room.dayCount}: ทุกคนหลับตา — ถึงเวลาของมนุษย์หมาป่าออกล่าเหยื่อ`,
    'SYSTEM'
  );

  announceGM(
    io,
    room,
    'ขอให้ทุกคนหลับตาลง มนุษย์หมาป่าจงตื่นขึ้น และเลือกเหยื่อที่ต้องการสังหาร',
    'HOWL',
    'night_werewolf'
  );

  startPhaseTimer(io, room, PHASE_DURATIONS.NIGHT_WEREWOLF, () => {
    advanceToNextNightSubPhase(io, room, 'NIGHT_WEREWOLF');
  });

  const livingWerewolves = room.players.filter(
    (p) => p.isAlive && p.role === 'WEREWOLF'
  );
  const allWolvesAreBots =
    livingWerewolves.length > 0 && livingWerewolves.every((w) => w.isSimulated);

  if (allWolvesAreBots) {
    const t = setTimeout(() => {
      if (room.phase !== 'NIGHT_WEREWOLF' || room.werewolfHasActed) return;
      const candidates = room.players.filter(
        (p) => p.isAlive && p.role !== 'WEREWOLF'
      );
      if (candidates.length > 0) {
        const victim = candidates[crypto.randomInt(0, candidates.length)];
        room.nightKillTargetId = victim.id;
        room.werewolfHasActed = true;
        livingWerewolves.forEach((w) => (w.hasActedNight = true));
      }
      advanceToNextNightSubPhase(io, room, 'NIGHT_WEREWOLF');
    }, crypto.randomInt(7000, 9500));
    room.botTimeoutRefs.push(t);
  }

  broadcastRoomState(io, room);
}

// NIGHT STEP 2: BODYGUARD TURN
function transitionToNightBodyguard(io: Server, room: RoomState) {
  clearRoomTimers(room);
  room.phase = 'NIGHT_BODYGUARD';

  for (const p of room.players) {
    if (p.role === 'BODYGUARD') p.hasActedNight = false;
    emitPrivatePlayerState(io, p, room);
  }

  addRoomLog(
    room,
    `คืนที่ ${room.dayCount}: มนุษย์หมาป่าหลับตา — ถึงเวลาของบอดี้การ์ดเลือกคุ้มกัน`,
    'SYSTEM'
  );

  announceGM(
    io,
    room,
    'มนุษย์หมาป่าหลับตาลง บอดี้การ์ดจงตื่นขึ้น และเลือกผู้ที่ต้องการปกป้อง',
    'BELL',
    'night_bodyguard'
  );

  startPhaseTimer(io, room, PHASE_DURATIONS.NIGHT_BODYGUARD, () => {
    advanceToNextNightSubPhase(io, room, 'NIGHT_BODYGUARD');
  });

  const livingBodyguard = room.players.find(
    (p) => p.isAlive && p.role === 'BODYGUARD'
  );

  if (!livingBodyguard) {
    room.bodyguardHasActed = true;
    const t = setTimeout(() => {
      if (room.phase !== 'NIGHT_BODYGUARD') return;
      advanceToNextNightSubPhase(io, room, 'NIGHT_BODYGUARD');
    }, crypto.randomInt(6500, 8500));
    room.botTimeoutRefs.push(t);
  } else if (livingBodyguard.isSimulated) {
    const t = setTimeout(() => {
      if (room.phase !== 'NIGHT_BODYGUARD' || room.bodyguardHasActed) return;
      const validTargets = room.players.filter(
        (p) => p.isAlive && p.id !== room.lastNightGuardTargetId
      );
      if (validTargets.length > 0) {
        const chosen = validTargets[crypto.randomInt(0, validTargets.length)];
        room.nightGuardTargetId = chosen.id;
        room.bodyguardHasActed = true;
        livingBodyguard.hasActedNight = true;
      }
      advanceToNextNightSubPhase(io, room, 'NIGHT_BODYGUARD');
    }, crypto.randomInt(6000, 8500));
    room.botTimeoutRefs.push(t);
  }

  broadcastRoomState(io, room);
}

// NIGHT STEP 3: SEER TURN
function transitionToNightSeer(io: Server, room: RoomState) {
  clearRoomTimers(room);
  room.phase = 'NIGHT_SEER';

  for (const p of room.players) {
    if (p.role === 'SEER') p.hasActedNight = false;
    emitPrivatePlayerState(io, p, room);
  }

  addRoomLog(
    room,
    `คืนที่ ${room.dayCount}: ถึงเวลาของผู้หยั่งรู้ (แม่หมอ) ตรวจสอบตัวตน`,
    'SYSTEM'
  );

  announceGM(
    io,
    room,
    'บอดี้การ์ดหลับตาลง แม่หมอจงตื่นขึ้น และเลือกตรวจสอบผู้ต้องสงสัย',
    'BELL',
    'night_seer'
  );

  startPhaseTimer(io, room, PHASE_DURATIONS.NIGHT_SEER, () => {
    advanceToNextNightSubPhase(io, room, 'NIGHT_SEER');
  });

  const livingSeer = room.players.find((p) => p.isAlive && p.role === 'SEER');

  if (!livingSeer) {
    room.seerHasActed = true;
    const t = setTimeout(() => {
      if (room.phase !== 'NIGHT_SEER') return;
      advanceToNextNightSubPhase(io, room, 'NIGHT_SEER');
    }, crypto.randomInt(6500, 8500));
    room.botTimeoutRefs.push(t);
  } else if (livingSeer.isSimulated) {
    const t = setTimeout(() => {
      if (room.phase !== 'NIGHT_SEER' || room.seerHasActed) return;
      const candidates = room.players.filter(
        (p) => p.isAlive && p.id !== livingSeer.id
      );
      if (candidates.length > 0) {
        const target = candidates[crypto.randomInt(0, candidates.length)];
        room.seerHasActed = true;
        livingSeer.hasActedNight = true;
        livingSeer.seerHistory.unshift({
          night: room.dayCount,
          targetId: target.id,
          targetName: target.name,
          isWerewolf: target.role === 'WEREWOLF',
          factionNameTh:
            target.role === 'WEREWOLF'
              ? 'มนุษย์หมาป่า (ฝ่ายรัตติกาล)'
              : 'ไม่ใช่หมาป่า (ฝ่ายชาวบ้าน)',
        });
      }
      advanceToNextNightSubPhase(io, room, 'NIGHT_SEER');
    }, crypto.randomInt(6000, 8500));
    room.botTimeoutRefs.push(t);
  }

  broadcastRoomState(io, room);
}

// NIGHT STEP 4: WITCH TURN
function transitionToNightWitch(io: Server, room: RoomState) {
  clearRoomTimers(room);
  room.phase = 'NIGHT_WITCH';

  for (const p of room.players) {
    if (p.role === 'WITCH') p.hasActedNight = false;
    emitPrivatePlayerState(io, p, room);
  }

  addRoomLog(
    room,
    `คืนที่ ${room.dayCount}: ถึงเวลาของแม่มดเลือกใช้น้ำยาวิเศษ`,
    'SYSTEM'
  );

  announceGM(
    io,
    room,
    'แม่หมอหลับตาลง แม่มดจงตื่นขึ้น และตัดสินใจใช้ยาวิเศษ',
    'BELL',
    'night_witch'
  );

  startPhaseTimer(io, room, PHASE_DURATIONS.NIGHT_WITCH, () => {
    advanceToNextNightSubPhase(io, room, 'NIGHT_WITCH');
  });

  const livingWitch = room.players.find((p) => p.isAlive && p.role === 'WITCH');

  if (!livingWitch) {
    room.witchHasActed = true;
    const t = setTimeout(() => {
      if (room.phase !== 'NIGHT_WITCH') return;
      advanceToNextNightSubPhase(io, room, 'NIGHT_WITCH');
    }, crypto.randomInt(4500, 7500));
    room.botTimeoutRefs.push(t);
  } else if (livingWitch.isSimulated) {
    const t = setTimeout(() => {
      if (room.phase !== 'NIGHT_WITCH' || room.witchHasActed) return;
      // Simulated Witch heals victim if heal potion available
      if (
        livingWitch.witchHealAvailable &&
        room.nightKillTargetId &&
        room.nightKillTargetId !== room.nightGuardTargetId
      ) {
        room.witchSavedTonight = true;
        livingWitch.witchHealAvailable = false;
      }
      room.witchHasActed = true;
      livingWitch.hasActedNight = true;
      advanceToNextNightSubPhase(io, room, 'NIGHT_WITCH');
    }, crypto.randomInt(4000, 7000));
    room.botTimeoutRefs.push(t);
  }

  broadcastRoomState(io, room);
}

// ============================================================================
// DAWN RESOLUTION (WITH BODYGUARD, WITCH, AND HUNTER REVENGE TRIGGER)
// ============================================================================

function resolveNightAndTransitionToDawn(io: Server, room: RoomState) {
  clearRoomTimers(room);

  room.lastNightGuardTargetId = room.nightGuardTargetId;
  const victims: { id: string; name: string; reasonTh: string }[] = [];
  let savedByProtection = false;

  // 1. Resolve Werewolf Kill
  if (room.nightKillTargetId) {
    const guardedByBodyguard =
      room.nightGuardTargetId &&
      room.nightKillTargetId === room.nightGuardTargetId;
    const savedByWitch = room.witchSavedTonight;

    if (guardedByBodyguard || savedByWitch) {
      savedByProtection = true;
    } else {
      const target = room.players.find(
        (p) => p.id === room.nightKillTargetId && p.isAlive
      );
      if (target) {
        target.isAlive = false;
        victims.push({
          id: target.id,
          name: target.name,
          reasonTh: 'ถูกหมาป่าสังหาร',
        });
      }
    }
  }

  // 2. Resolve Witch Poison
  if (room.witchPoisonTargetId) {
    const poisoned = room.players.find(
      (p) => p.id === room.witchPoisonTargetId && p.isAlive
    );
    if (poisoned) {
      poisoned.isAlive = false;
      victims.push({
        id: poisoned.id,
        name: poisoned.name,
        reasonTh: 'ถูกยาพิษปริศนาสังหาร',
      });
    }
  }

  // 3. Check if any killed victim is a HUNTER with a revenge shot!
  for (const v of [...victims]) {
    const deadPlayer = room.players.find((p) => p.id === v.id);
    if (deadPlayer && deadPlayer.role === 'HUNTER' && deadPlayer.hunterTargetId) {
      const shotTarget = room.players.find(
        (p) => p.id === deadPlayer.hunterTargetId && p.isAlive
      );
      if (shotTarget) {
        shotTarget.isAlive = false;
        victims.push({
          id: shotTarget.id,
          name: shotTarget.name,
          reasonTh: `ถูกนายพราน ${deadPlayer.name} ยิงสวนก่อนสิ้นใจ!`,
        });
        addRoomLog(
          room,
          `ปืนลั่นยามรุ่งอรุณ! นายพราน "${deadPlayer.name}" ยิง "${shotTarget.name}" ตายตามไปด้วย!`,
          'NIGHT_KILL'
        );
      }
    }
  }

  room.lastNightVictims = victims;
  room.wasSavedByProtection = savedByProtection;

  if (victims.length > 0) {
    const names = victims.map((v) => `${v.name} (${v.reasonTh})`).join(', ');
    addRoomLog(
      room,
      `รุ่งอรุณวันที่ ${room.dayCount}: ผู้เสียชีวิตเมื่อคืนนี้ได้แก่ ${names}`,
      'NIGHT_KILL'
    );
  } else if (savedByProtection) {
    addRoomLog(
      room,
      `รุ่งอรุณวันที่ ${room.dayCount}: มีการคุ้มกันหรือช่วยเหลือสำเร็จ ไม่มีผู้ใดเสียชีวิต!`,
      'DAWN_SAFE'
    );
  } else {
    addRoomLog(
      room,
      `รุ่งอรุณวันที่ ${room.dayCount}: เมื่อคืนนี้ไม่มีผู้ใดเสียชีวิต`,
      'DAWN_SAFE'
    );
  }

  // Check immediate victory condition at Dawn
  const victory = checkVictoryCondition(room);
  if (victory.isOver && victory.winnerFaction) {
    const victimMsg =
      victims.length > 0
        ? `เมื่อคืนนี้ ${victims.map((v) => v.name).join(' และ ')} เสียชีวิต... `
        : '';
    transitionToGameOver(
      io,
      room,
      victory.winnerFaction,
      `${victimMsg}${victory.reasonTh}`
    );
    return;
  }

  room.phase = 'DAY_DISCUSSION';
  for (const p of room.players) {
    p.isReadyForNext = p.isSimulated || !p.isAlive;
    emitPrivatePlayerState(io, p, room);
  }

  const dawnSpeech =
    victims.length > 0
      ? `รุ่งอรุณมาถึงแล้ว ขอให้ทุกคนลืมตาขึ้น... เมื่อคืนนี้ ${victims
          .map((v) => v.name)
          .join(' และ ')} ถูกสังหาร ขอให้ผู้รอดชีวิตร่วมกันอภิปรายหาตัวหมาป่า`
      : savedByProtection
      ? 'รุ่งอรุณมาถึงแล้ว ขอให้ทุกคนลืมตาขึ้น... เมื่อคืนนี้เหยื่อได้รับการปกป้องไว้ได้ทัน ไม่มีผู้ใดเสียชีวิต!'
      : 'รุ่งอรุณมาถึงแล้ว ขอให้ทุกคนลืมตาขึ้น... เมื่อคืนนี้ไม่มีผู้ใดเสียชีวิต ขอให้ทุกคนร่วมกันอภิปรายหาตัวหมาป่า';

  const dawnAudioId = victims.length > 0 ? 'dawn_wake' : 'dawn_no_kill';
  announceGM(io, room, dawnSpeech, 'BELL', dawnAudioId);

  startPhaseTimer(io, room, PHASE_DURATIONS.DAY_DISCUSSION, () => {
    transitionToVoting(io, room, false, []);
  });

  broadcastRoomState(io, room);
}

function transitionToVoting(
  io: Server,
  room: RoomState,
  isRevote: boolean,
  tiedCandidateIds: string[]
) {
  clearRoomTimers(room);
  room.phase = isRevote ? 'REVOTE' : 'VOTING';
  room.votes = {};
  room.tiedCandidateIds = isRevote ? tiedCandidateIds : [];

  for (const p of room.players) {
    p.hasVoted = false;
    p.isReadyForNext = false;
    emitPrivatePlayerState(io, p, room);
  }

  if (isRevote) {
    const tiedNames = room.players
      .filter((p) => tiedCandidateIds.includes(p.id))
      .map((p) => p.name)
      .join(' และ ');
    addRoomLog(
      room,
      `โหวตตัดเชือก (Revote): คะแนนเท่ากันระหว่าง ${tiedNames}`,
      'VOTE_TIE'
    );
    announceGM(
      io,
      room,
      `คะแนนโหวตเท่ากัน! เข้าสู่การโหวตตัดเชือกครั้งสุดท้ายระหว่าง ${tiedNames}`,
      'GAVEL'
    );
  } else {
    addRoomLog(
      room,
      `วันที่ ${room.dayCount}: เข้าสู่ช่วงลงคะแนนโหวตขับไล่ผู้ต้องสงสัย`,
      'SYSTEM'
    );
    announceGM(
      io,
      room,
      'ถึงเวลาลงคะแนนโหวตขับไล่ ขอให้ทุกคนเลือกโหวตผู้ต้องสงสัยหนึ่งคน',
      'GAVEL',
      'voting_start'
    );
  }

  const duration = isRevote ? PHASE_DURATIONS.REVOTE : PHASE_DURATIONS.VOTING;
  startPhaseTimer(io, room, duration, () => {
    resolveVotes(io, room);
  });

  const livingBots = room.players.filter((p) => p.isAlive && p.isSimulated);
  for (const bot of livingBots) {
    const t = setTimeout(() => {
      if (room.phase !== 'VOTING' && room.phase !== 'REVOTE') return;
      if (bot.hasVoted || !bot.isAlive) return;

      let validCandidates = room.players.filter(
        (p) => p.isAlive && p.id !== bot.id
      );
      if (room.phase === 'REVOTE' && room.tiedCandidateIds.length > 0) {
        validCandidates = validCandidates.filter((p) =>
          room.tiedCandidateIds.includes(p.id)
        );
      }

      if (validCandidates.length > 0) {
        let chosen = validCandidates[crypto.randomInt(0, validCandidates.length)];
        if (bot.role === 'SEER') {
          const knownWolf = bot.seerHistory.find((h) => h.isWerewolf);
          const wolfCandidate = validCandidates.find(
            (c) => c.id === knownWolf?.targetId
          );
          if (wolfCandidate) chosen = wolfCandidate;
        }
        room.votes[bot.id] = chosen.id;
        bot.hasVoted = true;
        broadcastRoomState(io, room);
        checkAllVoted(io, room);
      }
    }, crypto.randomInt(2500, 6500));
    room.botTimeoutRefs.push(t);
  }

  broadcastRoomState(io, room);
}

function checkAllVoted(io: Server, room: RoomState) {
  if (room.phase !== 'VOTING' && room.phase !== 'REVOTE') return;
  const livingPlayers = room.players.filter((p) => p.isAlive);
  const allVoted = livingPlayers.every((p) => p.hasVoted);
  if (allVoted) {
    resolveVotes(io, room);
  }
}

function resolveVotes(io: Server, room: RoomState) {
  clearRoomTimers(room);
  const wasRevote = room.phase === 'REVOTE';

  const tallyMap = new Map<string, { count: number; voterNames: string[] }>();
  for (const p of room.players) {
    if (p.isAlive) {
      tallyMap.set(p.id, { count: 0, voterNames: [] });
    }
  }

  for (const [voterId, candidateId] of Object.entries(room.votes)) {
    const voter = room.players.find((p) => p.id === voterId && p.isAlive);
    const entry = tallyMap.get(candidateId);
    if (voter && entry) {
      entry.count += 1;
      entry.voterNames.push(voter.name);
    }
  }

  const breakdown: VoteTallyItem[] = [];
  let maxVotes = 0;

  for (const [candidateId, data] of tallyMap.entries()) {
    const candidate = room.players.find((p) => p.id === candidateId);
    if (candidate && data.count > 0) {
      breakdown.push({
        candidateId,
        candidateName: candidate.name,
        votes: data.count,
        voterNames: data.voterNames,
      });
      if (data.count > maxVotes) {
        maxVotes = data.count;
      }
    }
  }

  breakdown.sort((a, b) => b.votes - a.votes);
  room.lastVoteBreakdown = breakdown;

  const topCandidates = breakdown.filter((b) => b.votes === maxVotes && maxVotes > 0);

  if (maxVotes === 0 || topCandidates.length === 0) {
    room.lastExiledPlayer = null;
    room.phase = 'VOTE_RESULT';
    addRoomLog(
      room,
      `ผลโหวตวันที่ ${room.dayCount}: ไม่มีผู้ใดลงคะแนน ไม่มีผู้ถูกขับไล่`,
      'VOTE_TIE'
    );
    announceGM(
      io,
      room,
      'ไม่มีผู้ใดลงคะแนนโหวต หมู่บ้านจึงไม่มีผู้ถูกขับไล่ในวันนี้',
      'BELL',
      'vote_tie'
    );
    startPhaseTimer(io, room, PHASE_DURATIONS.VOTE_RESULT, () => {
      transitionToNightWerewolf(io, room);
    });
    broadcastRoomState(io, room);
    return;
  }

  if (topCandidates.length === 1) {
    const exiledId = topCandidates[0].candidateId;
    const exiledPlayer = room.players.find((p) => p.id === exiledId);
    if (exiledPlayer) {
      exiledPlayer.isAlive = false;
      room.lastExiledPlayer = { id: exiledPlayer.id, name: exiledPlayer.name };
      addRoomLog(
        room,
        `ผลโหวตวันที่ ${room.dayCount}: "${exiledPlayer.name}" ถูกโหวตขับไล่ (${topCandidates[0].votes} คะแนน)`,
        'VOTE_EXILE'
      );

      // SPECIAL ROLE CHECK 1: Was the exiled player the FOOL (คนบ้า/โจ๊กเกอร์)?
      if (exiledPlayer.role === 'FOOL') {
        transitionToGameOver(
          io,
          room,
          'NEUTRAL',
          `หมู่บ้านหลงกลโหวตประหาร "${exiledPlayer.name}" ซึ่งเป็นคนบ้า (Fool)! คนบ้าได้รับชัยชนะเดี่ยวทันที!`
        );
        return;
      }

      // SPECIAL ROLE CHECK 2: Was the exiled player the HUNTER (นายพราน)?
      if (exiledPlayer.role === 'HUNTER' && exiledPlayer.hunterTargetId) {
        const shotTarget = room.players.find(
          (p) => p.id === exiledPlayer.hunterTargetId && p.isAlive
        );
        if (shotTarget) {
          shotTarget.isAlive = false;
          addRoomLog(
            room,
            `ปืนลั่นกลางลานประหาร! นายพราน "${exiledPlayer.name}" ยิง "${shotTarget.name}" ล้มลงไปด้วย!`,
            'VOTE_EXILE'
          );
        }
      }
    }

    const victory = checkVictoryCondition(room);
    if (victory.isOver && victory.winnerFaction) {
      const exilePrefix = exiledPlayer
        ? `ผลโหวต ${exiledPlayer.name} ถูกขับไล่ออกจากหมู่บ้าน! `
        : '';
      transitionToGameOver(
        io,
        room,
        victory.winnerFaction,
        `${exilePrefix}${victory.reasonTh}`
      );
      return;
    }

    room.phase = 'VOTE_RESULT';
    announceGM(
      io,
      room,
      `ผลการโหวต ${exiledPlayer?.name} ได้รับคะแนนสูงสุดและถูกขับไล่ออกจากหมู่บ้าน... เตรียมเข้าสู่ยามราตรีอีกครั้ง`,
      'GAVEL',
      'vote_exiled'
    );
    startPhaseTimer(io, room, PHASE_DURATIONS.VOTE_RESULT, () => {
      transitionToNightWerewolf(io, room);
    });
    broadcastRoomState(io, room);
    return;
  }

  if (!wasRevote) {
    const tiedIds = topCandidates.map((c) => c.candidateId);
    transitionToVoting(io, room, true, tiedIds);
    return;
  } else {
    room.lastExiledPlayer = null;
    room.phase = 'VOTE_RESULT';
    addRoomLog(
      room,
      `ผลโหวตตัดเชือกวันที่ ${room.dayCount}: คะแนนยังคงเสมอกัน ไม่มีผู้ใดถูกขับไล่`,
      'VOTE_TIE'
    );
    announceGM(
      io,
      room,
      'ผลการโหวตตัดเชือกยังคงเสมอกัน หมู่บ้านหาข้อสรุปไม่ได้ จึงไม่มีผู้ใดถูกขับไล่ในวันนี้',
      'BELL',
      'vote_tie'
    );
    startPhaseTimer(io, room, PHASE_DURATIONS.VOTE_RESULT, () => {
      transitionToNightWerewolf(io, room);
    });
    broadcastRoomState(io, room);
  }
}

function transitionToGameOver(
  io: Server,
  room: RoomState,
  winnerFaction: FactionType,
  reasonTh: string
) {
  clearRoomTimers(room);
  room.phase = 'GAME_OVER';
  room.winnerFaction = winnerFaction;
  room.winReasonTh = reasonTh;
  room.remainingSeconds = 0;
  room.totalSeconds = 0;

  const winnerTitle =
    winnerFaction === 'VILLAGER'
      ? 'ฝ่ายชาวบ้านได้รับชัยชนะ!'
      : winnerFaction === 'NEUTRAL'
      ? 'ฝ่ายคนบ้า (โจ๊กเกอร์) ได้รับชัยชนะเดี่ยว!'
      : 'ฝ่ายมนุษย์หมาป่าได้รับชัยชนะ!';

  addRoomLog(room, `จบเกม: ${winnerTitle} — ${reasonTh}`, 'VICTORY');

  announceGM(io, room, `เกมจบลงแล้ว! ${winnerTitle} ${reasonTh}`, 'VICTORY');
  broadcastRoomState(io, room);
}

// ============================================================================
// EXPRESS & SOCKET.IO INITIALIZATION
// ============================================================================

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '15mb' }));

  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', activeRooms: rooms.size, geminiConfigured: !!process.env.GEMINI_API_KEY });
  });

  // Direct PNG Icon Uploader: saves the user's exact original PNG file to /public/
  app.post('/api/upload-icon', (req, res) => {
    try {
      const { dataUrl } = req.body || {};
      if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) {
        return res.status(400).json({ ok: false, error: 'กรุณาเลือกไฟล์รูปภาพ PNG' });
      }
      const base64Match = dataUrl.split(',')[1];
      if (!base64Match) {
        return res.status(400).json({ ok: false, error: 'ข้อมูลไฟล์รูปภาพไม่ถูกต้อง' });
      }
      const imgBuffer = Buffer.from(base64Match, 'base64');
      const publicDir = path.join(__dirname, 'public');
      const targetFiles = [
        'icon-512.png',
        'icon-192.png',
        'pwa-512x512.png',
        'pwa-192x192.png',
        'pwa-maskable-512x512.png',
        'apple-touch-icon.png',
      ];
      for (const fileName of targetFiles) {
        fs.writeFileSync(path.join(publicDir, fileName), imgBuffer);
      }
      const distDir = path.join(__dirname, 'dist');
      if (fs.existsSync(distDir)) {
        for (const fileName of targetFiles) {
          fs.writeFileSync(path.join(distDir, fileName), imgBuffer);
        }
      }
      const version = Date.now();
      io.emit('icon_updated', { version });
      return res.json({ ok: true, version });
    } catch (err: any) {
      return res.status(500).json({ ok: false, error: err?.message || 'ไม่สามารถบันทึกไอคอนได้' });
    }
  });

  // Google Gemini TTS Voices catalog
  app.get('/api/tts/voices', (_req, res) => {
    res.json({
      ok: true,
      voices: GEMINI_AVAILABLE_VOICES,
      defaultVoice: 'Fenrir',
      model: 'gemini-3.8-flash-lite-tts',
      isGeminiReady: !!process.env.GEMINI_API_KEY,
    });
  });

  // Google Gemini TTS Speech Synthesis endpoint (Server-Authoritative Audio)
  app.post('/api/tts', async (req, res) => {
    try {
      const { text, voice } = req.body || {};
      const cleanText = typeof text === 'string' ? text.trim() : '';
      if (!cleanText) {
        return res.status(400).json({ ok: false, error: 'Text is required for TTS' });
      }

      const validVoiceIds = ['Fenrir', 'Charon', 'Kore', 'Puck', 'Zephyr'];
      const chosenVoice = validVoiceIds.includes(voice) ? voice : 'Fenrir';
      const cacheKey = `${chosenVoice}:${cleanText}`;

      // Check In-Memory LRU Cache first (< 5ms response time)
      if (ttsAudioCache.has(cacheKey)) {
        return res.json({
          ok: true,
          audioBase64: ttsAudioCache.get(cacheKey),
          format: 'audio/wav',
          cached: true,
          voice: chosenVoice,
        });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.json({
          ok: false,
          error: 'GEMINI_API_KEY is not configured on the server',
          fallback: true,
        });
      }

      // Try gemini-3.8-flash-tts first, fallback to gemini-3.8-flash-lite-tts if needed
      const candidateModels = ['gemini-3.8-flash-tts', 'gemini-3.8-flash-lite-tts'];
      let audioBase64: string | undefined;

      for (const model of candidateModels) {
        try {
          const geminiResponse = await ai.models.generateContent({
            model,
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: cleanText,
                    speechMetadata: {
                      style: 'Atmospheric, dramatic, clear Thai game master narrator for werewolf party game',
                    },
                  },
                ],
              },
            ],
            config: {
              responseModalities: ['AUDIO'],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: chosenVoice },
                },
              },
            },
          });

          audioBase64 =
            geminiResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
          if (audioBase64) break;
        } catch (mErr: any) {
          const errMsg = String(mErr?.message || mErr);
          const isQuota = errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('quota');
          if (isQuota) {
            console.warn(`[Gemini TTS] Quota limit encountered on ${model}`);
            // Try next model if available, otherwise exit loop
          } else {
            console.warn(`[Gemini TTS] Notice from ${model}:`, errMsg.slice(0, 120));
          }
        }
      }

      if (!audioBase64) {
        // Return 200 with fallback: true so client seamlessly speaks via Web Speech API without UI error
        return res.json({
          ok: false,
          error: 'Gemini TTS unavailable or quota reached; falling back to device Web Speech',
          fallback: true,
        });
      }

      // Save to cache (evict oldest if full)
      if (ttsAudioCache.size >= MAX_TTS_CACHE_ENTRIES) {
        const oldestKey = ttsAudioCache.keys().next().value;
        if (oldestKey) ttsAudioCache.delete(oldestKey);
      }
      ttsAudioCache.set(cacheKey, audioBase64);

      return res.json({
        ok: true,
        audioBase64,
        format: 'audio/wav',
        cached: false,
        voice: chosenVoice,
      });
    } catch (err: any) {
      console.warn('[Gemini TTS] Fallback triggered:', err?.message?.slice?.(0, 100) || 'Unknown notice');
      return res.json({
        ok: false,
        error: 'Gemini TTS fallback',
        fallback: true,
      });
    }
  });

  io.on('connection', (socket: Socket) => {
    socket.on(
      'create_room',
      (
        payload: { playerName: string; playerToken?: string },
        callback?: (res: {
          ok: boolean;
          roomCode?: string;
          playerToken?: string;
          error?: string;
        }) => void
      ) => {
        const cleanName = (payload?.playerName || '').trim().slice(0, 20);
        if (!cleanName) {
          callback?.({ ok: false, error: 'กรุณาระบุชื่อผู้เล่นของคุณ' });
          return;
        }

        const roomCode = generateRoomCode();
        const playerToken = payload.playerToken || crypto.randomUUID();

        const hostPlayer: Player = {
          id: playerToken,
          socketId: socket.id,
          name: cleanName,
          isHost: true,
          isAlive: true,
          isSimulated: false,
          isConnected: true,
          role: null,
          hasActedNight: false,
          hasVoted: false,
          isReadyForNext: false,
          seerHistory: [],
          witchHealAvailable: false,
          witchPoisonAvailable: false,
          hunterTargetId: null,
        };

        const defaultTargetCount = 5;
        const recommended = getRecommendedRoleConfig(defaultTargetCount, 'BALANCED');

        const newRoom: RoomState = {
          roomCode,
          phase: 'LOBBY',
          dayCount: 0,
          targetPlayerCount: defaultTargetCount,
          roleConfig: recommended.config,
          recommendationNoteTh: recommended.recommendationNoteTh,
          activeNightSequence: buildActiveNightSequence(recommended.config),
          players: [hostPlayer],
          remainingSeconds: 0,
          totalSeconds: 0,
          nightKillTargetId: null,
          nightGuardTargetId: null,
          lastNightGuardTargetId: null,
          witchSavedTonight: false,
          witchPoisonTargetId: null,
          werewolfHasActed: false,
          bodyguardHasActed: false,
          seerHasActed: false,
          witchHasActed: false,
          lastNightVictims: [],
          wasSavedByProtection: false,
          lastExiledPlayer: null,
          votes: {},
          tiedCandidateIds: [],
          lastVoteBreakdown: [],
          winnerFaction: null,
          winReasonTh: null,
          logs: [],
          lastNarration: null,
          intervalRef: null,
          botTimeoutRefs: [],
        };

        rooms.set(roomCode, newRoom);
        socket.join(roomCode);
        socket.data.roomCode = roomCode;
        socket.data.playerToken = playerToken;

        addRoomLog(newRoom, `"${cleanName}" สร้างห้อง ${roomCode}`, 'SYSTEM');
        broadcastRoomState(io, newRoom);

        callback?.({ ok: true, roomCode, playerToken });
      }
    );

    socket.on(
      'join_room',
      (
        payload: { roomCode: string; playerName: string; playerToken?: string },
        callback?: (res: {
          ok: boolean;
          roomCode?: string;
          playerToken?: string;
          error?: string;
        }) => void
      ) => {
        const code = (payload?.roomCode || '').trim().toUpperCase();
        const cleanName = (payload?.playerName || '').trim().slice(0, 20);
        const room = rooms.get(code);

        if (!room) {
          callback?.({
            ok: false,
            error: `ไม่พบห้องรหัส "${code}" กรุณาตรวจสอบรหัสอีกครั้ง`,
          });
          return;
        }

        const incomingToken = payload.playerToken || crypto.randomUUID();
        const existingPlayer = room.players.find((p) => p.id === incomingToken);

        if (existingPlayer) {
          existingPlayer.socketId = socket.id;
          existingPlayer.isConnected = true;
          if (cleanName) existingPlayer.name = cleanName;
          socket.join(code);
          socket.data.roomCode = code;
          socket.data.playerToken = existingPlayer.id;

          broadcastRoomState(io, room);
          emitPrivatePlayerState(io, existingPlayer, room);
          callback?.({ ok: true, roomCode: code, playerToken: existingPlayer.id });
          return;
        }

        if (!cleanName) {
          callback?.({ ok: false, error: 'กรุณาระบุชื่อผู้เล่นของคุณ' });
          return;
        }

        if (room.phase !== 'LOBBY') {
          callback?.({
            ok: false,
            error: 'ห้องนี้เริ่มเกมไปแล้ว ไม่สามารถเข้าร่วมกลางคันได้',
          });
          return;
        }

        if (room.players.length >= room.targetPlayerCount) {
          const botIndex = room.players.findIndex((p) => p.isSimulated);
          if (botIndex !== -1) {
            room.players.splice(botIndex, 1);
          } else if (room.targetPlayerCount < 12) {
            // Automatically expand room capacity up to 12 when a real friend joins!
            room.targetPlayerCount += 1;
            room.roleConfig.VILLAGER = (room.roleConfig.VILLAGER || 0) + 1;
          } else {
            callback?.({
              ok: false,
              error: `ห้องนี้มีผู้เล่นเต็มจำนวน ${room.targetPlayerCount} คนแล้ว`,
            });
            return;
          }
        }

        let finalName = cleanName;
        let suffix = 2;
        while (room.players.some((p) => p.name === finalName)) {
          finalName = `${cleanName} (${suffix++})`;
        }

        const newPlayer: Player = {
          id: incomingToken,
          socketId: socket.id,
          name: finalName,
          isHost: room.players.length === 0,
          isAlive: true,
          isSimulated: false,
          isConnected: true,
          role: null,
          hasActedNight: false,
          hasVoted: false,
          isReadyForNext: false,
          seerHistory: [],
          witchHealAvailable: false,
          witchPoisonAvailable: false,
          hunterTargetId: null,
        };

        room.players.push(newPlayer);
        socket.join(code);
        socket.data.roomCode = code;
        socket.data.playerToken = incomingToken;

        addRoomLog(
          room,
          `"${finalName}" เข้าร่วมห้อง (${room.players.length}/${room.targetPlayerCount})`,
          'SYSTEM'
        );
        broadcastRoomState(io, room);

        callback?.({ ok: true, roomCode: code, playerToken: incomingToken });
      }
    );

    // Host configures player count, presets, or custom role counts
    socket.on(
      'update_room_settings',
      (
        payload: {
          targetPlayerCount?: number;
          preset?: 'BALANCED' | 'CHAOS' | 'SPECIAL';
          customRoleDelta?: { role: RoleType; delta: number };
        },
        callback?: (res: { ok: boolean; error?: string }) => void
      ) => {
        const room = rooms.get(socket.data.roomCode);
        if (!room || room.phase !== 'LOBBY') {
          callback?.({ ok: false, error: 'ตั้งค่าได้เฉพาะในห้องเตรียมตัวเท่านั้น' });
          return;
        }

        const sender = room.players.find((p) => p.id === socket.data.playerToken);
        if (!sender || !sender.isHost) {
          callback?.({
            ok: false,
            error: 'เฉพาะหัวหน้าห้องเท่านั้นที่ปรับตั้งค่าบทบาทได้',
          });
          return;
        }

        if (typeof payload.targetPlayerCount === 'number') {
          const nextCount = Math.max(4, Math.min(12, payload.targetPlayerCount));
          room.targetPlayerCount = nextCount;
          // Trim excess simulated bots if targetPlayerCount decreased
          while (
            room.players.length > room.targetPlayerCount &&
            room.players.some((p) => p.isSimulated)
          ) {
            const lastBotIdx = room.players
              .map((p) => p.isSimulated)
              .lastIndexOf(true);
            if (lastBotIdx !== -1) room.players.splice(lastBotIdx, 1);
          }
          const rec = getRecommendedRoleConfig(
            room.targetPlayerCount,
            payload.preset || 'BALANCED'
          );
          room.roleConfig = rec.config;
          room.recommendationNoteTh = rec.recommendationNoteTh;
        } else if (payload.preset) {
          const rec = getRecommendedRoleConfig(
            room.targetPlayerCount,
            payload.preset
          );
          room.roleConfig = rec.config;
          room.recommendationNoteTh = rec.recommendationNoteTh;
        } else if (payload.customRoleDelta) {
          const { role, delta } = payload.customRoleDelta;
          const currentVal = room.roleConfig[role] || 0;
          const nextVal = Math.max(0, Math.min(room.targetPlayerCount, currentVal + delta));
          room.roleConfig[role] = nextVal;
          room.recommendationNoteTh = 'กำหนดสัดส่วนบทบาทด้วยตนเองโดยหัวหน้าห้อง';
        }

        room.activeNightSequence = buildActiveNightSequence(room.roleConfig);
        broadcastRoomState(io, room);
        callback?.({ ok: true });
      }
    );

    socket.on(
      'manage_simulated_players',
      (
        payload: { action: 'ADD_ONE' | 'FILL_TO_TARGET' | 'CLEAR_ALL' },
        callback?: (res: { ok: boolean; error?: string }) => void
      ) => {
        const room = rooms.get(socket.data.roomCode);
        if (!room || room.phase !== 'LOBBY') {
          callback?.({
            ok: false,
            error: 'สามารถจัดการผู้เล่นจำลองได้เฉพาะในห้องเตรียมตัวเท่านั้น',
          });
          return;
        }

        const sender = room.players.find((p) => p.id === socket.data.playerToken);
        if (!sender || !sender.isHost) {
          callback?.({
            ok: false,
            error: 'เฉพาะหัวหน้าห้องเท่านั้นที่จัดการที่นั่งได้',
          });
          return;
        }

        if (payload.action === 'CLEAR_ALL') {
          room.players = room.players.filter((p) => !p.isSimulated);
        } else if (payload.action === 'ADD_ONE') {
          if (room.players.length < room.targetPlayerCount) {
            const usedNames = new Set(room.players.map((p) => p.name));
            const availableName =
              BOT_NAMES.find((n) => !usedNames.has(n)) ||
              `ชาวบ้านจำลอง ${room.players.length + 1}`;
            room.players.push({
              id: `sim-${crypto.randomUUID()}`,
              socketId: '',
              name: availableName,
              isHost: false,
              isAlive: true,
              isSimulated: true,
              isConnected: true,
              role: null,
              hasActedNight: false,
              hasVoted: false,
              isReadyForNext: true,
              seerHistory: [],
              witchHealAvailable: false,
              witchPoisonAvailable: false,
              hunterTargetId: null,
            });
          }
        } else if (payload.action === 'FILL_TO_TARGET') {
          while (room.players.length < room.targetPlayerCount) {
            const usedNames = new Set(room.players.map((p) => p.name));
            const availableName =
              BOT_NAMES.find((n) => !usedNames.has(n)) ||
              `ชาวบ้านจำลอง ${room.players.length + 1}`;
            room.players.push({
              id: `sim-${crypto.randomUUID()}`,
              socketId: '',
              name: availableName,
              isHost: false,
              isAlive: true,
              isSimulated: true,
              isConnected: true,
              role: null,
              hasActedNight: false,
              hasVoted: false,
              isReadyForNext: true,
              seerHistory: [],
              witchHealAvailable: false,
              witchPoisonAvailable: false,
              hunterTargetId: null,
            });
          }
        }

        broadcastRoomState(io, room);
        callback?.({ ok: true });
      }
    );

    socket.on(
      'start_game',
      (callback?: (res: { ok: boolean; error?: string }) => void) => {
        const room = rooms.get(socket.data.roomCode);
        if (!room) {
          callback?.({ ok: false, error: 'ไม่พบห้องเกม' });
          return;
        }

        const sender = room.players.find((p) => p.id === socket.data.playerToken);
        if (!sender || !sender.isHost) {
          callback?.({
            ok: false,
            error: 'เฉพาะผู้สร้างห้องเท่านั้นที่สามารถกดเริ่มเกมได้',
          });
          return;
        }

        if (room.players.length !== room.targetPlayerCount) {
          callback?.({
            ok: false,
            error: `จำนวนผู้เล่นในห้อง (${room.players.length} คน) ยังไม่ตรงกับจำนวนที่ตั้งไว้ (${room.targetPlayerCount} คน)`,
          });
          return;
        }

        const totalConfiguredRoles = getTotalRolesInConfig(room.roleConfig);
        if (totalConfiguredRoles !== room.targetPlayerCount) {
          callback?.({
            ok: false,
            error: `จำนวนโรลที่เลือกไว้ (${totalConfiguredRoles} โรล) ต้องเท่ากับจำนวนผู้เล่น (${room.targetPlayerCount} คน) พอดี`,
          });
          return;
        }

        if ((room.roleConfig.WEREWOLF || 0) < 1) {
          callback?.({
            ok: false,
            error: 'ต้องมีมนุษย์หมาป่าอย่างน้อย 1 คนในเกม',
          });
          return;
        }

        transitionToRoleReveal(io, room);
        callback?.({ ok: true });
      }
    );

    socket.on('ready_for_next_phase', () => {
      const room = rooms.get(socket.data.roomCode);
      if (!room) return;
      const sender = room.players.find((p) => p.id === socket.data.playerToken);
      if (!sender || !sender.isAlive) return;

      if (room.phase === 'NIGHT_SEER' && sender.role === 'SEER' && room.seerHasActed) {
        advanceToNextNightSubPhase(io, room, 'NIGHT_SEER');
        return;
      }

      sender.isReadyForNext = true;
      broadcastRoomState(io, room);

      const livingPlayers = room.players.filter((p) => p.isAlive);
      const allReady = livingPlayers.every((p) => p.isReadyForNext);

      if (allReady) {
        if (room.phase === 'ROLE_REVEAL') {
          transitionToNightWerewolf(io, room);
        } else if (room.phase === 'DAY_DISCUSSION') {
          transitionToVoting(io, room, false, []);
        }
      }
    });

    // Night Step 1: Werewolf Kill
    socket.on(
      'submit_kill_target',
      (
        payload: { targetId: string },
        callback?: (res: { ok: boolean; targetName?: string; error?: string }) => void
      ) => {
        const room = rooms.get(socket.data.roomCode);
        if (!room || room.phase !== 'NIGHT_WEREWOLF') {
          callback?.({ ok: false, error: 'ไม่อยู่ในช่วงเวลาล่าเหยื่อของมนุษย์หมาป่า' });
          return;
        }

        const sender = room.players.find((p) => p.id === socket.data.playerToken);
        if (!sender || !sender.isAlive || sender.role !== 'WEREWOLF') {
          callback?.({ ok: false, error: 'คุณไม่มีสิทธิ์สังหารในยามวิกาล' });
          return;
        }

        const target = room.players.find(
          (p) => p.id === payload?.targetId && p.isAlive
        );
        if (!target || target.id === sender.id) {
          callback?.({ ok: false, error: 'กรุณาเลือกผู้เล่นคนอื่นที่ยังมีชีวิตอยู่' });
          return;
        }

        room.nightKillTargetId = target.id;
        room.werewolfHasActed = true;
        sender.hasActedNight = true;

        emitPrivatePlayerState(io, sender, room);
        callback?.({ ok: true, targetName: target.name });

        const t = setTimeout(() => {
          if (room.phase === 'NIGHT_WEREWOLF') {
            advanceToNextNightSubPhase(io, room, 'NIGHT_WEREWOLF');
          }
        }, 2000);
        room.botTimeoutRefs.push(t);
      }
    );

    // Night Step 2: Bodyguard Protect
    socket.on(
      'submit_guard_target',
      (
        payload: { targetId: string },
        callback?: (res: { ok: boolean; targetName?: string; error?: string }) => void
      ) => {
        const room = rooms.get(socket.data.roomCode);
        if (!room || room.phase !== 'NIGHT_BODYGUARD') {
          callback?.({ ok: false, error: 'ไม่อยู่ในช่วงเวลาของบอดี้การ์ด' });
          return;
        }

        const sender = room.players.find((p) => p.id === socket.data.playerToken);
        if (!sender || !sender.isAlive || sender.role !== 'BODYGUARD') {
          callback?.({ ok: false, error: 'คุณไม่ใช่บอดี้การ์ดที่มีชีวิตอยู่' });
          return;
        }

        const target = room.players.find(
          (p) => p.id === payload?.targetId && p.isAlive
        );
        if (!target) {
          callback?.({ ok: false, error: 'ผู้เล่นเป้าหมายไม่ถูกต้อง' });
          return;
        }

        if (room.lastNightGuardTargetId && target.id === room.lastNightGuardTargetId) {
          callback?.({
            ok: false,
            error: 'กฎของบอดี้การ์ด: ห้ามปกป้องคนเดิมซ้ำ 2 คืนติดต่อกัน',
          });
          return;
        }

        room.nightGuardTargetId = target.id;
        room.bodyguardHasActed = true;
        sender.hasActedNight = true;

        emitPrivatePlayerState(io, sender, room);
        callback?.({ ok: true, targetName: target.name });

        const t = setTimeout(() => {
          if (room.phase === 'NIGHT_BODYGUARD') {
            advanceToNextNightSubPhase(io, room, 'NIGHT_BODYGUARD');
          }
        }, 2000);
        room.botTimeoutRefs.push(t);
      }
    );

    // Night Step 3: Seer Check
    socket.on(
      'submit_seer_target',
      (
        payload: { targetId: string },
        callback?: (res: {
          ok: boolean;
          result?: SeerInvestigationRecord;
          error?: string;
        }) => void
      ) => {
        const room = rooms.get(socket.data.roomCode);
        if (!room || room.phase !== 'NIGHT_SEER') {
          callback?.({ ok: false, error: 'ไม่อยู่ในช่วงเวลาของผู้หยั่งรู้' });
          return;
        }

        const sender = room.players.find((p) => p.id === socket.data.playerToken);
        if (!sender || !sender.isAlive || sender.role !== 'SEER') {
          callback?.({ ok: false, error: 'คุณไม่ใช่ผู้หยั่งรู้ที่มีชีวิตอยู่' });
          return;
        }

        if (room.seerHasActed || sender.hasActedNight) {
          callback?.({ ok: false, error: 'คุณได้ใช้เนตรหยั่งรู้ในคืนนี้ไปแล้ว' });
          return;
        }

        const target = room.players.find(
          (p) => p.id === payload?.targetId && p.isAlive
        );
        if (!target || target.id === sender.id) {
          callback?.({ ok: false, error: 'กรุณาเลือกผู้เล่นคนอื่นที่ยังมีชีวิตอยู่' });
          return;
        }

        room.seerHasActed = true;
        sender.hasActedNight = true;

        const record: SeerInvestigationRecord = {
          night: room.dayCount,
          targetId: target.id,
          targetName: target.name,
          isWerewolf: target.role === 'WEREWOLF',
          factionNameTh:
            target.role === 'WEREWOLF'
              ? 'มนุษย์หมาป่า (ฝ่ายรัตติกาล)'
              : 'ไม่ใช่หมาป่า (ฝ่ายชาวบ้าน)',
        };

        sender.seerHistory.unshift(record);

        socket.emit('seer_result', record);
        emitPrivatePlayerState(io, sender, room);
        callback?.({ ok: true, result: record });

        if (room.remainingSeconds > 5) {
          room.remainingSeconds = 5;
          io.to(room.roomCode).emit('timer_tick', {
            remainingSeconds: room.remainingSeconds,
            totalSeconds: room.totalSeconds,
            phase: room.phase,
          });
        }
      }
    );

    // Night Step 4: Witch Action (Heal, Poison, or Skip)
    socket.on(
      'submit_witch_action',
      (
        payload: { action: 'HEAL' | 'POISON' | 'SKIP'; targetId?: string },
        callback?: (res: { ok: boolean; messageTh?: string; error?: string }) => void
      ) => {
        const room = rooms.get(socket.data.roomCode);
        if (!room || room.phase !== 'NIGHT_WITCH') {
          callback?.({ ok: false, error: 'ไม่อยู่ในช่วงเวลาของแม่มด' });
          return;
        }

        const sender = room.players.find((p) => p.id === socket.data.playerToken);
        if (!sender || !sender.isAlive || sender.role !== 'WITCH') {
          callback?.({ ok: false, error: 'คุณไม่ใช่แม่มดที่มีชีวิตอยู่' });
          return;
        }

        if (room.witchHasActed || sender.hasActedNight) {
          callback?.({ ok: false, error: 'คุณได้ตัดสินใจในคืนนี้ไปแล้ว' });
          return;
        }

        if (payload.action === 'HEAL') {
          if (!sender.witchHealAvailable) {
            callback?.({ ok: false, error: 'คุณใช้ยาชุบชีวิตหมดไปแล้ว' });
            return;
          }
          room.witchSavedTonight = true;
          sender.witchHealAvailable = false;
          room.witchHasActed = true;
          sender.hasActedNight = true;
          emitPrivatePlayerState(io, sender, room);
          callback?.({ ok: true, messageTh: 'ใช้ยาชุบชีวิตช่วยเหลือเหยื่อสำเร็จ!' });
        } else if (payload.action === 'POISON') {
          if (!sender.witchPoisonAvailable) {
            callback?.({ ok: false, error: 'คุณใช้ยาพิษหมดไปแล้ว' });
            return;
          }
          const target = room.players.find(
            (p) => p.id === payload.targetId && p.isAlive && p.id !== sender.id
          );
          if (!target) {
            callback?.({ ok: false, error: 'กรุณาเลือกผู้เล่นเป้าหมายที่จะวางยาพิษ' });
            return;
          }
          room.witchPoisonTargetId = target.id;
          sender.witchPoisonAvailable = false;
          room.witchHasActed = true;
          sender.hasActedNight = true;
          emitPrivatePlayerState(io, sender, room);
          callback?.({
            ok: true,
            messageTh: `วางยาพิษสังหาร ${target.name} เรียบร้อยแล้ว`,
          });
        } else {
          room.witchHasActed = true;
          sender.hasActedNight = true;
          emitPrivatePlayerState(io, sender, room);
          callback?.({ ok: true, messageTh: 'เลือกเก็บน้ำยาวิเศษไว้ใช้ในคืนถัดไป' });
        }

        const t = setTimeout(() => {
          if (room.phase === 'NIGHT_WITCH') {
            advanceToNextNightSubPhase(io, room, 'NIGHT_WITCH');
          }
        }, 2000);
        room.botTimeoutRefs.push(t);
      }
    );

    // Hunter Pre-Aim Target (Can be set anytime while alive)
    socket.on(
      'submit_hunter_target',
      (
        payload: { targetId: string | null },
        callback?: (res: { ok: boolean; targetName?: string; error?: string }) => void
      ) => {
        const room = rooms.get(socket.data.roomCode);
        if (!room) return;
        const sender = room.players.find((p) => p.id === socket.data.playerToken);
        if (!sender || !sender.isAlive || sender.role !== 'HUNTER') {
          callback?.({ ok: false, error: 'คุณไม่ใช่นายพรานที่มีชีวิตอยู่' });
          return;
        }

        if (!payload.targetId) {
          sender.hunterTargetId = null;
          emitPrivatePlayerState(io, sender, room);
          callback?.({ ok: true, targetName: 'ลดปืนลง (ไม่ยิงใคร)' });
          return;
        }

        const target = room.players.find(
          (p) => p.id === payload.targetId && p.isAlive && p.id !== sender.id
        );
        if (!target) {
          callback?.({ ok: false, error: 'เป้าหมายไม่ถูกต้อง' });
          return;
        }

        sender.hunterTargetId = target.id;
        emitPrivatePlayerState(io, sender, room);
        callback?.({ ok: true, targetName: target.name });
      }
    );

    socket.on(
      'submit_vote',
      (
        payload: { targetId: string },
        callback?: (res: { ok: boolean; targetName?: string; error?: string }) => void
      ) => {
        const room = rooms.get(socket.data.roomCode);
        if (!room || (room.phase !== 'VOTING' && room.phase !== 'REVOTE')) {
          callback?.({ ok: false, error: 'ไม่อยู่ในช่วงเวลาลงคะแนนโหวต' });
          return;
        }

        const voter = room.players.find((p) => p.id === socket.data.playerToken);
        if (!voter || !voter.isAlive) {
          callback?.({
            ok: false,
            error: 'ผู้ที่เสียชีวิตแล้วไม่สามารถออกเสียงโหวตได้',
          });
          return;
        }

        if (payload?.targetId === voter.id) {
          callback?.({
            ok: false,
            error: 'กฎเหล็กหมู่บ้าน: ห้ามโหวตตัวเองโดยเด็ดขาด',
          });
          return;
        }

        const candidate = room.players.find(
          (p) => p.id === payload?.targetId && p.isAlive
        );
        if (!candidate) {
          callback?.({ ok: false, error: 'ผู้ต้องสงสัยไม่ถูกต้องหรือเสียชีวิตแล้ว' });
          return;
        }

        if (
          room.phase === 'REVOTE' &&
          room.tiedCandidateIds.length > 0 &&
          !room.tiedCandidateIds.includes(candidate.id)
        ) {
          callback?.({
            ok: false,
            error:
              'ในการโหวตตัดเชือก ต้องเลือกโหวตเฉพาะผู้ที่มีคะแนนสูงสุดเท่ากันเท่านั้น',
          });
          return;
        }

        room.votes[voter.id] = candidate.id;
        voter.hasVoted = true;

        emitPrivatePlayerState(io, voter, room);
        broadcastRoomState(io, room);
        callback?.({ ok: true, targetName: candidate.name });

        checkAllVoted(io, room);
      }
    );

    socket.on(
      'restart_lobby',
      (callback?: (res: { ok: boolean; error?: string }) => void) => {
        const room = rooms.get(socket.data.roomCode);
        if (!room) {
          callback?.({ ok: false, error: 'ไม่พบห้องเกม' });
          return;
        }

        clearRoomTimers(room);
        room.phase = 'LOBBY';
        room.dayCount = 0;
        room.remainingSeconds = 0;
        room.totalSeconds = 0;
        room.nightKillTargetId = null;
        room.nightGuardTargetId = null;
        room.lastNightGuardTargetId = null;
        room.witchSavedTonight = false;
        room.witchPoisonTargetId = null;
        room.werewolfHasActed = false;
        room.bodyguardHasActed = false;
        room.seerHasActed = false;
        room.witchHasActed = false;
        room.lastNightVictims = [];
        room.wasSavedByProtection = false;
        room.lastExiledPlayer = null;
        room.votes = {};
        room.tiedCandidateIds = [];
        room.lastVoteBreakdown = [];
        room.winnerFaction = null;
        room.winReasonTh = null;

        room.players = room.players.filter((p) => p.isConnected || p.isSimulated);
        for (const p of room.players) {
          p.role = null;
          p.isAlive = true;
          p.hasActedNight = false;
          p.hasVoted = false;
          p.isReadyForNext = p.isSimulated;
          p.seerHistory = [];
          p.witchHealAvailable = false;
          p.witchPoisonAvailable = false;
          p.hunterTargetId = null;
        }

        if (room.players.length > 0 && !room.players.some((p) => p.isHost)) {
          const firstHuman =
            room.players.find((p) => !p.isSimulated) || room.players[0];
          firstHuman.isHost = true;
        }

        addRoomLog(
          room,
          'กลับสู่ห้องเตรียมตัว เตรียมพร้อมสำหรับศึกครั้งใหม่',
          'SYSTEM'
        );
        broadcastRoomState(io, room);
        callback?.({ ok: true });
      }
    );

    socket.on('leave_room', () => {
      handleSocketLeave(io, socket, true);
    });

    socket.on('disconnect', () => {
      handleSocketLeave(io, socket, false);
    });
  });

  function handleSocketLeave(io: Server, socket: Socket, explicitLeave: boolean) {
    const code = socket.data.roomCode;
    const token = socket.data.playerToken;
    if (!code || !token) return;

    const room = rooms.get(code);
    if (!room) return;

    const playerIdx = room.players.findIndex((p) => p.id === token);
    if (playerIdx === -1) return;

    const player = room.players[playerIdx];

    if (room.phase === 'LOBBY' || explicitLeave) {
      room.players.splice(playerIdx, 1);
      socket.leave(code);

      const remainingHumans = room.players.filter((p) => !p.isSimulated);
      if (remainingHumans.length === 0) {
        clearRoomTimers(room);
        rooms.delete(code);
        return;
      }

      if (player.isHost) {
        remainingHumans[0].isHost = true;
      }
      broadcastRoomState(io, room);
    } else {
      player.isConnected = false;
      broadcastRoomState(io, room);
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(
      `🌕 Moonwolf (จันทราหมาป่า) Server listening on http://0.0.0.0:${PORT}`
    );
  });
}

startServer();
