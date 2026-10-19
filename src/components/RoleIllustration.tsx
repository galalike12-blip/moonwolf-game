import React from 'react';
import { RoleType } from './RoleTarotCard';

export interface RoleCardTheme {
  role: RoleType;
  nameTh: string;
  nameEn: string;
  shortNameTh: string;
  faction: 'WEREWOLF' | 'VILLAGER' | 'NEUTRAL';
  factionLabelTh: string;
  // Exact card styling matching the user reference image:
  cardBg: string; // Background color of the card body
  borderColor: string; // Vibrant perimeter stroke color
  accentColor: string; // Highlight/glow accent color
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}

export const ROLE_CARD_THEMES: Record<RoleType, RoleCardTheme> = {
  WEREWOLF: {
    role: 'WEREWOLF',
    nameTh: 'มนุษย์หมาป่า',
    nameEn: 'Werewolf',
    shortNameTh: 'หมาป่า',
    faction: 'WEREWOLF',
    factionLabelTh: 'ฝ่ายรัตติกาล',
    cardBg: '#84312c', // Brick crimson red from user image
    borderColor: '#ef4444', // Red border
    accentColor: '#f87171',
    badgeBg: 'bg-red-950/90',
    badgeText: 'text-red-300',
    badgeBorder: 'border-red-500/80',
  },
  MINION: {
    role: 'MINION',
    nameTh: 'ลูกสมุนหมาป่า',
    nameEn: 'Minion',
    shortNameTh: 'สมุนหมาป่า',
    faction: 'WEREWOLF',
    factionLabelTh: 'ฝ่ายรัตติกาล',
    cardBg: '#963b46', // Dusty rose-burgundy from user image
    borderColor: '#fb7185', // Rose coral border
    accentColor: '#fda4af',
    badgeBg: 'bg-rose-950/90',
    badgeText: 'text-rose-300',
    badgeBorder: 'border-rose-400/80',
  },
  BODYGUARD: {
    role: 'BODYGUARD',
    nameTh: 'บอดี้การ์ด',
    nameEn: 'Bodyguard',
    shortNameTh: 'การ์ด',
    faction: 'VILLAGER',
    factionLabelTh: 'ฝ่ายชาวบ้าน',
    cardBg: '#33583f', // Forest moss-green from user image
    borderColor: '#4ade80', // Mint green border
    accentColor: '#86efac',
    badgeBg: 'bg-emerald-950/90',
    badgeText: 'text-emerald-300',
    badgeBorder: 'border-emerald-500/80',
  },
  SEER: {
    role: 'SEER',
    nameTh: 'ผู้หยั่งรู้ (แม่หมอ)',
    nameEn: 'Seer',
    shortNameTh: 'แม่หมอ',
    faction: 'VILLAGER',
    factionLabelTh: 'ฝ่ายชาวบ้าน',
    cardBg: '#523467', // Mystical violet plum from user image
    borderColor: '#c084fc', // Purple border
    accentColor: '#e9d5ff',
    badgeBg: 'bg-purple-950/90',
    badgeText: 'text-purple-300',
    badgeBorder: 'border-purple-400/80',
  },
  WITCH: {
    role: 'WITCH',
    nameTh: 'แม่มด',
    nameEn: 'Witch',
    shortNameTh: 'แม่มด',
    faction: 'VILLAGER',
    factionLabelTh: 'ฝ่ายชาวบ้าน',
    cardBg: '#623473', // Royal magenta/plum from user image
    borderColor: '#d946ef', // Fuchsia violet border
    accentColor: '#f0abfc',
    badgeBg: 'bg-fuchsia-950/90',
    badgeText: 'text-fuchsia-300',
    badgeBorder: 'border-fuchsia-400/80',
  },
  HUNTER: {
    role: 'HUNTER',
    nameTh: 'นายพราน',
    nameEn: 'Hunter',
    shortNameTh: 'นายพราน',
    faction: 'VILLAGER',
    factionLabelTh: 'ฝ่ายชาวบ้าน',
    cardBg: '#234b55', // Slate teal/cyan from user image
    borderColor: '#22d3ee', // Bright cyan border
    accentColor: '#67e8f9',
    badgeBg: 'bg-cyan-950/90',
    badgeText: 'text-cyan-300',
    badgeBorder: 'border-cyan-400/80',
  },
  FOOL: {
    role: 'FOOL',
    nameTh: 'คนบ้า (โจ๊กเกอร์)',
    nameEn: 'Fool',
    shortNameTh: 'คนบ้า',
    faction: 'NEUTRAL',
    factionLabelTh: 'ฝ่ายอิสระ',
    cardBg: '#845325', // Warm ochre brown from user image
    borderColor: '#f59e0b', // Amber gold border
    accentColor: '#fcd34d',
    badgeBg: 'bg-amber-950/90',
    badgeText: 'text-amber-300',
    badgeBorder: 'border-amber-400/80',
  },
  VILLAGER: {
    role: 'VILLAGER',
    nameTh: 'ชาวบ้าน',
    nameEn: 'Villager',
    shortNameTh: 'ชาวบ้าน',
    faction: 'VILLAGER',
    factionLabelTh: 'ฝ่ายชาวบ้าน',
    cardBg: '#283f58', // Slate midnight blue from user image
    borderColor: '#38bdf8', // Sky blue border
    accentColor: '#93c5fd',
    badgeBg: 'bg-sky-950/90',
    badgeText: 'text-sky-300',
    badgeBorder: 'border-sky-400/80',
  },
};

