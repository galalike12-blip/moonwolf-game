import {
  BookOpen,
  Check,
  Crosshair,
  Crown,
  Eye,
  EyeOff,
  Flame,
  FlaskConical,
  LogOut,
  Mic,
  Minus,
  Moon,
  Plus,
  QrCode,
  RefreshCw,
  Shield,
  ShieldAlert,
  Skull,
  Sparkles,
  Sun,
  UserPlus,
  Users,
  Volume2,
  VolumeX,
  Vote,
  Wand2,
} from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { soundEngine } from './audio/soundEngine';
import { GeminiVoiceModal } from './components/GeminiVoiceModal';
import { RulesAndDeployModal } from './components/GameModals';
import { LobbyRoleDeckBuilder } from './components/LobbyRoleDeckBuilder';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { InlineRoomQrCode, QrScannerModal } from './components/QrCodeTools';
import {
  FactionType,
  PrivateRoleData,
  RoleTarotCard,
  RoleType,
} from './components/RoleTarotCard';
import { ROLE_CARD_THEMES, RoleCharacterArt } from './components/RoleIllustration';

type GamePhase =
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

type NightSubPhase =
  | 'NIGHT_WEREWOLF'
  | 'NIGHT_BODYGUARD'
  | 'NIGHT_SEER'
  | 'NIGHT_WITCH';

type RoleConfigMap = Record<RoleType, number>;

interface PublicPlayer {
  id: string;
  name: string;
  isHost: boolean;
  isAlive: boolean;
  isSimulated: boolean;
  isConnected: boolean;
  hasVoted: boolean;
  isReadyForNext: boolean;
  revealedRole?: RoleType;
  revealedRoleNameTh?: string;
  revealedFaction?: FactionType;
}

interface SeerInvestigationRecord {
  night: number;
  targetId: string;
  targetName: string;
  isWerewolf: boolean;
  factionNameTh: string;
}

interface VoteTallyItem {
  candidateId: string;
  candidateName: string;
  votes: number;
  voterNames: string[];
}

interface GameLogEntry {
  id: string;
  day: number;
  phase: GamePhase;
  message: string;
  timestamp: number;
  type: 'NIGHT_KILL' | 'DAWN_SAFE' | 'VOTE_EXILE' | 'VOTE_TIE' | 'SYSTEM' | 'VICTORY';
}

interface RoomStatePayload {
  roomCode: string;
  phase: GamePhase;
  dayCount: number;
  targetPlayerCount: number;
  roleConfig: RoleConfigMap;
  recommendationNoteTh: string;
  activeNightSequence: NightSubPhase[];
  remainingSeconds: number;
  totalSeconds: number;
  lastNightVictim: { id: string; name: string; reasonTh?: string } | null;
  lastNightVictims: { id: string; name: string; reasonTh: string }[];
  wasSavedByBodyguard?: boolean;
  lastExiledPlayer: { id: string; name: string } | null;
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
  players: PublicPlayer[];
}

interface ExtendedPrivateRoleData extends PrivateRoleData {
  seerHistory?: SeerInvestigationRecord[];
}

interface RoleCatalogItem {
  role: RoleType;
  nameTh: string;
  nameEn: string;
  faction: FactionType;
  factionLabelTh: string;
  shortDesc: string;
  badgeClass: string;
}

const ROLE_CATALOG: RoleCatalogItem[] = [
  {
    role: 'WEREWOLF',
    nameTh: 'มนุษย์หมาป่า',
    nameEn: 'Werewolf',
    faction: 'WEREWOLF',
    factionLabelTh: 'ฝ่ายรัตติกาล',
    shortDesc: 'ตื่นช่วงแรกเพื่อเลือกสังหารเหยื่อคืนละ 1 คน',
    badgeClass: 'border-rose-500/40 bg-rose-950/30 text-rose-300',
  },
  {
    role: 'MINION',
    nameTh: 'ลูกสมุนหมาป่า',
    nameEn: 'Minion',
    faction: 'WEREWOLF',
    factionLabelTh: 'ฝ่ายรัตติกาล',
    shortDesc: 'รู้ตัวหมาป่าตั้งแต่เริ่มเกม แม่หมอส่องเห็นเป็นชาวบ้าน',
    badgeClass: 'border-rose-500/30 bg-rose-950/20 text-rose-200',
  },
  {
    role: 'BODYGUARD',
    nameTh: 'บอดี้การ์ด',
    nameEn: 'Bodyguard',
    faction: 'VILLAGER',
    factionLabelTh: 'ฝ่ายชาวบ้าน',
    shortDesc: 'กางโล่คุ้มกันผู้เล่นคืนละ 1 คน (ห้ามซ้ำคนเดิม 2 คืนติด)',
    badgeClass: 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300',
  },
  {
    role: 'SEER',
    nameTh: 'ผู้หยั่งรู้ (แม่หมอ)',
    nameEn: 'Seer',
    faction: 'VILLAGER',
    factionLabelTh: 'ฝ่ายชาวบ้าน',
    shortDesc: 'ตรวจสอบผู้ต้องสงสัยคืนละ 1 คนว่าเป็นหมาป่าหรือไม่',
    badgeClass: 'border-amber-500/40 bg-amber-950/30 text-amber-300',
  },
  {
    role: 'WITCH',
    nameTh: 'แม่มด',
    nameEn: 'Witch',
    faction: 'VILLAGER',
    factionLabelTh: 'ฝ่ายชาวบ้าน',
    shortDesc: 'มียาชุบชีวิต 1 ขวด และยาพิษสังหาร 1 ขวดตลอดเกม',
    badgeClass: 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300',
  },
  {
    role: 'HUNTER',
    nameTh: 'นายพราน',
    nameEn: 'Hunter',
    faction: 'VILLAGER',
    factionLabelTh: 'ฝ่ายชาวบ้าน',
    shortDesc: 'ล็อกเป้าปืนไว้ หากถูกฆ่าหรือถูกโหวตจะยิงเป้าหมายตายตามทันที',
    badgeClass: 'border-teal-500/40 bg-teal-950/30 text-teal-300',
  },
  {
    role: 'FOOL',
    nameTh: 'คนบ้า (โจ๊กเกอร์)',
    nameEn: 'Fool',
    faction: 'NEUTRAL',
    factionLabelTh: 'ฝ่ายอิสระ',
    shortDesc: 'ชนะเดี่ยวทันทีหากหลอกให้หมู่บ้านโหวตประหารตัวเองสำเร็จ',
    badgeClass: 'border-amber-500/40 bg-amber-950/30 text-amber-300',
  },
  {
    role: 'VILLAGER',
    nameTh: 'ชาวบ้าน',
    nameEn: 'Villager',
    faction: 'VILLAGER',
    factionLabelTh: 'ฝ่ายชาวบ้าน',
    shortDesc: 'ชาวบ้านผู้บริสุทธิ์ ใช้ตรรกะและเสียงโหวตตามล่าหมาป่า',
    badgeClass: 'border-sky-500/40 bg-sky-950/30 text-sky-300',
  },
];

const PHASE_LABELS_TH: Record<GamePhase, string> = {
  LOBBY: 'ห้องเตรียมตัว (Lobby)',
  ROLE_REVEAL: 'เปิดไพ่บทบาทลับ',
  NIGHT_WEREWOLF: 'ยามราตรี · ตาหมาป่าออกล่า',
  NIGHT_BODYGUARD: 'ยามราตรี · ตาบอดี้การ์ดคุ้มกัน',
  NIGHT_SEER: 'ยามราตรี · ตาผู้หยั่งรู้ตรวจสอบ',
  NIGHT_WITCH: 'ยามราตรี · ตาแม่มดปรุงยา',
  DAY_DISCUSSION: 'รุ่งอรุณ & อภิปราย',
  VOTING: 'ลงคะแนนโหวตขับไล่',
  REVOTE: 'โหวตตัดเชือก (Revote)',
  VOTE_RESULT: 'สรุปผลการโหวต',
  GAME_OVER: 'สิ้นสุดการแข่งขัน',
};

const NIGHT_SUBPHASE_META: Record<
  NightSubPhase,
  { shortLabel: string; activeColor: string }
> = {
  NIGHT_WEREWOLF: {
    shortLabel: 'หมาป่าล่าเหยื่อ',
    activeColor: 'bg-rose-950/60 border-rose-500/60 text-rose-200',
  },
  NIGHT_BODYGUARD: {
    shortLabel: 'บอดี้การ์ดคุ้มกัน',
    activeColor: 'bg-emerald-950/60 border-emerald-500/60 text-emerald-200',
  },
  NIGHT_SEER: {
    shortLabel: 'แม่หมอตรวจสอบ',
    activeColor: 'bg-amber-950/60 border-amber-500/60 text-amber-200',
  },
  NIGHT_WITCH: {
    shortLabel: 'แม่มดใช้น้ำยา',
    activeColor: 'bg-emerald-950/60 border-emerald-500/60 text-emerald-200',
  },
};