/**
 * High-fidelity Vector Artwork matching the user reference image (1792393082533.jpg)
 */
export const RoleCharacterArt: React.FC<{ role: RoleType; className?: string }> = ({
  role,
  className = 'w-full h-full',
}) => {
  switch (role) {
    // 1. WEREWOLF: Snarling brown wolf, red glowing eyes, sharp white fangs, ruffled fur
    case 'WEREWOLF':
      return (
        <svg viewBox="0 0 160 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="wolfEyeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ff4d4d" stopOpacity="1" />
              <stop offset="60%" stopColor="#dc2626" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#991b1b" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* Fur Mane Outlines & Body Hatching */}
          <path
            d="M30 195 C25 155 35 120 48 95 C40 85 30 75 22 55 C38 60 50 68 56 75 C60 52 72 35 80 20 C88 35 100 52 104 75 C110 68 122 60 138 55 C130 75 120 85 112 95 C125 120 135 155 130 195 Z"
            fill="#3e231b"
            stroke="#1a0c07"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* Inner Shaggy Fur Texture */}
          <path d="M42 125 L58 135 L45 148 L62 158 L48 175" stroke="#1c0e08" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M118 125 L102 135 L115 148 L98 158 L112 175" stroke="#1c0e08" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M70 145 L80 155 L90 145 L80 168 Z" fill="#2b1610" />
          
          {/* Werewolf Head */}
          <path
            d="M50 78 C40 92 42 115 54 125 C62 132 70 135 80 135 C90 135 98 132 106 125 C118 115 120 92 110 78 C100 68 88 65 80 65 C72 65 60 68 50 78 Z"
            fill="#523125"
            stroke="#1a0c07"
            strokeWidth="3.5"
          />
          {/* Forehead & Brow Wrinkles */}
          <path d="M64 74 L80 82 L96 74" stroke="#24110a" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M68 84 L80 90 L92 84" stroke="#24110a" strokeWidth="2" strokeLinecap="round" />
          
          {/* Snarling Wolf Snout & Nose */}
          <path d="M72 100 L80 96 L88 100 L84 107 L76 107 Z" fill="#140a06" stroke="#000" strokeWidth="1.5" />
          
          {/* Open Vicious Jaws */}
          <path
            d="M62 112 C70 108 90 108 98 112 C96 128 88 134 80 134 C72 134 64 128 62 112 Z"
            fill="#7f1d1d"
            stroke="#1a0c07"
            strokeWidth="2.5"
          />
          {/* Razor Sharp White Fangs */}
          <polygon points="65,112 68,124 72,112" fill="#fff" stroke="#111" strokeWidth="1" />
          <polygon points="95,112 92,124 88,112" fill="#fff" stroke="#111" strokeWidth="1" />
          <polygon points="74,112 77,120 80,112" fill="#fff" />
          <polygon points="86,112 83,120 80,112" fill="#fff" />
          {/* Lower Fangs */}
          <polygon points="70,132 73,123 76,132" fill="#fff" stroke="#111" strokeWidth="1" />
          <polygon points="90,132 87,123 84,132" fill="#fff" stroke="#111" strokeWidth="1" />

          {/* Glowing Red Eyes with Intense Glares */}
          <ellipse cx="66" cy="92" rx="6" ry="4" fill="url(#wolfEyeGlow)" />
          <ellipse cx="94" cy="92" rx="6" ry="4" fill="url(#wolfEyeGlow)" />
          <circle cx="66" cy="92" r="2.5" fill="#fef08a" />
          <circle cx="94" cy="92" r="2.5" fill="#fef08a" />
          <circle cx="66.8" cy="91.5" r="1" fill="#fff" />
          <circle cx="94.8" cy="91.5" r="1" fill="#fff" />
        </svg>
      );

    // 2. MINION: Hooded cunning gremlin in burgundy cowl, sly sideways eyes, mischievous smirk, fists up
    case 'MINION':
      return (
        <svg viewBox="0 0 160 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Shadow Behind */}
          <ellipse cx="80" cy="188" rx="45" ry="8" fill="#180a0e" opacity="0.4" />
          {/* Dark Burgundy Cloak Body */}
          <path
            d="M48 190 C42 165 46 142 56 128 C64 120 72 118 80 118 C88 118 96 120 104 128 C114 142 118 165 112 190 Z"
            fill="#451821"
            stroke="#1a060a"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* Clenched Gloved Fists Held Up in Stance */}
          <circle cx="62" cy="148" r="10" fill="#2d0f15" stroke="#150508" strokeWidth="2.5" />
          <path d="M57 144 C60 142 66 142 68 146" stroke="#501c27" strokeWidth="2" strokeLinecap="round" />
          <circle cx="98" cy="148" r="10" fill="#2d0f15" stroke="#150508" strokeWidth="2.5" />
          <path d="M93 144 C96 142 102 142 104 146" stroke="#501c27" strokeWidth="2" strokeLinecap="round" />

          {/* Deep Dark Hooded Cowl with Peak */}
          <path
            d="M80 32 C92 48 122 72 120 106 C118 126 102 136 80 136 C58 136 42 126 40 106 C38 72 68 48 80 32 Z"
            fill="#5c1d29"
            stroke="#1a060a"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* Inner Shadow of Cowl */}
          <path
            d="M80 46 C90 60 112 80 108 108 C104 122 92 128 80 128 C68 128 56 122 52 108 C48 80 70 60 80 46 Z"
            fill="#18070b"
          />

          {/* Pale Sly Face Peeking from Hood */}
          <path
            d="M62 88 C62 76 70 70 80 70 C90 70 98 76 98 88 C98 102 90 114 80 114 C70 114 62 102 62 88 Z"
            fill="#fecdd3"
          />
          {/* Pointy Nose */}
          <path d="M78 86 L86 94 L79 96" fill="#f43f5e" stroke="#881337" strokeWidth="1.5" strokeLinejoin="round" />
          
          {/* Devious Smirking Mouth */}
          <path d="M72 104 Q80 110 88 102" fill="none" stroke="#881337" strokeWidth="2.5" strokeLinecap="round" />
          
          {/* Sly Narrowed Eyes Looking Sideways */}
          <path d="M66 84 Q74 80 78 86" stroke="#1c070b" strokeWidth="2.5" strokeLinecap="round" />
          <ellipse cx="73" cy="86" rx="2.5" ry="3.5" fill="#1c070b" />
          <circle cx="74" cy="85" r="1" fill="#fff" />
          <path d="M84 86 Q88 80 96 84" stroke="#1c070b" strokeWidth="2.5" strokeLinecap="round" />
          <ellipse cx="89" cy="86" rx="2.5" ry="3.5" fill="#1c070b" />
          <circle cx="90" cy="85" r="1" fill="#fff" />
        </svg>
      );

    // 3. BODYGUARD: Muscular buzzcut bouncer with crossed arms, glowing neon mint shield with hand emblem
    case 'BODYGUARD':
      return (
        <svg viewBox="0 0 160 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="neonShieldGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Broad Muscular Shoulders & Dark Shirt Body */}
          <path
            d="M32 190 L32 135 C32 108 52 98 80 98 C108 98 128 108 128 135 L128 190 Z"
            fill="#18271e"
            stroke="#0a120c"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* Muscular Arms Folded Across Chest */}
          <path
            d="M38 140 C42 165 72 175 80 175 C88 175 118 165 122 140 C114 135 102 140 80 148 C58 140 46 135 38 140 Z"
            fill="#a16207"
            stroke="#0a120c"
            strokeWidth="3"
          />

          {/* Thick Strong Neck */}
          <path d="M68 85 L68 106 L92 106 L92 85 Z" fill="#ca8a04" stroke="#0a120c" strokeWidth="2.5" />

          {/* Square Strong Jaw Head */}
          <path
            d="M62 48 C62 38 70 30 80 30 C90 30 98 38 98 48 C98 68 94 85 80 85 C66 85 62 68 62 48 Z"
            fill="#eab308"
            stroke="#0a120c"
            strokeWidth="3"
          />
          {/* Buzzcut Hair */}
          <path d="M62 44 C64 34 70 28 80 28 C90 28 96 34 98 44 Z" fill="#1f2937" stroke="#0a120c" strokeWidth="2" />
          {/* Heavy Brow & Stern Eyes */}
          <path d="M68 52 L76 55 L84 52" stroke="#0a120c" strokeWidth="3" strokeLinecap="round" />
          <path d="M84 52 L92 55 L96 52" stroke="#0a120c" strokeWidth="3" strokeLinecap="round" />
          <circle cx="72" cy="58" r="2" fill="#0a120c" />
          <circle cx="88" cy="58" r="2" fill="#0a120c" />
          {/* Stern Closed Mouth */}
          <line x1="74" y1="74" x2="86" y2="74" stroke="#0a120c" strokeWidth="2.5" strokeLinecap="round" />

          {/* Iconic Glowing Neon Mint Shield with Hand Emblem */}
          <g filter="url(#neonShieldGlow)">
            <path
              d="M80 106 L108 118 V146 C108 168 94 180 80 186 C66 180 52 168 52 146 V118 L80 106 Z"
              fill="#062e1b"
              fillOpacity="0.85"
              stroke="#4ade80"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            {/* Inner Raised Protective Hand Outline */}
            <path
              d="M74 156 L74 136 C74 134 76 132 78 132 C80 132 82 134 82 136 V148 M82 136 V130 C82 128 84 126 86 126 C88 126 90 128 90 130 V148 M70 144 C70 142 72 140 74 140 M70 146 L70 156 C70 162 76 168 82 168 C88 168 94 162 94 156 V138 C94 136 92 134 90 134 C88 134 86 136 86 138"
              stroke="#86efac"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </svg>
      );

    // 4. SEER: Cloaked mystic sorceress, glowing third eye on forehead, hands over glowing violet crystal ball
    case 'SEER':
      return (
        <svg viewBox="0 0 160 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="crystalBallGlow" cx="45%" cy="40%" r="55%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="35%" stopColor="#e9d5ff" stopOpacity="1" />
              <stop offset="70%" stopColor="#a855f7" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#6b21a8" stopOpacity="0.8" />
            </radialGradient>
            <filter id="seerVioletGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Flowing Violet Mystic Cowl / Robe */}
          <path
            d="M30 195 C28 150 42 98 56 70 C64 54 72 40 80 32 C88 40 96 54 104 70 C118 98 132 150 130 195 Z"
            fill="#321c42"
            stroke="#13081c"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Serene Face of Seer */}
          <path
            d="M66 65 C66 52 72 48 80 48 C88 48 94 52 94 65 C94 80 88 92 80 92 C72 92 66 80 66 65 Z"
            fill="#e9d5ff"
            stroke="#13081c"
            strokeWidth="2.5"
          />
          {/* Eyes & Mystical Gaze */}
          <path d="M70 66 Q74 62 77 66" stroke="#2e1065" strokeWidth="2" strokeLinecap="round" />
          <path d="M83 66 Q86 62 90 66" stroke="#2e1065" strokeWidth="2" strokeLinecap="round" />
          <circle cx="73.5" cy="67" r="1.5" fill="#a855f7" />
          <circle cx="86.5" cy="67" r="1.5" fill="#a855f7" />
          <path d="M76 80 Q80 83 84 80" stroke="#7e22ce" strokeWidth="1.8" strokeLinecap="round" />

          {/* GLOWING THIRD EYE ON FOREHEAD */}
          <g filter="url(#seerVioletGlow)">
            <ellipse cx="80" cy="56" rx="4.5" ry="2.5" fill="#fdf4ff" stroke="#c084fc" strokeWidth="1.5" />
            <circle cx="80" cy="56" r="1.5" fill="#7e22ce" />
          </g>

          {/* Hands Hovering Gracefully Over Crystal Ball */}
          <path
            d="M48 130 C56 122 66 120 72 126 C68 132 60 138 52 142 Z"
            fill="#e9d5ff"
            stroke="#13081c"
            strokeWidth="2"
          />
          <path
            d="M112 130 C104 122 94 120 88 126 C92 132 100 138 108 142 Z"
            fill="#e9d5ff"
            stroke="#13081c"
            strokeWidth="2"
          />

          {/* Ornate Crystal Ball Pedestal / Stand */}
          <path d="M68 178 L92 178 L88 190 L72 190 Z" fill="#1c0f24" stroke="#0e0414" strokeWidth="2.5" />
          <path d="M74 165 L86 165 L88 178 L72 178 Z" fill="#2d173b" stroke="#0e0414" strokeWidth="2" />

          {/* GLOWING PURPLE CRYSTAL BALL */}
          <g filter="url(#seerVioletGlow)">
            <circle cx="80" cy="144" r="24" fill="url(#crystalBallGlow)" stroke="#f3e8ff" strokeWidth="2.5" />
            {/* Internal Shimmer */}
            <ellipse cx="73" cy="136" rx="6" ry="3.5" transform="rotate(-30 73 136)" fill="#ffffff" opacity="0.85" />
            <circle cx="71" cy="142" r="1.5" fill="#ffffff" opacity="0.9" />
          </g>
        </svg>
      );

    // 5. WITCH: Classic grinning hooked-nose witch in crooked pointed hat, holding bubbling potion flask
    case 'WITCH':
      return (
        <svg viewBox="0 0 160 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="witchElixirGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Witch Robe Body */}
          <path
            d="M38 190 C34 160 44 140 56 128 C64 120 72 118 80 118 C88 118 96 120 104 128 C116 140 126 160 122 190 Z"
            fill="#34123d"
            stroke="#120417"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Left Arm Holding Flask */}
          <path d="M100 135 L118 145 L120 158" stroke="#f472b6" strokeWidth="8" strokeLinecap="round" />
          <path d="M100 135 L118 145 L120 158" stroke="#120417" strokeWidth="2" fill="none" />

          {/* Wicked Grinning Face with Hooked Nose */}
          <path
            d="M58 88 C58 72 68 64 78 64 C88 64 94 72 94 88 C94 106 84 116 74 116 C64 116 58 106 58 88 Z"
            fill="#fbcfe8"
            stroke="#120417"
            strokeWidth="3"
          />
          {/* Big Hooked Witch Nose */}
          <path d="M76 82 C88 84 94 92 88 98 C82 100 78 94 76 92" fill="#f472b6" stroke="#831843" strokeWidth="2" strokeLinejoin="round" />
          {/* Cunning Eyes */}
          <path d="M66 80 Q72 75 78 80" stroke="#120417" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="72" cy="82" r="2.5" fill="#120417" />
          {/* Wicked Smirk with Single Tooth */}
          <path d="M68 102 Q78 112 88 100" stroke="#831843" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <polygon points="76,104 79,104 77.5,108" fill="#fff" />

          {/* Wild Grey Locks under Hat */}
          <path d="M52 86 C48 98 52 115 56 125" stroke="#e5e7eb" strokeWidth="3" strokeLinecap="round" />
          <path d="M46 95 C44 108 48 122 52 130" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" />

          {/* Iconic Crooked Pointed Witch Hat with Buckle */}
          <ellipse cx="76" cy="65" rx="42" ry="10" transform="rotate(-6 76 65)" fill="#1c0924" stroke="#0a020d" strokeWidth="3.5" />
          <path
            d="M48 64 L74 16 C76 14 82 22 80 34 L92 61 Z"
            fill="#2c0e38"
            stroke="#0a020d"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* Hat Ribbon & Buckle */}
          <path d="M54 62 L90 58 L92 63 L56 67 Z" fill="#a21caf" />
          <rect x="68" y="58" width="10" height="7" fill="#fbbf24" stroke="#78350f" strokeWidth="1" />

          {/* Bubbling Magic Potion Flask */}
          <g filter="url(#witchElixirGlow)" transform="translate(112, 140)">
            {/* Glass Neck & Lip */}
            <rect x="8" y="0" width="8" height="12" fill="#c084fc" opacity="0.4" stroke="#fdf4ff" strokeWidth="1.5" />
            <ellipse cx="12" cy="0" rx="6" ry="2" fill="#e879f9" stroke="#fdf4ff" strokeWidth="1.2" />
            {/* Conical Flask Body */}
            <path d="M8 12 L0 36 C-2 42 4 46 12 46 C20 46 26 42 24 36 L16 12 Z" fill="#24072b" stroke="#fdf4ff" strokeWidth="2" strokeLinejoin="round" />
            {/* Glowing Pink/Red Bubbling Elixir */}
            <path d="M3 24 L0 36 C-2 42 4 46 12 46 C20 46 26 42 24 36 L21 24 Z" fill="#f43f5e" />
            <circle cx="8" cy="34" r="3" fill="#fda4af" />
            <circle cx="15" cy="38" r="2" fill="#fff" />
            <circle cx="12" cy="28" r="1.5" fill="#fbcfe8" />
            {/* Floating Magical Bubbles */}
            <circle cx="12" cy="-6" r="3" fill="#f472b6" opacity="0.9" />
            <circle cx="18" cy="-14" r="2" fill="#f472b6" opacity="0.75" />
          </g>
        </svg>
      );

    // 6. HUNTER: Sniper/hunter in jacket aiming scoped rifle, viewed through glowing electric cyan crosshair with red dot
    case 'HUNTER':
      return (
        <svg viewBox="0 0 160 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="sniperScopeGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3.5" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Hunter Trenchcoat / Jacket */}
          <path
            d="M34 190 C32 145 44 115 58 105 C66 100 74 98 80 98 C86 98 94 100 102 105 C116 115 128 145 126 190 Z"
            fill="#12252a"
            stroke="#071114"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Focused Hunter Head Aiming Down Sight */}
          <path
            d="M65 52 C65 40 71 34 80 34 C89 34 95 40 95 52 C95 68 89 78 80 78 C71 78 65 68 65 52 Z"
            fill="#fed7aa"
            stroke="#071114"
            strokeWidth="3"
          />
          {/* Short Dark Trimmed Hair */}
          <path d="M65 48 C68 36 74 30 82 30 C90 30 96 36 96 48 Z" fill="#1e293b" />
          {/* Intense Squinting One-Eye Aim */}
          <line x1="68" y1="54" x2="78" y2="54" stroke="#071114" strokeWidth="2.5" strokeLinecap="round" />
          <ellipse cx="88" cy="54" rx="3.5" ry="2.5" fill="#071114" />
          <circle cx="89" cy="53.5" r="1" fill="#fff" />
          {/* Firm Tight Lips */}
          <line x1="74" y1="68" x2="84" y2="68" stroke="#071114" strokeWidth="2" strokeLinecap="round" />

          {/* Hunting Rifle Aimed Directly Forward with Telescopic Scope */}
          <g>
            {/* Long Rifle Barrel & Wooden Stock */}
            <path d="M25 152 L135 122 L136 128 L25 160 Z" fill="#451a03" stroke="#0a0502" strokeWidth="2" />
            <rect x="75" y="118" width="55" height="7" transform="rotate(-14 75 118)" fill="#334155" stroke="#0f172a" strokeWidth="2" />
            {/* Telescopic Scope Mounted on Top */}
            <rect x="85" y="108" width="35" height="6" transform="rotate(-14 85 108)" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
          </g>

          {/* GLOWING CYAN SNIPER SCOPE CROSSHAIR WITH RED DOT */}
          <g filter="url(#sniperScopeGlow)" transform="translate(80, 132)">
            {/* Outer Cyan Targeting Circle */}
            <circle cx="0" cy="0" r="34" stroke="#22d3ee" strokeWidth="3" fill="none" />
            {/* Inner Precision Circle */}
            <circle cx="0" cy="0" r="18" stroke="#67e8f9" strokeWidth="1.8" strokeDasharray="4 3" fill="none" />
            {/* Crosshair Lines with Center Gap */}
            <line x1="0" y1="-42" x2="0" y2="-12" stroke="#22d3ee" strokeWidth="2.5" />
            <line x1="0" y1="12" x2="0" y2="42" stroke="#22d3ee" strokeWidth="2.5" />
            <line x1="-42" y1="0" x2="-12" y2="0" stroke="#22d3ee" strokeWidth="2.5" />
            <line x1="12" y1="0" x2="42" y2="0" stroke="#22d3ee" strokeWidth="2.5" />
            {/* Glowing Red Laser Dot */}
            <circle cx="0" cy="0" r="4.5" fill="#ef4444" stroke="#fecaca" strokeWidth="1.5" />
          </g>
        </svg>
      );

    // 7. FOOL (JOKER): Crazed grinning jester in crooked gold crown, wide manic bulging eyes, toothy grin, wild hands
    case 'FOOL':
      return (
        <svg viewBox="0 0 160 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Crazed Jester Body Hunching Forward */}
          <path
            d="M38 190 C34 150 48 125 60 115 C68 108 74 106 80 106 C86 106 92 108 100 115 C112 125 126 150 122 190 Z"
            fill="#522f13"
            stroke="#1d1005"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Manic Gesturing Hands with Splayed Fingers */}
          {/* Left Hand */}
          <path
            d="M45 135 L34 122 M44 140 L30 134 M45 146 L32 148 M48 152 L40 160"
            stroke="#d97706"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Right Hand */}
          <path
            d="M115 135 L126 122 M116 140 L130 134 M115 146 L128 148 M112 152 L120 160"
            stroke="#d97706"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Deranged Grinning Head */}
          <path
            d="M62 60 C62 46 70 38 80 38 C90 38 98 46 98 60 C98 84 92 98 80 98 C68 98 62 84 62 60 Z"
            fill="#fde68a"
            stroke="#1d1005"
            strokeWidth="3"
          />

          {/* Wild Disheveled Hair */}
          <path d="M56 55 L50 44 L62 46 L60 35 L70 40" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
          <path d="M104 55 L110 44 L98 46 L100 35 L90 40" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />

          {/* Crooked Gold Crown Tilted Sideways */}
          <g transform="rotate(-15 80 32)">
            <path
              d="M65 34 L62 14 L72 24 L80 10 L88 24 L98 14 L95 34 Z"
              fill="#fbbf24"
              stroke="#78350f"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Crown Jewels */}
            <circle cx="62" cy="14" r="2.5" fill="#ef4444" />
            <circle cx="80" cy="10" r="3" fill="#3b82f6" />
            <circle cx="98" cy="14" r="2.5" fill="#10b981" />
          </g>

          {/* Wide Manic Bulging Eyes (Uneven) */}
          <circle cx="70" cy="62" r="8" fill="#fff" stroke="#1d1005" strokeWidth="2" />
          <circle cx="90" cy="61" r="9" fill="#fff" stroke="#1d1005" strokeWidth="2" />
          {/* Dilated pupils looking slightly different directions */}
          <circle cx="71" cy="62" r="3" fill="#1d1005" />
          <circle cx="89" cy="61" r="3.5" fill="#1d1005" />
          <circle cx="72" cy="61" r="1" fill="#fff" />
          <circle cx="90" cy="60" r="1" fill="#fff" />

          {/* Giant Crazed Toothy Grin */}
          <path
            d="M64 78 Q80 96 96 78 Z"
            fill="#7f1d1d"
            stroke="#1d1005"
            strokeWidth="2.5"
          />
          {/* Teeth Line */}
          <line x1="66" y1="83" x2="94" y2="83" stroke="#fff" strokeWidth="3.5" />
          <line x1="72" y1="80" x2="72" y2="86" stroke="#1d1005" strokeWidth="1.5" />
          <line x1="80" y1="80" x2="80" y2="87" stroke="#1d1005" strokeWidth="1.5" />
          <line x1="88" y1="80" x2="88" y2="86" stroke="#1d1005" strokeWidth="1.5" />
        </svg>
      );

    // 8. VILLAGER: Frightened innocent peasant holding up a warm glowing brass lantern in dark night
    case 'VILLAGER':
    default:
      return (
        <svg viewBox="0 0 160 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="lanternWarmGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="25%" stopColor="#fef08a" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
            </radialGradient>
            <filter id="lanternBloom" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="5" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Frightened Peasant Body in Humble Linen Tunic */}
          <path
            d="M32 195 C28 150 42 120 54 110 C62 104 70 102 76 102 C84 102 92 106 98 114 C104 125 110 150 108 195 Z"
            fill="#1e2c3d"
            stroke="#0b121a"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Arm Holding Lantern Up */}
          <path d="M92 120 L115 110 L122 125" stroke="#fbcfe8" strokeWidth="7" strokeLinecap="round" />
          <path d="M92 120 L115 110 L122 125" stroke="#0b121a" strokeWidth="2" fill="none" />

          {/* Left Defensive Arm Held to Chest */}
          <path d="M46 142 C54 135 64 140 68 152" stroke="#fbcfe8" strokeWidth="6" strokeLinecap="round" />

          {/* Frightened Innocent Face */}
          <path
            d="M60 62 C60 48 66 42 75 42 C84 42 90 48 90 62 C90 78 84 88 75 88 C66 88 60 78 60 62 Z"
            fill="#fed7aa"
            stroke="#0b121a"
            strokeWidth="3"
          />
          {/* Simple Peasant Bowl Haircut */}
          <path d="M58 58 C60 42 66 36 76 36 C86 36 92 42 92 58 Z" fill="#451a03" />

          {/* Worried Angled Eyebrows & Fearful Wide Eyes */}
          <path d="M64 56 L72 52" stroke="#0b121a" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M86 56 L78 52" stroke="#0b121a" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="68" cy="62" r="4" fill="#fff" stroke="#0b121a" strokeWidth="1.8" />
          <circle cx="82" cy="62" r="4" fill="#fff" stroke="#0b121a" strokeWidth="1.8" />
          <circle cx="68.5" cy="62" r="2" fill="#0b121a" />
          <circle cx="82.5" cy="62" r="2" fill="#0b121a" />
          {/* Shivering Trembling Mouth */}
          <path d="M70 78 Q75 75 80 78" stroke="#7c2d12" strokeWidth="2" fill="none" strokeLinecap="round" />

          {/* WARM GLOWING KEROSENE LANTERN CASTING LIGHT */}
          <g transform="translate(120, 115)">
            {/* Ambient Warm Glow Bloom */}
            <circle cx="6" cy="22" r="32" fill="url(#lanternWarmGlow)" filter="url(#lanternBloom)" opacity="0.85" />
            {/* Lantern Top Loop & Cap */}
            <circle cx="6" cy="-2" r="5" fill="none" stroke="#78350f" strokeWidth="2.5" />
            <path d="M-2 4 L14 4 L10 8 L2 8 Z" fill="#92400e" stroke="#451a03" strokeWidth="1.5" />
            {/* Glass Chamber with Flame */}
            <rect x="0" y="8" width="12" height="20" rx="3" fill="#fef08a" fillOpacity="0.4" stroke="#78350f" strokeWidth="2" />
            {/* Center Burning Candle Flame */}
            <ellipse cx="6" cy="18" rx="3" ry="5" fill="#f59e0b" />
            <ellipse cx="6" cy="19" rx="1.5" ry="3" fill="#ffffff" />
            {/* Lantern Brass Base */}
            <rect x="-2" y="28" width="16" height="6" rx="2" fill="#92400e" stroke="#451a03" strokeWidth="2" />
          </g>
        </svg>
      );
  }
};