export default function App() {
  const socketRef = useRef<Socket | null>(null);

  const [playerToken, setPlayerToken] = useState<string>(() => {
    return sessionStorage.getItem('moonwolf_player_token') || '';
  });
  const [playerName, setPlayerName] = useState<string>(() => {
    return sessionStorage.getItem('moonwolf_player_name') || '';
  });
  const [joinRoomInput, setJoinRoomInput] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const roomParam = params.get('room');
      if (roomParam) return roomParam.toUpperCase();
    }
    return sessionStorage.getItem('moonwolf_room_code') || '';
  });

  const [roomState, setRoomState] = useState<RoomStatePayload | null>(null);
  const [myRole, setMyRole] = useState<ExtendedPrivateRoleData | null>(null);
  const [latestSeerResult, setLatestSeerResult] =
    useState<SeerInvestigationRecord | null>(null);

  const [isCardFlipped, setIsCardFlipped] = useState<boolean>(false);
  const [selectedNightTargetId, setSelectedNightTargetId] = useState<string | null>(
    null
  );
  const [confirmedNightTargetName, setConfirmedNightTargetName] = useState<
    string | null
  >(null);
  const [confirmedGuardTargetName, setConfirmedGuardTargetName] = useState<
    string | null
  >(null);
  const [confirmedWitchMessage, setConfirmedWitchMessage] = useState<string | null>(
    null
  );
  const [selectedVoteTargetId, setSelectedVoteTargetId] = useState<string | null>(
    null
  );
  const [showSeerNotebook, setShowSeerNotebook] = useState<boolean>(false);
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState<boolean>(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isGmSpeaking, setIsGmSpeaking] = useState<boolean>(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    soundEngine.onSpeakingStateChange((speaking) => {
      setIsGmSpeaking(speaking);
    });

    const socket = io({
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      const savedRoom = sessionStorage.getItem('moonwolf_room_code');
      const savedToken = sessionStorage.getItem('moonwolf_player_token');
      const savedName = sessionStorage.getItem('moonwolf_player_name');
      if (savedRoom && savedToken && savedName) {
        socket.emit(
          'join_room',
          {
            roomCode: savedRoom,
            playerName: savedName,
            playerToken: savedToken,
          },
          (res: { ok: boolean; roomCode?: string; playerToken?: string }) => {
            if (!res?.ok) {
              sessionStorage.removeItem('moonwolf_room_code');
            }
          }
        );
      }
    });

    socket.on('room_state_update', (state: RoomStatePayload) => {
      setRoomState((prev) => {
        if (prev?.phase !== state.phase) {
          setSelectedNightTargetId(null);
          if (state.phase === 'NIGHT_WEREWOLF') {
            setConfirmedNightTargetName(null);
            setConfirmedGuardTargetName(null);
            setConfirmedWitchMessage(null);
            setLatestSeerResult(null);
          }
          if (state.phase === 'VOTING' || state.phase === 'REVOTE') {
            setSelectedVoteTargetId(null);
          }
          if (state.phase === 'LOBBY') {
            setMyRole(null);
            setIsCardFlipped(false);
            setLatestSeerResult(null);
            setConfirmedNightTargetName(null);
            setConfirmedGuardTargetName(null);
            setConfirmedWitchMessage(null);
            setSelectedVoteTargetId(null);
          }
        }
        return state;
      });
    });

    socket.on('private_role', (rolePayload: ExtendedPrivateRoleData) => {
      setMyRole(rolePayload);
      if (rolePayload.seerHistory && rolePayload.seerHistory.length > 0) {
        setLatestSeerResult(rolePayload.seerHistory[0]);
      }
    });

    socket.on('seer_result', (record: SeerInvestigationRecord) => {
      setLatestSeerResult(record);
      soundEngine.playBellChime();
    });

    socket.on(
      'gm_narration',
      (narration: {
        text: string;
        soundEffect: 'HOWL' | 'BELL' | 'GAVEL' | 'VICTORY' | 'NONE';
        phase: GamePhase;
        audioId?: string;
      }) => {
        if (narration.soundEffect === 'HOWL') {
          soundEngine.playHowl();
        } else if (narration.soundEffect === 'BELL') {
          soundEngine.playBellChime();
        } else if (narration.soundEffect === 'GAVEL') {
          soundEngine.playGavelHit();
        } else if (narration.soundEffect === 'VICTORY') {
          soundEngine.playVictoryFanfare('VILLAGER');
        }

        setTimeout(() => {
          soundEngine.speakThaiGM(narration.text, narration.audioId);
        }, 300);
      }
    );

    socket.on(
      'timer_tick',
      (tick: {
        remainingSeconds: number;
        totalSeconds: number;
        phase: GamePhase;
      }) => {
        setRoomState((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            remainingSeconds: tick.remainingSeconds,
            totalSeconds: tick.totalSeconds,
          };
        });
        if (tick.remainingSeconds > 0 && tick.remainingSeconds <= 5) {
          soundEngine.playTick(tick.remainingSeconds <= 3);
        }
      }
    );

    return () => {
      socket.disconnect();
    };
  }, []);

  const me = useMemo(() => {
    if (!roomState || !playerToken) return null;
    return roomState.players.find((p) => p.id === playerToken) || null;
  }, [roomState, playerToken]);

  const livingPlayers = useMemo(() => {
    return roomState?.players.filter((p) => p.isAlive) || [];
  }, [roomState]);

  const totalConfiguredRoles = useMemo(() => {
    if (!roomState?.roleConfig) return 0;
    return Object.values(roomState.roleConfig).reduce(
      (sum, count) => sum + (count || 0),
      0
    );
  }, [roomState?.roleConfig]);

  const showError = (msg: string) => {
    setErrorBanner(msg);
    setTimeout(() => {
      setErrorBanner((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  const handleToggleMute = () => {
    soundEngine.unlockAudioAndSpeech();
    const nextMuted = !soundEngine.isMuted;
    soundEngine.isMuted = nextMuted;
    if (nextMuted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsMuted(nextMuted);
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    soundEngine.unlockAudioAndSpeech();
    const clean = playerName.trim();
    if (!clean) {
      showError('กรุณากรอกชื่อเล่นของคุณก่อนสร้างห้อง');
      return;
    }

    setIsSubmitting(true);
    socketRef.current?.emit(
      'create_room',
      { playerName: clean, playerToken: playerToken || undefined },
      (res: {
        ok: boolean;
        roomCode?: string;
        playerToken?: string;
        error?: string;
      }) => {
        setIsSubmitting(false);
        if (!res.ok || !res.roomCode || !res.playerToken) {
          showError(res.error || 'ไม่สามารถสร้างห้องได้');
          return;
        }
        sessionStorage.setItem('moonwolf_player_name', clean);
        sessionStorage.setItem('moonwolf_room_code', res.roomCode);
        sessionStorage.setItem('moonwolf_player_token', res.playerToken);
        setPlayerToken(res.playerToken);
        setJoinRoomInput(res.roomCode);
      }
    );
  };

  const handleJoinRoom = (codeToJoin?: string) => {
    soundEngine.unlockAudioAndSpeech();
    const cleanName = playerName.trim();
    const cleanCode = (codeToJoin ?? joinRoomInput).trim().toUpperCase();

    if (!cleanName) {
      showError('กรุณากรอกชื่อเล่นของคุณก่อนเข้าร่วมห้อง');
      return;
    }
    if (!cleanCode) {
      showError('กรุณากรอกรหัสห้อง 6 หลัก หรือสแกน QR Code');
      return;
    }

    setIsSubmitting(true);
    socketRef.current?.emit(
      'join_room',
      {
        roomCode: cleanCode,
        playerName: cleanName,
        playerToken: playerToken || undefined,
      },
      (res: {
        ok: boolean;
        roomCode?: string;
        playerToken?: string;
        error?: string;
      }) => {
        setIsSubmitting(false);
        if (!res.ok || !res.roomCode || !res.playerToken) {
          showError(res.error || 'ไม่สามารถเข้าร่วมห้องได้');
          return;
        }
        sessionStorage.setItem('moonwolf_player_name', cleanName);
        sessionStorage.setItem('moonwolf_room_code', res.roomCode);
        sessionStorage.setItem('moonwolf_player_token', res.playerToken);
        setPlayerToken(res.playerToken);
        setJoinRoomInput(res.roomCode);

        if (window.location.search.includes('room=')) {
          window.history.replaceState({}, '', window.location.pathname);
        }
      }
    );
  };

  const handleLeaveRoom = () => {
    socketRef.current?.emit('leave_room');
    sessionStorage.removeItem('moonwolf_room_code');
    setRoomState(null);
    setMyRole(null);
  };

  const handleUpdateRoomSettings = (payload: {
    targetPlayerCount?: number;
    preset?: 'BALANCED' | 'CHAOS' | 'SPECIAL';
    customRoleDelta?: { role: RoleType; delta: number };
  }) => {
    soundEngine.unlockAudioAndSpeech();
    socketRef.current?.emit(
      'update_room_settings',
      payload,
      (res: { ok: boolean; error?: string }) => {
        if (!res?.ok && res?.error) {
          showError(res.error);
        }
      }
    );
  };

  const handleAutoBalanceVillagers = () => {
    if (!roomState) return;
    const diff = roomState.targetPlayerCount - totalConfiguredRoles;
    if (diff === 0) return;
    handleUpdateRoomSettings({
      customRoleDelta: { role: 'VILLAGER', delta: diff },
    });
  };

  const handleManageBots = (action: 'ADD_ONE' | 'FILL_TO_TARGET' | 'CLEAR_ALL') => {
    soundEngine.unlockAudioAndSpeech();
    socketRef.current?.emit(
      'manage_simulated_players',
      { action },
      (res: { ok: boolean; error?: string }) => {
        if (!res?.ok && res?.error) {
          showError(res.error);
        }
      }
    );
  };

  const handleStartGame = () => {
    soundEngine.unlockAudioAndSpeech();
    socketRef.current?.emit(
      'start_game',
      (res: { ok: boolean; error?: string }) => {
        if (!res?.ok && res?.error) {
          showError(res.error);
        }
      }
    );
  };

  const handleReadyForNextPhase = () => {
    soundEngine.unlockAudioAndSpeech();
    socketRef.current?.emit('ready_for_next_phase');
  };

  const handleSubmitNightKill = () => {
    if (!selectedNightTargetId) return;
    soundEngine.unlockAudioAndSpeech();
    socketRef.current?.emit(
      'submit_kill_target',
      { targetId: selectedNightTargetId },
      (res: { ok: boolean; targetName?: string; error?: string }) => {
        if (!res.ok) {
          showError(res.error || 'ไม่สามารถเลือกเป้าหมายได้');
          return;
        }
        setConfirmedNightTargetName(res.targetName || '');
      }
    );
  };

  const handleSubmitBodyguardTarget = () => {
    if (!selectedNightTargetId) return;
    soundEngine.unlockAudioAndSpeech();
    socketRef.current?.emit(
      'submit_guard_target',
      { targetId: selectedNightTargetId },
      (res: { ok: boolean; targetName?: string; error?: string }) => {
        if (!res.ok) {
          showError(res.error || 'ไม่สามารถเลือกผู้เล่นเพื่อคุ้มกันได้');
          return;
        }
        setConfirmedGuardTargetName(res.targetName || '');
      }
    );
  };

  const handleSubmitSeerCheck = () => {
    if (!selectedNightTargetId) return;
    soundEngine.unlockAudioAndSpeech();
    socketRef.current?.emit(
      'submit_seer_target',
      { targetId: selectedNightTargetId },
      (res: {
        ok: boolean;
        result?: SeerInvestigationRecord;
        error?: string;
      }) => {
        if (!res.ok) {
          showError(res.error || 'ไม่สามารถตรวจสอบผู้เล่นได้');
          return;
        }
        if (res.result) {
          setLatestSeerResult(res.result);
        }
      }
    );
  };

  const handleSubmitWitchAction = (
    action: 'HEAL' | 'POISON' | 'SKIP',
    targetId?: string
  ) => {
    soundEngine.unlockAudioAndSpeech();
    socketRef.current?.emit(
      'submit_witch_action',
      { action, targetId },
      (res: { ok: boolean; messageTh?: string; error?: string }) => {
        if (!res.ok) {
          showError(res.error || 'ไม่สามารถใช้น้ำยาวิเศษได้');
          return;
        }
        setConfirmedWitchMessage(res.messageTh || 'ดำเนินการสำเร็จ');
      }
    );
  };

  const handleSelectHunterTarget = (targetId: string | null) => {
    soundEngine.unlockAudioAndSpeech();
    socketRef.current?.emit(
      'submit_hunter_target',
      { targetId },
      (res: { ok: boolean; targetName?: string; error?: string }) => {
        if (!res.ok && res.error) {
          showError(res.error);
        }
      }
    );
  };

  const handleSubmitVote = () => {
    if (!selectedVoteTargetId) return;
    soundEngine.unlockAudioAndSpeech();
    socketRef.current?.emit(
      'submit_vote',
      { targetId: selectedVoteTargetId },
      (res: { ok: boolean; targetName?: string; error?: string }) => {
        if (!res.ok) {
          showError(res.error || 'ไม่สามารถส่งคะแนนโหวตได้');
        }
      }
    );
  };

  const handleRestartLobby = () => {
    soundEngine.unlockAudioAndSpeech();
    socketRef.current?.emit(
      'restart_lobby',
      (res: { ok: boolean; error?: string }) => {
        if (!res.ok && res.error) {
          showError(res.error);
        }
      }
    );
  };

  const timerPercentage = useMemo(() => {
    if (!roomState || roomState.totalSeconds <= 0) return 0;
    return Math.max(
      0,
      Math.min(100, (roomState.remainingSeconds / roomState.totalSeconds) * 100)
    );
  }, [roomState]);

  const isNightPhase =
    roomState?.phase === 'NIGHT_WEREWOLF' ||
    roomState?.phase === 'NIGHT_BODYGUARD' ||
    roomState?.phase === 'NIGHT_SEER' ||
    roomState?.phase === 'NIGHT_WITCH';

  return (
    <div className="min-h-dvh w-full bg-[#101216] text-[#f1f3f5] flex flex-col justify-between relative overflow-x-hidden select-none tabletop-surface">
      {/* Ambient Board Game Tabletop Lighting */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div
          className={`absolute -top-28 left-1/2 -translate-x-1/2 w-[520px] h-[520px] rounded-full blur-[130px] transition-colors duration-1000 ${
            roomState?.phase === 'NIGHT_WEREWOLF'
              ? 'bg-rose-900/15'
              : roomState?.phase === 'NIGHT_BODYGUARD'
              ? 'bg-emerald-900/15'
              : roomState?.phase === 'NIGHT_SEER'
              ? 'bg-amber-600/12'
              : roomState?.phase === 'NIGHT_WITCH'
              ? 'bg-emerald-600/12'
              : roomState?.phase === 'DAY_DISCUSSION'
              ? 'bg-amber-500/10'
              : 'bg-zinc-800/15'
          }`}
        />
      </div>

      {/* Top Navigation & Automated GM Status Bar (Comic Charcoal Board Game Aesthetic) */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-[#14161c]/95 border-b-2 border-zinc-800 px-4 py-2.5">
        <div className="max-w-md mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center text-amber-400 cartoon-btn-shadow">
              <Moon className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-black tracking-wider text-sm text-white">
                  MOONWOLF
                </span>
                {roomState && (
                  <span className="text-[11px] font-mono-num font-bold px-2 py-0.5 rounded-md bg-zinc-800 text-amber-400 border border-zinc-700">
                    #{roomState.roomCode}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-400 truncate max-w-[160px]">
                {roomState
                  ? PHASE_LABELS_TH[roomState.phase]
                  : 'จันทราหมาป่า · โซเชียลดีดักชัน 4–12 คน'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {isGmSpeaking && (
              <div
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[11px] font-bold"
                title="ผู้ดำเนินเกมอัตโนมัติกำลังบรรยาย"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                <span>GM</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleToggleMute}
              className="min-h-[40px] min-w-[40px] rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 flex items-center justify-center text-zinc-300 cartoon-btn-shadow transition-transform active:scale-95"
              aria-label={isMuted ? 'เปิดเสียงผู้ดำเนินเกม' : 'ปิดเสียงผู้ดำเนินเกม'}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-amber-400" />
              )}
            </button>

            {/* Google Gemini AI GM Voice Config Button */}
            <button
              type="button"
              onClick={() => {
                soundEngine.unlockAudioAndSpeech();
                setIsVoiceModalOpen(true);
              }}
              className="min-h-[40px] px-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 flex items-center gap-1.5 text-zinc-300 hover:text-zinc-100 cartoon-btn-shadow transition-transform active:scale-95"
              aria-label="ตั้งค่าเสียงผู้บรรยาย Gemini AI"
              title="ตั้งค่าเสียงผู้บรรยาย Gemini AI (iPhone & Android เสียงเดียวกัน 100%)"
            >
              <Mic className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline text-[11px] font-bold text-zinc-300">เสียง GM</span>
            </button>

            <button
              type="button"
              onClick={() => setIsRulesModalOpen(true)}
              className="min-h-[40px] min-w-[40px] rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 flex items-center justify-center text-zinc-300 cartoon-btn-shadow transition-transform active:scale-95"
              aria-label="คู่มือกติกาและวิธีเล่นฟรี"
            >
              <BookOpen className="w-4 h-4 text-zinc-300" />
            </button>

            {/* PWA Fullscreen & Install Controls */}
            <PWAInstallBanner />

            {roomState && (
              <button
                type="button"
                onClick={handleLeaveRoom}
                className="min-h-[40px] min-w-[40px] rounded-xl bg-zinc-800 hover:bg-rose-950/70 border border-zinc-700 hover:border-rose-500/50 flex items-center justify-center text-zinc-400 hover:text-rose-300 cartoon-btn-shadow transition-transform active:scale-95"
                aria-label="ออกจากห้อง"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Phase Countdown Progress Bar */}
        {roomState && roomState.totalSeconds > 0 && (
          <div className="max-w-md mx-auto mt-2">
            <div className="flex items-center justify-between text-xs mb-1 font-bold">
              <span className="text-zinc-400">
                {roomState.dayCount > 0 ? `คืน/วันที่ ${roomState.dayCount}` : 'เตรียมพร้อม'} ·{' '}
                {PHASE_LABELS_TH[roomState.phase]}
              </span>
              <span
                className={`font-mono-num font-black ${
                  roomState.remainingSeconds <= 5
                    ? 'text-rose-400 animate-pulse'
                    : 'text-amber-400'
                }`}
              >
                {roomState.remainingSeconds} วินาที
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  roomState.remainingSeconds <= 5
                    ? 'bg-rose-500'
                    : roomState.phase === 'NIGHT_WEREWOLF'
                    ? 'bg-rose-600'
                    : roomState.phase === 'NIGHT_BODYGUARD'
                    ? 'bg-emerald-500'
                    : roomState.phase === 'NIGHT_SEER'
                    ? 'bg-amber-500'
                    : roomState.phase === 'NIGHT_WITCH'
                    ? 'bg-teal-500'
                    : 'bg-amber-400'
                }`}
                style={{ width: `${timerPercentage}%` }}
              />
            </div>
          </div>
        )}
      </header>

      {/* Floating Error Notification */}
      {errorBanner && (
        <div className="fixed top-16 inset-x-4 z-50 max-w-md mx-auto">
          <div className="rounded-xl bg-rose-950/95 border border-rose-500/60 px-4 py-3 shadow-xl flex items-center justify-between gap-3 text-xs text-rose-100">
            <span>{errorBanner}</span>
            <button
              type="button"
              onClick={() => setErrorBanner(null)}
              className="text-rose-300 hover:text-white font-semibold"
            >
              ปิด
            </button>
          </div>
        </div>
      )}

      {/* Main Content Container */}
      <main className="relative z-10 flex-1 w-full max-w-md mx-auto px-4 py-4 flex flex-col justify-between gap-4">
        {/* ===================================================================
            VIEW 0: ENTRY GATE (NO ROOM JOINED YET)
           =================================================================== */}
        {!roomState && (
          <div className="my-auto space-y-4 py-2">
            {/* Hero Title Card (Comic Charcoal Tabletop Aesthetic) */}
            <div className="rounded-2xl bg-[#14161c] border-2 border-zinc-850 p-6 text-center cartoon-card-shadow space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-zinc-800 border-2 border-zinc-750 mx-auto flex items-center justify-center cartoon-btn-shadow text-amber-400">
                <Moon className="w-8 h-8 text-amber-400 stroke-[2.2]" />
              </div>
              <div className="space-y-1">
                <h1 className="font-display text-2xl font-black tracking-wider text-white">
                  MOONWOLF
                </h1>
                <p className="text-xs font-bold text-amber-400">
                  จันทราหมาป่า · โซเชียลดีดักชัน 4–12 ผู้เล่น
                </p>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                เกมการ์ดหมาป่าแบบบอร์ดเกมแท้ เล่นกับเพื่อนผ่านมือถือได้ทันที พร้อมระบบผู้ดำเนินเกมอัตโนมัติเสียงไทย (No Human GM)
              </p>
            </div>

            {/* Nickname & Room Controls */}
            <div className="rounded-2xl bg-[#14161c] border-2 border-zinc-850 p-5 space-y-4 cartoon-card-shadow">
              <div>
                <label
                  htmlFor="nickname-input"
                  className="block text-xs font-bold text-zinc-300 mb-1.5"
                >
                  ชื่อเล่นของคุณในหมู่บ้าน
                </label>
                <input
                  id="nickname-input"
                  type="text"
                  maxLength={20}
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="เช่น อัศวินจันทรา, ผู้กองมีนา..."
                  className="w-full min-h-[48px] px-4 rounded-xl bg-[#0e1014] border-2 border-zinc-700/80 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleCreateRoom}
                className="w-full min-h-[50px] rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-zinc-950 font-black text-sm cartoon-btn-shadow flex items-center justify-center gap-2 transition-transform"
              >
                <Sparkles className="w-4 h-4 text-zinc-950 stroke-[2.5]" />
                <span>สร้างห้องใหม่ (Create Room)</span>
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t-2 border-zinc-800" />
                <span className="flex-shrink mx-3 text-[11px] text-zinc-400 font-bold">
                  หรือเข้าร่วมห้องของเพื่อน
                </span>
                <div className="flex-grow border-t-2 border-zinc-800" />
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={8}
                  value={joinRoomInput}
                  onChange={(e) => setJoinRoomInput(e.target.value.toUpperCase())}
                  placeholder="รหัสห้อง เช่น MW8821"
                  className="flex-1 min-h-[48px] px-3.5 rounded-xl bg-[#0e1014] border-2 border-zinc-700/80 font-mono-num uppercase text-sm font-bold text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleJoinRoom()}
                  className="min-h-[48px] px-5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-sm font-black text-white cartoon-btn-shadow transition-colors"
                >
                  เข้าร่วม
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  soundEngine.unlockAudioAndSpeech();
                  setIsScannerOpen(true);
                }}
                className="w-full min-h-[48px] rounded-xl bg-zinc-800/80 hover:bg-zinc-750 border-2 border-zinc-700 text-xs font-bold text-zinc-200 cartoon-btn-shadow flex items-center justify-center gap-2 transition-colors"
              >
                <QrCode className="w-4 h-4 text-amber-400" />
                <span>สแกน QR Code ด้วยกล้องเพื่อเข้าห้องทันที</span>
              </button>
            </div>
          </div>
        )}

        {/* ===================================================================
            GM NARRATION SUBTITLE BANNER (ACTIVE DURING MATCH)
           =================================================================== */}
        {roomState && roomState.phase !== 'LOBBY' && roomState.lastNarration && (
          <div className="rounded-xl bg-[#14161c] border-2 border-zinc-800 px-3.5 py-2.5 flex items-start gap-2.5 cartoon-card-shadow">
            <Volume2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-zinc-200 leading-relaxed font-medium">
              “{roomState.lastNarration.text}”
            </p>
          </div>
        )}

        {/* ===================================================================
            PERSISTENT SECRET ROLE & HUNTER/MINION DOSSIER BAR (DURING GAME)
           =================================================================== */}
        {roomState &&
          roomState.phase !== 'LOBBY' &&
          roomState.phase !== 'ROLE_REVEAL' &&
          roomState.phase !== 'GAME_OVER' &&
          myRole && (
            <div className="space-y-2">
              <div className="rounded-xl bg-[#14161c] border-2 border-zinc-800 px-3.5 py-2.5 flex items-center justify-between gap-2 cartoon-card-shadow">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      myRole.faction === 'WEREWOLF'
                        ? 'bg-rose-500'
                        : myRole.faction === 'NEUTRAL'
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                    }`}
                  />
                  <div className="truncate">
                    <span className="text-[11px] text-zinc-400 mr-1.5 font-bold">
                      บทบาทของคุณ:
                    </span>
                    <span
                      className={`text-xs font-black ${
                        myRole.faction === 'WEREWOLF'
                          ? 'text-rose-400'
                          : myRole.faction === 'NEUTRAL'
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {myRole.roleNameTh}
                    </span>
                    {me && !me.isAlive && (
                      <span className="ml-2 text-[11px] text-rose-400 font-bold">
                        (เสียชีวิตแล้ว)
                      </span>
                    )}
                  </div>
                </div>

                {myRole.role === 'SEER' && (
                  <button
                    type="button"
                    onClick={() => setShowSeerNotebook((v) => !v)}
                    className="min-h-[34px] px-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-[11px] font-bold text-amber-300 cartoon-btn-shadow flex items-center gap-1"
                  >
                    {showSeerNotebook ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                    <span>สมุดพยากรณ์ ({myRole.seerHistory?.length || 0})</span>
                  </button>
                )}
              </div>

              {/* Fellow Werewolves / Minion Secret Intel */}
              {(myRole.role === 'WEREWOLF' || myRole.role === 'MINION') &&
                myRole.fellowWerewolves &&
                myRole.fellowWerewolves.length > 0 && (
                  <div className="rounded-xl bg-rose-950/30 border border-rose-500/30 px-3.5 py-2 flex items-center justify-between text-xs">
                    <span className="text-rose-300 font-medium">
                      🐺 พรรคพวกมนุษย์หมาป่า:
                    </span>
                    <span className="text-rose-100 font-semibold">
                      {myRole.fellowWerewolves.map((w) => w.name).join(', ')}
                    </span>
                  </div>
                )}

              {/* Hunter Tactical Shotgun Pre-Aim Control (Active while Hunter is alive) */}
              {myRole.role === 'HUNTER' && me?.isAlive && (
                <div className="rounded-xl bg-teal-950/30 border border-teal-500/40 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-300">
                      <Crosshair className="w-4 h-4" />
                      <span>ศูนย์เล็งปืนลูกซองนายพราน (ยิงอัตโนมัติหากคุณตาย)</span>
                    </div>
                    {myRole.hunterTargetId && (
                      <button
                        type="button"
                        onClick={() => handleSelectHunterTarget(null)}
                        className="text-[11px] text-slate-400 hover:text-white underline"
                      >
                        ลดปืนลง
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {livingPlayers
                      .filter((p) => p.id !== me.id)
                      .map((p) => {
                        const isAimed = myRole.hunterTargetId === p.id;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => handleSelectHunterTarget(p.id)}
                            className={`min-h-[34px] px-2.5 py-1 rounded-lg text-xs font-medium border transition-all flex items-center gap-1 ${
                              isAimed
                                ? 'bg-teal-600 text-white border-teal-400 shadow-sm'
                                : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:border-teal-500/50'
                            }`}
                          >
                            <Crosshair className="w-3 h-3" />
                            <span>{p.name}</span>
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          )}

        {/* Collapsible Seer Investigation Notebook */}
        {showSeerNotebook && myRole?.role === 'SEER' && (
          <div className="rounded-xl bg-[#14161c] border-2 border-zinc-800 p-3.5 space-y-2 text-xs cartoon-card-shadow">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-400">
                บันทึกเนตรหยั่งรู้ (ส่วนตัวเฉพาะแม่หมอ)
              </span>
              <button
                type="button"
                onClick={() => setShowSeerNotebook(false)}
                className="text-zinc-400 hover:text-white font-bold"
              >
                ซ่อน
              </button>
            </div>
            {!myRole.seerHistory || myRole.seerHistory.length === 0 ? (
              <p className="text-zinc-400 font-medium">ยังไม่มีประวัติการตรวจสอบในเกมนี้</p>
            ) : (
              <div className="space-y-1.5">
                {myRole.seerHistory.map((item) => (
                  <div
                    key={`${item.night}-${item.targetId}`}
                    className="flex items-center justify-between rounded-lg bg-[#101216] px-3 py-1.5 border border-zinc-700/80"
                  >
                    <span className="text-zinc-300 font-medium">
                      คืนที่ {item.night}: <strong className="text-white">{item.targetName}</strong>
                    </span>
                    <span
                      className={
                        item.isWerewolf
                          ? 'text-rose-400 font-bold'
                          : 'text-emerald-400 font-bold'
                      }
                    >
                      {item.isWerewolf ? '🐺 มนุษย์หมาป่า' : '🛡️ ไม่ใช่หมาป่า'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===================================================================
            PHASE 1: LOBBY & HOST ROLE/PLAYER CONFIGURATION (4-12 PLAYERS)
           =================================================================== */}
        {roomState && roomState.phase === 'LOBBY' && (
          <div className="space-y-4">
            {/* Inline QR Code & Room Code Card */}
            <InlineRoomQrCode roomCode={roomState.roomCode} />

            {/* Host Tabletop & Fanned Hand / Participant 4-Column Role Cards */}
            <LobbyRoleDeckBuilder
              isHost={Boolean(me?.isHost)}
              targetPlayerCount={roomState.targetPlayerCount}
              roleConfig={roomState.roleConfig}
              recommendationNoteTh={roomState.recommendationNoteTh}
              onUpdateSettings={handleUpdateRoomSettings}
              onAutoBalanceVillagers={handleAutoBalanceVillagers}
            />

            {/* Player Slots List */}
            <div className="rounded-2xl bg-[#14161c] border-2 border-zinc-800 p-4 space-y-3 cartoon-card-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-400" />
                  <h2 className="text-sm font-bold text-white">
                    รายชื่อผู้เล่นในหมู่บ้าน
                  </h2>
                </div>
                <span className="font-mono-num text-xs font-black text-amber-400">
                  {roomState.players.length} / {roomState.targetPlayerCount} คน
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {Array.from({ length: roomState.targetPlayerCount }).map(
                  (_, index) => {
                    const slotPlayer = roomState.players[index];
                    return (
                      <div
                        key={slotPlayer ? slotPlayer.id : `empty-${index}`}
                        className={`min-h-[48px] rounded-xl px-3.5 py-2 border-2 flex items-center justify-between ${
                          slotPlayer
                            ? 'bg-[#101216] border-zinc-700/80 text-zinc-100 cartoon-card-shadow'
                            : 'bg-[#0c0e12]/60 border-dashed border-zinc-800 text-zinc-500'
                        }`}
                      >
                        {slotPlayer ? (
                          <>
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center font-mono-num text-xs font-black text-amber-400">
                                {index + 1}
                              </div>
                              <span className="text-sm font-bold truncate">
                                {slotPlayer.name}
                              </span>
                              {slotPlayer.id === playerToken && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                                  คุณ
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5">
                              {slotPlayer.isSimulated && (
                                <span className="text-[11px] px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 font-bold">
                                  AI จำลอง
                                </span>
                              )}
                              {slotPlayer.isHost && (
                                <span className="text-[11px] px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1 font-bold">
                                  <Crown className="w-3 h-3 text-amber-400" />
                                  Host
                                </span>
                              )}
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center gap-2.5 text-xs font-medium">
                            <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono-num text-zinc-600">
                              {index + 1}
                            </div>
                            <span>กำลังรอผู้เล่นเข้าร่วม...</span>
                          </div>
                        )}
                      </div>
                    );
                  }
                )}
              </div>

              {/* Host Controls for Filling Empty Slots with Simulated Players */}
              {me?.isHost && (
                <div className="pt-2 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] text-zinc-400 font-medium">
                    เพื่อนไม่ครบ? เติมผู้เล่นจำลองอัตโนมัติได้:
                  </span>
                  <div className="flex items-center gap-1.5">
                    {roomState.players.length < roomState.targetPlayerCount && (
                      <button
                        type="button"
                        onClick={() => handleManageBots('FILL_TO_TARGET')}
                        className="min-h-[38px] px-3 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-xs font-bold text-zinc-200 cartoon-btn-shadow flex items-center gap-1.5 transition-colors"
                      >
                        <UserPlus className="w-3.5 h-3.5 text-amber-400" />
                        <span>
                          เติม AI ให้ครบ {roomState.targetPlayerCount} คน
                        </span>
                      </button>
                    )}
                    {roomState.players.some((p) => p.isSimulated) && (
                      <button
                        type="button"
                        onClick={() => handleManageBots('CLEAR_ALL')}
                        className="min-h-[38px] px-2.5 rounded-lg bg-zinc-850 hover:bg-rose-950/60 border border-zinc-750 text-xs text-zinc-400 hover:text-rose-300 transition-colors"
                      >
                        ลบ AI ออก
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Start Match CTA */}
            {me?.isHost ? (
              <button
                type="button"
                disabled={
                  roomState.players.length !== roomState.targetPlayerCount ||
                  totalConfiguredRoles !== roomState.targetPlayerCount ||
                  (roomState.roleConfig.WEREWOLF || 0) < 1
                }
                onClick={handleStartGame}
                className={`w-full min-h-[54px] rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl transition-all ${
                  roomState.players.length === roomState.targetPlayerCount &&
                  totalConfiguredRoles === roomState.targetPlayerCount &&
                  (roomState.roleConfig.WEREWOLF || 0) >= 1
                    ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950 cartoon-btn-shadow cursor-pointer'
                    : 'bg-zinc-850 border border-zinc-800 text-zinc-500 cursor-not-allowed'
                }`}
              >
                <Sparkles className="w-4 h-4 text-zinc-950 stroke-[2.5]" />
                <span>
                  {roomState.players.length !== roomState.targetPlayerCount
                    ? `รอผู้เล่นให้ครบ ${roomState.targetPlayerCount} คน (${roomState.players.length}/${roomState.targetPlayerCount})`
                    : totalConfiguredRoles !== roomState.targetPlayerCount
                    ? `กรุณาตั้งค่าจำนวนโรลให้ครบ ${roomState.targetPlayerCount} โรล`
                    : `เริ่มเกมจันทราหมาป่า (${roomState.targetPlayerCount} ผู้เล่น)`}
                </span>
              </button>
            ) : (
              <div className="rounded-xl bg-[#0c1222] border border-slate-800 p-3.5 text-center text-xs text-slate-300">
                {roomState.players.length === roomState.targetPlayerCount
                  ? `ผู้เล่นครบ ${roomState.targetPlayerCount} คนแล้ว! กำลังรอหัวหน้าห้องกดเริ่มเกม...`
                  : `กำลังรอผู้เล่นเข้าร่วมให้ครบ ${roomState.targetPlayerCount} คน (${roomState.players.length}/${roomState.targetPlayerCount})`}
              </div>
            )}
          </div>
        )}

        {/* ===================================================================
            PHASE 2: ROLE REVEAL (12 SECONDS)
           =================================================================== */}
        {roomState && roomState.phase === 'ROLE_REVEAL' && myRole && (
          <div className="my-auto space-y-4 py-1">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-bold text-white">
                เปิดไพ่ชะตากรรมของคุณ
              </h2>
              <p className="text-xs text-slate-400">
                แตะที่การ์ดเพื่อพลิกดูบทบาทลับ และแตะอีกครั้งเพื่อซ่อนหน้าจอ
              </p>
            </div>

            <RoleTarotCard
              roleData={myRole}
              isFlipped={isCardFlipped}
              onToggleFlip={() => setIsCardFlipped((prev) => !prev)}
            />

            <button
              type="button"
              onClick={handleReadyForNextPhase}
              disabled={me?.isReadyForNext}
              className={`w-full min-h-[48px] rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                me?.isReadyForNext
                  ? 'bg-emerald-950/50 border border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-800 hover:bg-slate-700 text-white'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>
                {me?.isReadyForNext
                  ? 'พร้อมเข้าสู่คืนแรกแล้ว (กำลังรอคนอื่น...)'
                  : 'ฉันจำบทบาทได้แล้ว · พร้อมเข้าสู่ยามราตรี'}
              </span>
            </button>
          </div>
        )}

        {/* ===================================================================
            PHASE 3: DYNAMIC SEQUENTIAL NIGHT PHASES
           =================================================================== */}
        {roomState && isNightPhase && myRole && (
          <div className="my-auto space-y-4">
            {/* Dynamic Night Sequence Stepper */}
            {roomState.activeNightSequence &&
              roomState.activeNightSequence.length > 0 && (
                <div
                  className="grid gap-1.5"
                  style={{
                    gridTemplateColumns: `repeat(${roomState.activeNightSequence.length}, minmax(0, 1fr))`,
                  }}
                >
                  {roomState.activeNightSequence.map((subPhase, idx) => {
                    const meta = NIGHT_SUBPHASE_META[subPhase];
                    const isCurrent = roomState.phase === subPhase;
                    return (
                      <div
                        key={subPhase}
                        className={`rounded-xl px-2 py-2 border text-center text-[11px] font-medium transition-colors ${
                          isCurrent
                            ? meta.activeColor
                            : 'bg-slate-900/60 border-slate-800 text-slate-500'
                        }`}
                      >
                        ช่วงที่ {idx + 1}: {meta.shortLabel}
                      </div>
                    );
                  })}
                </div>
              )}

            {/* Dead Player Night View */}
            {me && !me.isAlive ? (
              <div className="rounded-2xl bg-[#0b0f1c] border border-slate-800 p-6 text-center space-y-3">
                <Skull className="w-10 h-10 text-slate-500 mx-auto" />
                <h2 className="text-base font-bold text-slate-200">
                  คุณกลายเป็นวิญญาณผู้เฝ้ามอง
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  คุณเสียชีวิตแล้ว โปรดรักษาความเงียบและเฝ้าดูเหตุการณ์ในยามวิกาลจนกว่าจะถึงรุ่งอรุณ
                </p>
              </div>
            ) : roomState.phase === 'NIGHT_WEREWOLF' &&
              myRole.role === 'WEREWOLF' ? (
              /* WEREWOLF TURN (STEP 1) */
              <div className="rounded-2xl bg-[#14161c] border-2 border-red-500/80 p-5 space-y-4 cartoon-card-shadow">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      style={{ backgroundColor: '#84312c', borderColor: '#ef4444' }}
                      className="w-10 h-13 rounded-lg border-2 flex items-center justify-center p-0.5 shadow shrink-0 overflow-hidden"
                    >
                      <RoleCharacterArt role="WEREWOLF" className="w-full h-full drop-shadow" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-red-200">
                        ตาของมนุษย์หมาป่า · เลือกสังหารเหยื่อ
                      </h2>
                      <p className="text-[11px] text-zinc-400">
                        เลือกเหยื่อที่จะสังหารในคืนนี้
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-500/60 font-bold shrink-0">
                    ฝ่ายรัตติกาล
                  </span>
                </div>

                <p className="text-xs text-rose-200/80">
                  เลือกผู้เล่นที่มีชีวิตอยู่ 1 คนเพื่อสังหารในคืนนี้ เมื่อกดยืนยันแล้วระบบจะเข้าสู่ช่วงถัดไปทันที
                </p>

                {confirmedNightTargetName || myRole.hasActedNight ? (
                  <div className="rounded-xl bg-rose-950/60 border border-rose-500/50 p-4 text-center space-y-1.5">
                    <Check className="w-6 h-6 text-rose-300 mx-auto" />
                    <p className="text-sm font-semibold text-white">
                      ล็อกเป้าหมายสังหาร{' '}
                      {confirmedNightTargetName
                        ? `"${confirmedNightTargetName}"`
                        : 'เรียบร้อยแล้ว'}
                    </p>
                    <p className="text-xs text-rose-200/70">
                      กำลังเข้าสู่ช่วงเวลาถัดไปของยามราตรี...
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 gap-2">
                      {livingPlayers
                        .filter((p) => p.id !== me?.id)
                        .map((target) => {
                          const isSelected = selectedNightTargetId === target.id;
                          return (
                            <button
                              key={target.id}
                              type="button"
                              onClick={() => setSelectedNightTargetId(target.id)}
                              className={`min-h-[48px] rounded-xl px-4 py-2.5 border text-left flex items-center justify-between transition-all ${
                                isSelected
                                  ? 'bg-rose-600/25 border-rose-400 text-white shadow-md shadow-rose-950/50'
                                  : 'bg-black/40 border-rose-900/40 text-slate-200 hover:border-rose-500/40'
                              }`}
                            >
                              <span className="text-sm font-medium">
                                {target.name}
                              </span>
                              <span
                                className={`text-xs px-2.5 py-1 rounded-lg ${
                                  isSelected
                                    ? 'bg-rose-500 text-white font-semibold'
                                    : 'bg-rose-950/60 text-rose-300'
                                }`}
                              >
                                {isSelected ? 'เป้าหมายที่เลือก' : 'เลือกสังหาร'}
                              </span>
                            </button>
                          );
                        })}
                    </div>

                    <button
                      type="button"
                      disabled={!selectedNightTargetId}
                      onClick={handleSubmitNightKill}
                      className={`w-full min-h-[50px] rounded-xl font-semibold text-sm transition-all ${
                        selectedNightTargetId
                          ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/70'
                          : 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed'
                      }`}
                    >
                      ยืนยันการสังหารเหยื่อ
                    </button>
                  </>
                )}
              </div>
            ) : roomState.phase === 'NIGHT_BODYGUARD' &&
              myRole.role === 'BODYGUARD' ? (
              /* BODYGUARD TURN (STEP 2) */
              <div className="rounded-2xl bg-gradient-to-b from-[#071c15] to-[#06110e] border border-emerald-500/40 p-5 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-emerald-400" />
                    <h2 className="text-base font-bold text-emerald-100">
                      ตาของบอดี้การ์ด · เลือกคุ้มกัน
                    </h2>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    โล่ผู้พิทักษ์
                  </span>
                </div>

                <p className="text-xs text-emerald-200/80">
                  เลือกผู้เล่น 1 คน (รวมถึงตัวเองได้) เพื่อกางโล่ป้องกันการถูกหมาป่าสังหารในคืนนี้ (ห้ามปกป้องคนเดิมซ้ำกับคืนก่อน)
                </p>

                {confirmedGuardTargetName || myRole.hasActedNight ? (
                  <div className="rounded-xl bg-emerald-950/60 border border-emerald-500/50 p-4 text-center space-y-1.5">
                    <Shield className="w-6 h-6 text-emerald-300 mx-auto" />
                    <p className="text-sm font-semibold text-white">
                      กางโล่คุ้มครอง{' '}
                      {confirmedGuardTargetName
                        ? `"${confirmedGuardTargetName}"`
                        : 'เรียบร้อยแล้ว'}
                    </p>
                    <p className="text-xs text-emerald-200/70">
                      กำลังเข้าสู่ช่วงเวลาถัดไปของยามราตรี...
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 gap-2">
                      {livingPlayers.map((target) => {
                        const isSelected = selectedNightTargetId === target.id;
                        const isSameAsLastNight =
                          myRole.lastProtectedId === target.id;
                        return (
                          <button
                            key={target.id}
                            type="button"
                            disabled={isSameAsLastNight}
                            onClick={() => setSelectedNightTargetId(target.id)}
                            className={`min-h-[48px] rounded-xl px-4 py-2.5 border text-left flex items-center justify-between transition-all ${
                              isSameAsLastNight
                                ? 'bg-slate-950/40 border-slate-800/60 text-slate-600 cursor-not-allowed'
                                : isSelected
                                ? 'bg-emerald-600/25 border-emerald-400 text-white shadow-md shadow-emerald-950/50'
                                : 'bg-black/40 border-emerald-900/40 text-slate-200 hover:border-emerald-500/40'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {target.name}
                              </span>
                              {target.id === me?.id && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                                  ตัวคุณเอง
                                </span>
                              )}
                            </div>
                            <span
                              className={`text-xs px-2.5 py-1 rounded-lg ${
                                isSameAsLastNight
                                  ? 'bg-slate-900 text-slate-500'
                                  : isSelected
                                  ? 'bg-emerald-500 text-white font-semibold'
                                  : 'bg-emerald-950/60 text-emerald-300'
                              }`}
                            >
                              {isSameAsLastNight
                                ? 'ปกป้องเมื่อคืนแล้ว'
                                : isSelected
                                ? 'เป้าหมายที่เลือก'
                                : 'เลือกคุ้มกัน'}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      disabled={!selectedNightTargetId}
                      onClick={handleSubmitBodyguardTarget}
                      className={`w-full min-h-[50px] rounded-xl font-semibold text-sm transition-all ${
                        selectedNightTargetId
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/70'
                          : 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed'
                      }`}
                    >
                      ยืนยันการกางโล่คุ้มครอง
                    </button>
                  </>
                )}
              </div>
            ) : roomState.phase === 'NIGHT_SEER' && myRole.role === 'SEER' ? (
              /* SEER TURN (STEP 3) - CARTOON CHARCOAL & AMBER */
              <div className="rounded-2xl bg-[#14161c] border-2 border-amber-500/80 p-5 space-y-4 cartoon-card-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-amber-400" />
                    <h2 className="text-base font-black text-white">
                      ตาของผู้หยั่งรู้ · ตรวจสอบตัวตน
                    </h2>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                    ฝ่ายชาวบ้าน
                  </span>
                </div>

                <p className="text-xs text-zinc-300 font-medium">
                  เลือกผู้เล่น 1 คนเพื่อใช้เนตรพยากรณ์ตรวจสอบว่าเขาเป็นมนุษย์หมาป่าหรือไม่
                </p>

                {myRole.hasActedNight && latestSeerResult ? (
                  <div className="space-y-3">
                    <div
                      className={`rounded-xl p-4 border-2 text-center space-y-2 cartoon-card-shadow ${
                        latestSeerResult.isWerewolf
                          ? 'bg-rose-950/70 border-rose-500/80'
                          : 'bg-emerald-950/70 border-emerald-500/80'
                      }`}
                    >
                      <p className="text-xs text-zinc-300">
                        ผลการพยากรณ์ตัวตนของ{' '}
                        <strong className="text-white">
                          {latestSeerResult.targetName}
                        </strong>
                      </p>
                      <p
                        className={`text-base font-black ${
                          latestSeerResult.isWerewolf
                            ? 'text-rose-300'
                            : 'text-emerald-300'
                        }`}
                      >
                        {latestSeerResult.isWerewolf
                          ? '🐺 เป็นมนุษย์หมาป่า! (ฝ่ายรัตติกาล)'
                          : '🛡️ ไม่ใช่หมาป่า (ฝ่ายชาวบ้าน)'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleReadyForNextPhase}
                      className="w-full min-h-[48px] rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs cartoon-btn-shadow transition-transform active:scale-95"
                    >
                      จำผลพยากรณ์แล้ว · ไปยังช่วงถัดไปทันที
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 gap-2">
                      {livingPlayers
                        .filter((p) => p.id !== me?.id)
                        .map((target) => {
                          const isSelected = selectedNightTargetId === target.id;
                          return (
                            <button
                              key={target.id}
                              type="button"
                              onClick={() => setSelectedNightTargetId(target.id)}
                              className={`min-h-[48px] rounded-xl px-4 py-2.5 border-2 text-left flex items-center justify-between transition-all ${
                                isSelected
                                  ? 'bg-amber-500/20 border-amber-400 text-white shadow-md'
                                  : 'bg-[#101216] border-zinc-750 text-zinc-200 hover:border-amber-500/50'
                              }`}
                            >
                              <span className="text-sm font-bold">
                                {target.name}
                              </span>
                              <span
                                className={`text-xs px-2.5 py-1 rounded-lg font-bold ${
                                  isSelected
                                    ? 'bg-amber-500 text-zinc-950'
                                    : 'bg-zinc-800 text-amber-300'
                                }`}
                              >
                                {isSelected ? 'เลือกตรวจสอบ' : 'ส่องดูตัวตน'}
                              </span>
                            </button>
                          );
                        })}
                    </div>

                    <button
                      type="button"
                      disabled={!selectedNightTargetId}
                      onClick={handleSubmitSeerCheck}
                      className={`w-full min-h-[50px] rounded-xl font-black text-sm cartoon-btn-shadow transition-transform ${
                        selectedNightTargetId
                          ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950 active:scale-95'
                          : 'bg-zinc-850 text-zinc-500 border border-zinc-800 cursor-not-allowed'
                      }`}
                    >
                      ยืนยันการตรวจสอบตัวตน
                    </button>
                  </>
                )}
              </div>
            ) : roomState.phase === 'NIGHT_WITCH' && myRole.role === 'WITCH' ? (
              /* WITCH TURN (STEP 4) - CARTOON CHARCOAL & EMERALD */
              <div className="rounded-2xl bg-[#14161c] border-2 border-emerald-500/80 p-5 space-y-4 cartoon-card-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FlaskConical className="w-5 h-5 text-emerald-400" />
                    <h2 className="text-base font-black text-white">
                      ตาของแม่มด · เลือกใช้น้ำยาวิเศษ
                    </h2>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <span
                      className={`px-2 py-0.5 rounded-md border font-bold ${
                        myRole.witchHealAvailable
                          ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-500 line-through'
                      }`}
                    >
                      ยาชุบชีวิต
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md border font-bold ${
                        myRole.witchPoisonAvailable
                          ? 'bg-rose-950/80 border-rose-500/60 text-rose-300'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-500 line-through'
                      }`}
                    >
                      ยาพิษ
                    </span>
                  </div>
                </div>

                {confirmedWitchMessage || myRole.hasActedNight ? (
                  <div className="rounded-xl bg-[#101216] border-2 border-emerald-500/60 p-4 text-center space-y-1.5 cartoon-card-shadow">
                    <FlaskConical className="w-6 h-6 text-emerald-400 mx-auto" />
                    <p className="text-sm font-bold text-white">
                      {confirmedWitchMessage || 'ดำเนินการเสร็จสิ้น'}
                    </p>
                    <p className="text-xs text-zinc-400">
                      กำลังเข้าสู่ช่วงรุ่งอรุณ...
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Elixir of Life Section */}
                    <div className="rounded-xl bg-[#101216] border-2 border-emerald-600/40 p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-emerald-300">
                          🧪 ขวดที่ 1: ยาชุบชีวิต (ช่วยเหยื่อคืนนี้)
                        </span>
                        <span className="text-[11px] text-zinc-400 font-bold">
                          {myRole.witchHealAvailable ? 'เหลือ 1 ขวด' : 'ใช้ไปแล้ว'}
                        </span>
                      </div>
                      {myRole.witchAttackedVictim ? (
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-zinc-200">
                            คืนนี้{' '}
                            <strong className="text-rose-400 font-bold">
                              {myRole.witchAttackedVictim.name}
                            </strong>{' '}
                            กำลังถูกหมาป่ากัด!
                          </span>
                          <button
                            type="button"
                            disabled={!myRole.witchHealAvailable}
                            onClick={() => handleSubmitWitchAction('HEAL')}
                            className="min-h-[38px] px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-xs font-black text-white cartoon-btn-shadow shrink-0"
                          >
                            ใช้ยาชุบชีวิตช่วย
                          </button>
                        </div>
                      ) : (
                        <p className="text-xs text-zinc-400">
                          คืนนี้ไม่มีผู้บาดเจ็บ (หรือบอดี้การ์ดป้องกันไว้แล้ว)
                        </p>
                      )}
                    </div>

                    {/* Poison Elixir Section */}
                    <div className="rounded-xl bg-[#101216] border-2 border-rose-600/40 p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-rose-300">
                          ☠️ ขวดที่ 2: ยาพิษสังหาร (เลือกสังหาร 1 คน)
                        </span>
                        <span className="text-[11px] text-zinc-400 font-bold">
                          {myRole.witchPoisonAvailable ? 'เหลือ 1 ขวด' : 'ใช้ไปแล้ว'}
                        </span>
                      </div>

                      {myRole.witchPoisonAvailable ? (
                        <>
                          <div className="grid grid-cols-2 gap-1.5">
                            {livingPlayers
                              .filter((p) => p.id !== me?.id)
                              .map((target) => {
                                const isSelected =
                                  selectedNightTargetId === target.id;
                                return (
                                  <button
                                    key={target.id}
                                    type="button"
                                    onClick={() =>
                                      setSelectedNightTargetId(target.id)
                                    }
                                    className={`min-h-[40px] px-2.5 py-1.5 rounded-lg border-2 text-xs font-bold truncate transition-all ${
                                      isSelected
                                        ? 'bg-rose-600 text-white border-rose-400 shadow-md'
                                        : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:border-rose-500/50'
                                    }`}
                                  >
                                    {target.name}
                                  </button>
                                );
                              })}
                          </div>
                          <button
                            type="button"
                            disabled={!selectedNightTargetId}
                            onClick={() =>
                              selectedNightTargetId &&
                              handleSubmitWitchAction(
                                'POISON',
                                selectedNightTargetId
                              )
                            }
                            className="w-full min-h-[42px] rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-xs font-black text-white cartoon-btn-shadow transition-colors"
                          >
                            ยืนยันใช้ยาพิษสังหารเป้าหมาย
                          </button>
                        </>
                      ) : (
                        <p className="text-xs text-zinc-500">
                          คุณได้ใช้ยาพิษไปแล้วในเกมนี้
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSubmitWitchAction('SKIP')}
                      className="w-full min-h-[46px] rounded-xl bg-zinc-800 hover:bg-zinc-750 text-xs font-bold text-zinc-200 cartoon-btn-shadow transition-colors"
                    >
                      ไม่ใช้น้ำยาในคืนนี้ (เก็บไว้ใช้คืนถัดไป)
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* SLEEPING SCREEN (WHEN IT IS NOT THIS PLAYER'S SUB-PHASE TURN) */
              <div className="rounded-2xl bg-[#14161c] border-2 border-zinc-800 p-7 text-center space-y-4 cartoon-card-shadow">
                <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center cartoon-btn-shadow text-amber-400">
                    <Moon className="w-8 h-8 text-amber-400" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h2 className="text-lg font-black text-white">
                    คุณกำลังนอนหลับอย่างเงียบงัน...
                  </h2>
                  <p className="text-xs text-amber-300 font-bold">
                    ขณะนี้เป็นช่วง:{' '}
                    {roomState.phase === 'NIGHT_WEREWOLF'
                      ? 'มนุษย์หมาป่ากำลังออกล่าเหยื่อ'
                      : roomState.phase === 'NIGHT_BODYGUARD'
                      ? 'บอดี้การ์ดกำลังเลือกคุ้มกันผู้เล่น'
                      : roomState.phase === 'NIGHT_SEER'
                      ? 'ผู้หยั่งรู้ (แม่หมอ) กำลังตรวจสอบตัวตน'
                      : 'แม่มดกำลังตัดสินใจใช้น้ำยาวิเศษ'}
                  </p>
                  <p className="text-xs text-zinc-400 leading-relaxed max-w-xs mx-auto pt-1 font-medium">
                    {myRole.role === 'BODYGUARD' &&
                    roomState.phase === 'NIGHT_WEREWOLF'
                      ? 'เตรียมตัวให้พร้อม! เมื่อหมาป่าเลือกเหยื่อเสร็จ จะถึงตาคุณลืมตาขึ้นมาคุ้มกัน'
                      : myRole.role === 'SEER' &&
                        (roomState.phase === 'NIGHT_WEREWOLF' ||
                          roomState.phase === 'NIGHT_BODYGUARD')
                      ? 'เตรียมตัวให้พร้อม! เมื่อถึงช่วงของผู้หยั่งรู้ หน้าจอของคุณจะเปิดให้ส่องตัวตนทันที'
                      : myRole.role === 'WITCH' &&
                        roomState.phase !== 'NIGHT_WITCH'
                      ? 'เตรียมตัวให้พร้อม! ช่วงสุดท้ายของคืนนี้คุณจะตื่นขึ้นมาเลือกใช้ยาชุบชีวิตหรือยาพิษ'
                      : 'โปรดหลับตาและรักษาความเงียบ เพื่อไม่ให้ผู้เล่นคนอื่นจับพิรุธได้'}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===================================================================
            PHASE 4: DAWN & DAYTIME DISCUSSION
           =================================================================== */}
        {roomState && roomState.phase === 'DAY_DISCUSSION' && (
          <div className="space-y-4">
            {/* Dawn Report Banner (Supports multiple victims + Hunter revenge shot) */}
            <div
              className={`rounded-2xl p-4 border shadow-xl flex items-start gap-3.5 ${
                roomState.lastNightVictims && roomState.lastNightVictims.length > 0
                  ? 'bg-rose-950/40 border-rose-500/40'
                  : 'bg-emerald-950/35 border-emerald-500/40'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  roomState.lastNightVictims &&
                  roomState.lastNightVictims.length > 0
                    ? 'bg-rose-500/20 text-rose-400'
                    : 'bg-emerald-500/20 text-emerald-300'
                }`}
              >
                {roomState.lastNightVictims &&
                roomState.lastNightVictims.length > 0 ? (
                  <Skull className="w-5 h-5" />
                ) : (
                  <Sun className="w-5 h-5" />
                )}
              </div>
              <div className="space-y-1 flex-1">
                <h2 className="text-sm font-bold text-white">
                  ประกาศข่าวรุ่งอรุณ (วันที่ {roomState.dayCount})
                </h2>
                {roomState.lastNightVictims &&
                roomState.lastNightVictims.length > 0 ? (
                  <div className="space-y-1">
                    {roomState.lastNightVictims.map((v) => (
                      <p key={v.id} className="text-xs text-rose-200">
                        • <strong>{v.name}</strong> เสียชีวิต ({v.reasonTh})
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-emerald-200">
                    เมื่อคืนนี้ไม่มีผู้ใดเสียชีวิต หมู่บ้านรอดพ้นภัยคุกคามอย่างปาฏิหาริย์!
                  </p>
                )}
              </div>
            </div>

            {/* Fool Tactical Reminder */}
            {myRole?.role === 'FOOL' && me?.isAlive && (
              <div className="rounded-xl bg-amber-950/35 border border-amber-500/40 px-3.5 py-2.5 text-xs text-amber-200">
                🃏 <strong>ภารกิจคนบ้า (โจ๊กเกอร์):</strong> พูดจาให้คนอื่นระแวงคุณ! หากวันนี้คุณถูกโหวตประหาร คุณจะชนะเดี่ยวทันที!
              </div>
            )}

            {/* Living & Fallen Players Status Grid */}
            <div className="rounded-2xl bg-[#0c1222]/90 border border-slate-800 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  สถานะชาวบ้าน ({livingPlayers.length} รอดชีวิต)
                </h3>
                <span className="text-[11px] text-slate-400">
                  พูดคุยเพื่อหาตัวหมาป่า
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {roomState.players.map((p) => (
                  <div
                    key={p.id}
                    className={`min-h-[46px] rounded-xl px-3.5 py-2 border flex items-center justify-between ${
                      p.isAlive
                        ? 'bg-[#090e1c] border-slate-800 text-slate-100'
                        : 'bg-black/40 border-slate-900 text-slate-500 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          p.isAlive ? 'bg-emerald-400' : 'bg-rose-500'
                        }`}
                      />
                      <span
                        className={`text-sm font-medium ${
                          !p.isAlive ? 'line-through' : ''
                        }`}
                      >
                        {p.name}
                      </span>
                      {p.id === playerToken && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                          คุณ
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      {!p.isAlive ? (
                        <span className="text-rose-400 font-bold">
                          เสียชีวิต
                        </span>
                      ) : p.isReadyForNext ? (
                        <span className="text-emerald-400 text-[11px] font-bold">
                          พร้อมโหวต ✓
                        </span>
                      ) : (
                        <span className="text-zinc-400 text-[11px] font-medium">
                          กำลังอภิปราย
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {me?.isAlive && (
                <button
                  type="button"
                  disabled={me.isReadyForNext}
                  onClick={handleReadyForNextPhase}
                  className={`w-full min-h-[48px] rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-transform ${
                    me.isReadyForNext
                      ? 'bg-emerald-950/80 border-2 border-emerald-500/60 text-emerald-300'
                      : 'bg-amber-500 hover:bg-amber-400 text-zinc-950 cartoon-btn-shadow active:scale-95'
                  }`}
                >
                  <Vote className="w-4 h-4 stroke-[2.5]" />
                  <span>
                    {me.isReadyForNext
                      ? 'ยืนยันพร้อมโหวตแล้ว (กำลังรอผู้เล่นอื่น...)'
                      : 'ข้ามเวลาอภิปราย · เข้าสู่การโหวตทันที'}
                  </span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* ===================================================================
            PHASE 5: VOTING & TIE-BREAKER REVOTE
           =================================================================== */}
        {roomState &&
          (roomState.phase === 'VOTING' || roomState.phase === 'REVOTE') && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-[#0c1222]/95 border border-amber-500/40 p-4 space-y-3 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Vote className="w-5 h-5 text-amber-400" />
                    <h2 className="text-base font-bold text-white">
                      {roomState.phase === 'REVOTE'
                        ? 'โหวตตัดเชือก (Revote)'
                        : 'ลงคะแนนโหวตขับไล่'}
                    </h2>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    ห้ามโหวตตัวเอง
                  </span>
                </div>

                <p className="text-xs text-slate-300">
                  {roomState.phase === 'REVOTE'
                    ? 'คะแนนโหวตสูงสุดเท่ากัน! โปรดเลือกโหวตเฉพาะผู้ต้องสงสัยที่ติดโผตัดเชือกเท่านั้น'
                    : 'เลือกผู้ต้องสงสัยที่คุณเชื่อว่าเป็นมนุษย์หมาป่า 1 คน คะแนนทั้งหมดจะถูกเปิดเผยพร้อมกัน'}
                </p>

                {!me?.isAlive ? (
                  <div className="rounded-xl bg-black/50 border border-slate-800 p-4 text-center text-xs text-slate-400">
                    คุณเสียชีวิตแล้ว ไม่สามารถออกเสียงโหวตได้ กำลังรอผู้รอดชีวิตลงคะแนน...
                  </div>
                ) : me.hasVoted ? (
                  <div className="rounded-xl bg-emerald-950/50 border border-emerald-500/40 p-4 text-center space-y-1">
                    <Check className="w-6 h-6 text-emerald-400 mx-auto" />
                    <p className="text-sm font-semibold text-white">
                      ส่งคะแนนโหวตเรียบร้อยแล้ว
                    </p>
                    <p className="text-xs text-slate-400">
                      กำลังรอผู้รอดชีวิตคนอื่นลงคะแนนให้ครบ...
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 gap-2">
                      {livingPlayers
                        .filter((candidate) => {
                          if (candidate.id === me.id) return false;
                          if (
                            roomState.phase === 'REVOTE' &&
                            roomState.tiedCandidateIds.length > 0
                          ) {
                            return roomState.tiedCandidateIds.includes(
                              candidate.id
                            );
                          }
                          return true;
                        })
                        .map((candidate) => {
                          const isSelected =
                            selectedVoteTargetId === candidate.id;
                          return (
                            <button
                              key={candidate.id}
                              type="button"
                              onClick={() => setSelectedVoteTargetId(candidate.id)}
                              className={`min-h-[48px] rounded-xl px-4 py-2.5 border text-left flex items-center justify-between transition-all ${
                                isSelected
                                  ? 'bg-amber-500/20 border-amber-400 text-white shadow-md'
                                  : 'bg-[#080c17] border-slate-800 text-slate-200 hover:border-amber-500/40'
                              }`}
                            >
                              <span className="text-sm font-medium">
                                {candidate.name}
                              </span>
                              <span
                                className={`text-xs px-2.5 py-1 rounded-lg ${
                                  isSelected
                                    ? 'bg-amber-500 text-black font-bold'
                                    : 'bg-slate-800 text-slate-300'
                                }`}
                              >
                                {isSelected ? 'เลือกโหวตคนนี้' : 'โหวตขับไล่'}
                              </span>
                            </button>
                          );
                        })}
                    </div>

                    <button
                      type="button"
                      disabled={!selectedVoteTargetId}
                      onClick={handleSubmitVote}
                      className={`w-full min-h-[50px] rounded-xl font-semibold text-sm transition-all ${
                        selectedVoteTargetId
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg'
                          : 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed'
                      }`}
                    >
                      ยืนยันลงคะแนนโหวตขับไล่
                    </button>
                  </>
                )}

                {/* Real-time Voter Readiness Strip */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>ผู้รอดชีวิตที่โหวตแล้ว:</span>
                  <span className="font-mono-num text-amber-300 font-semibold">
                    {livingPlayers.filter((p) => p.hasVoted).length} /{' '}
                    {livingPlayers.length} คน
                  </span>
                </div>
              </div>
            </div>
          )}

        {/* ===================================================================
            PHASE 5.5: VOTE RESULT SUMMARY
           =================================================================== */}
        {roomState && roomState.phase === 'VOTE_RESULT' && (
          <div className="my-auto rounded-2xl bg-[#0c1222] border border-slate-800 p-5 space-y-4 shadow-2xl">
            <div className="text-center space-y-1">
              <h2 className="text-base font-bold text-white">
                ผลการลงมติของหมู่บ้าน
              </h2>
              {roomState.lastExiledPlayer ? (
                <p className="text-sm font-semibold text-rose-400">
                  “{roomState.lastExiledPlayer.name}” ถูกโหวตขับไล่ออกจากหมู่บ้าน!
                </p>
              ) : (
                <p className="text-sm font-semibold text-amber-300">
                  คะแนนเสียงเท่ากัน ไม่มีผู้ใดถูกขับไล่ในวันนี้
                </p>
              )}
            </div>

            {roomState.lastVoteBreakdown.length > 0 && (
              <div className="space-y-2">
                {roomState.lastVoteBreakdown.map((item) => (
                  <div
                    key={item.candidateId}
                    className="rounded-xl bg-[#070a12] border border-slate-800 px-3.5 py-2.5 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-white">
                        {item.candidateName}
                      </span>
                      <p className="text-[11px] text-slate-400">
                        ผู้โหวต: {item.voterNames.join(', ')}
                      </p>
                    </div>
                    <span className="font-mono-num text-sm font-bold text-amber-300">
                      {item.votes} โหวต
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===================================================================
            PHASE 6: GAME OVER & FULL ROLE REVEAL
           =================================================================== */}
        {roomState && roomState.phase === 'GAME_OVER' && (
          <div className="space-y-4">
            {/* Victory Banner (Supports Villager, Werewolf, and Neutral Fool Victory) */}
            <div
              className={`rounded-2xl p-5 border text-center space-y-2 shadow-2xl ${
                roomState.winnerFaction === 'VILLAGER'
                  ? 'bg-gradient-to-b from-emerald-950/70 to-[#091512] border-emerald-500/50'
                  : roomState.winnerFaction === 'NEUTRAL'
                  ? 'bg-gradient-to-b from-amber-950/70 to-[#171106] border-amber-500/50'
                  : 'bg-gradient-to-b from-rose-950/70 to-[#16070c] border-rose-500/50'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center bg-black/30 border border-white/10">
                {roomState.winnerFaction === 'VILLAGER' ? (
                  <ShieldAlert className="w-6 h-6 text-emerald-300" />
                ) : roomState.winnerFaction === 'NEUTRAL' ? (
                  <Sparkles className="w-6 h-6 text-amber-300" />
                ) : (
                  <Flame className="w-6 h-6 text-rose-400" />
                )}
              </div>
              <h2 className="text-xl font-bold text-white">
                {roomState.winnerFaction === 'VILLAGER'
                  ? 'ฝ่ายชาวบ้านได้รับชัยชนะ!'
                  : roomState.winnerFaction === 'NEUTRAL'
                  ? 'คนบ้า (โจ๊กเกอร์) ชนะเดี่ยว!'
                  : 'ฝ่ายมนุษย์หมาป่าได้รับชัยชนะ!'}
              </h2>
              <p className="text-xs text-slate-200 leading-relaxed">
                {roomState.winReasonTh}
              </p>
            </div>

            {/* Full True Identity Reveal Table */}
            <div className="rounded-2xl bg-[#14161c] border-2 border-zinc-800 p-4 space-y-3 cartoon-card-shadow">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                เปิดเผยตัวตนที่แท้จริงของผู้เล่นทั้งหมด ({roomState.players.length} คน)
              </h3>

              <div className="grid grid-cols-1 gap-2">
                {roomState.players.map((p) => {
                  const roleTheme = p.revealedRole ? ROLE_CARD_THEMES[p.revealedRole] : null;
                  return (
                    <div
                      key={p.id}
                      className="rounded-xl px-3 py-2 border-2 flex items-center justify-between bg-[#101216] border-zinc-800"
                    >
                      <div className="flex items-center gap-3">
                        {p.revealedRole && (
                          <div
                            style={{
                              backgroundColor: roleTheme?.cardBg || '#1e293b',
                              borderColor: roleTheme?.borderColor || '#475569',
                            }}
                            className="w-10 h-13 rounded-lg border-2 flex items-center justify-center p-0.5 shadow shrink-0 overflow-hidden"
                          >
                            <RoleCharacterArt role={p.revealedRole} className="w-full h-full drop-shadow" />
                          </div>
                        )}
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">
                              {p.name}
                            </span>
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                                p.isAlive
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : 'bg-rose-500/20 text-rose-300'
                              }`}
                            >
                              {p.isAlive ? 'รอดชีวิต' : 'เสียชีวิต'}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400">
                            {roleTheme ? roleTheme.nameTh : p.revealedRoleNameTh}
                          </p>
                        </div>
                      </div>

                      {roleTheme && (
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${roleTheme.badgeBg} ${roleTheme.badgeText} ${roleTheme.badgeBorder}`}
                        >
                          {roleTheme.shortNameTh}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={handleRestartLobby}
              className="w-full min-h-[52px] rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-sm cartoon-btn-shadow flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <RefreshCw className="w-4 h-4 text-zinc-950 stroke-[2.5]" />
              <span>กลับสู่ห้องเตรียมตัว (ปรับโรล / เริ่มเกมใหม่)</span>
            </button>
          </div>
        )}

        {/* ===================================================================
            CHRONICLE LOG FOOTER (RECENT EVENTS)
           =================================================================== */}
        {roomState && roomState.logs.length > 0 && (
          <div className="rounded-xl bg-[#090d19]/90 border border-slate-800/80 p-3 space-y-1.5">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              บันทึกเหตุการณ์ล่าสุด
            </div>
            <div className="max-h-24 overflow-y-auto space-y-1 pr-1 text-[11px] text-slate-300">
              {roomState.logs.slice(0, 6).map((log) => (
                <div key={log.id} className="leading-relaxed">
                  <span className="text-slate-500 mr-1.5">•</span>
                  <span>{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <QrScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanRoomCode={(scannedRoomCode: string) => {
          setIsScannerOpen(false);
          setJoinRoomInput(scannedRoomCode);
          if (playerName.trim()) {
            handleJoinRoom(scannedRoomCode);
          }
        }}
      />

      <RulesAndDeployModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
      />

      <GeminiVoiceModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
      />
    </div>
  );
}