/**
 * Standard Role Art Card matching the user's reference image 1:1
 */
export const RoleArtCard: React.FC<{
  role: RoleType;
  showLabels?: boolean;
  className?: string;
  onClick?: () => void;
  selected?: boolean;
}> = ({ role, showLabels = true, className = '', onClick, selected = false }) => {
  const theme = ROLE_CARD_THEMES[role] || ROLE_CARD_THEMES.VILLAGER;

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      style={{
        backgroundColor: theme.cardBg,
        borderColor: theme.borderColor,
      }}
      className={`relative rounded-[22px] sm:rounded-[26px] border-[3.5px] p-2 flex flex-col items-center justify-between overflow-hidden shadow-xl select-none transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:scale-[1.03] active:scale-[0.98]' : ''
      } ${
        selected ? 'ring-4 ring-amber-400 ring-offset-2 ring-offset-[#101216]' : ''
      } ${className}`}
    >
      {/* Paper Cardstock Subtle Texture & Edge Vignette */}
      <div className="absolute inset-0 bg-radial from-transparent via-black/10 to-black/45 pointer-events-none rounded-[18px]" />

      {/* Top Banner (Optional for small/compact previews) */}
      {showLabels && (
        <div className="relative z-10 w-full flex items-center justify-between text-[10px] font-bold px-1 pt-0.5">
          <span className="text-zinc-100 font-mono-num drop-shadow tracking-wider">
            {theme.nameEn.toUpperCase()}
          </span>
          <span
            className={`px-1.5 py-0.2 rounded font-black text-[9px] border ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`}
          >
            {theme.shortNameTh}
          </span>
        </div>
      )}

      {/* Center Hand-Drawn Character Artwork */}
      <div className="relative z-10 w-full flex-1 flex items-center justify-center my-auto p-1">
        <RoleCharacterArt role={role} className="w-full h-full max-h-[160px] drop-shadow-md" />
      </div>

      {/* Bottom Thai Role Name */}
      {showLabels && (
        <div className="relative z-10 w-full text-center pb-0.5">
          <div className="inline-block px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-xs border border-white/15 text-[11px] sm:text-xs font-black text-white drop-shadow">
            {theme.nameTh}
          </div>
        </div>
      )}
    </div>
  );
};
