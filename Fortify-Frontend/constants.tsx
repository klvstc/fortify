import React, { SVGProps } from 'react';
import { type Rank, type Badge, type StoryChapter, type Reward, type BadgeConditionContext, type MentorPersona, type MentorArticle, type LifeAttribute, type IconType, type BrainRewiringComponent } from './types';

// VAPID public key is no longer needed on the client-side for FCM.
// The key from the Firebase Console is now used in firebase-config.ts for getToken().

const IconBase: React.FC<SVGProps<SVGSVGElement>> = ({ children, ...rest }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...rest}
  >
    {children}
  </svg>
);

// --- NEW ICON SET V3.0 ---

// --- REDESIGNED RANK ICONS (V4) ---
const NoviceIcon: IconType = (props) => (
  <IconBase {...props}>
    <defs>
      <radialGradient id="noviceSeedGlow" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0%" stopColor="currentColor" stopOpacity="0.7"/>
        <stop offset="100%" stopColor="currentColor" stopOpacity="0"/>
      </radialGradient>
    </defs>
    <path d="M12 12m-8 0a8 8 0 1 0 16 0a8 8 0 1 0-16 0" fill="url(#noviceSeedGlow)" />
    <path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" fill="currentColor"/>
    <path d="M12 2a10 10 0 0 0-10 10c0 .55.04 1.09.13 1.62" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6"/>
  </IconBase>
);
const ApprenticeIcon: IconType = (props) => (
  <IconBase {...props}>
    <defs>
      <linearGradient id="apprenticeSapling" x1="0.5" y1="0" x2="0.5" y2="1">
        <stop offset="0%" stopColor="currentColor" stopOpacity="0.4"/>
        <stop offset="100%" stopColor="currentColor" stopOpacity="0.8"/>
      </linearGradient>
    </defs>
    <path d="M12 14v8M9 22h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M17 8c0 4-4 6-5 6s-5-2-5-6c0-2.21 1.79-4 4-4h2c2.21 0 4 1.79 4 4z" fill="url(#apprenticeSapling)"/>
  </IconBase>
);
const AdeptIcon: IconType = (props) => (
  <IconBase {...props}>
    <path d="M12 21.5c-4.42 0-8-1.12-8-2.5s3.58-2.5 8-2.5 8 1.12 8 2.5-3.58 2.5-8 2.5z" fill="currentColor" opacity="0.4"/>
    <path d="M12 16.5c-3.87 0-7-1.12-7-2.5s3.13-2.5 7-2.5 7 1.12 7 2.5-3.13 2.5-7 2.5z" fill="currentColor" opacity="0.6"/>
    <path d="M12 11.5c-3.31 0-6-1.12-6-2.5s2.69-2.5 6-2.5 6 1.12 6 2.5-2.69 2.5-6 2.5z" fill="currentColor"/>
  </IconBase>
);
const GuardianIcon: IconType = (props) => (
  <IconBase {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="currentColor" opacity="0.2"/>
    <path d="M12 2L4 5v7c0 6 8 10 8 10s8-4 8-10V5L12 2z" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M12 7l4 4-4 7-4-7 4-4z" fill="currentColor" opacity="0.6"/>
  </IconBase>
);
const KnightIcon: IconType = (props) => (
  <IconBase {...props}>
    <defs>
      <linearGradient id="metalShineKnight" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="white" stopOpacity="0.2"/>
        <stop offset="100%" stopColor="black" stopOpacity="0.2"/>
      </linearGradient>
    </defs>
    <path d="M5 11l7-8 7 8v5a7 7 0 0 1-7 7 7 7 0 0 1-7-7v-5z" fill="currentColor" opacity="0.6"/>
    <path d="M5 11l7-8 7 8v5a7 7 0 0 1-7 7 7 7 0 0 1-7-7v-5z" fill="url(#metalShineKnight)"/>
    <path d="M12 11h8m-16 0h8m-4 0v12" stroke="currentColor" strokeWidth="2" fill="none"/>
  </IconBase>
);
const CommanderIcon: IconType = (props) => (
  <IconBase {...props}>
    <path d="M5 21V3h2v18H5z" fill="currentColor" opacity="0.5"/>
    <path d="M7 4h10l-4 4 4 4H7V4z" fill="currentColor"/>
    <path d="M7 4h10l-4 4 4 4H7V4z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
  </IconBase>
);
const SentinelIcon: IconType = (props) => (
  <IconBase {...props}>
    <defs>
      <radialGradient id="sentinelGlow" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0%" stopColor="currentColor" stopOpacity="0.8"/>
        <stop offset="100%" stopColor="currentColor" stopOpacity="0"/>
      </radialGradient>
    </defs>
    <path d="M4 9h16M4 15h16" stroke="currentColor" opacity="0.4"/>
    <path d="M12 4L4 9v6l8 5 8-5V9l-8-5z" stroke="currentColor" strokeWidth="2" fill="none"/>
    <circle cx="12" cy="12" r="3" fill="url(#sentinelGlow)"/>
  </IconBase>
);
const MasterIcon: IconType = (props) => (
  <IconBase {...props}>
    <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.1"/>
    <path d="M12 2v20M2 12h20" stroke="currentColor" strokeWidth="1" opacity="0.3"/>
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M12 2a10 10 0 0 0-7.07 2.93L12 12l-7.07 7.07A10 10 0 0 0 12 22a10 10 0 0 0 7.07-2.93L12 12l7.07-7.07A10 10 0 0 0 12 2z" stroke="currentColor" strokeWidth="2" fill="none"/>
  </IconBase>
);
export const GrandmasterIcon: IconType = (props) => (
  <IconBase {...props}>
    <defs>
      <linearGradient id="gemGradient" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="currentColor" stopOpacity="0.4"/>
        <stop offset="100%" stopColor="currentColor" stopOpacity="1"/>
      </linearGradient>
      <filter id="gemGlow">
          <feGaussianBlur stdDeviation="1.5" />
      </filter>
    </defs>
    <path d="M12 2L2 8v8l10 6 10-6V8L12 2z" fill="url(#gemGradient)" opacity="0.3" filter="url(#gemGlow)"/>
    <path d="M12 2L2 8v8l10 6 10-6V8L12 2z M12 2v20M2 8l10 6 10-6M2 16l10-6 10 6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
  </IconBase>
);
const LegendIcon: IconType = (props) => (
  <IconBase {...props}>
    <defs>
      <filter id="legendaryGlow">
        <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <g filter="url(#legendaryGlow)">
      <path d="M12 2l2.5 5 5.5 1-4 4.5 1 5.5L12 15l-5 3 1-5.5-4-4.5 5.5-1z" fill="currentColor" opacity="0.8"/>
      <circle cx="12" cy="2" r="1.5" fill="currentColor"/>
      <circle cx="19.5" cy="8" r="1.5" fill="currentColor"/>
      <circle cx="15.5" cy="17" r="1.5" fill="currentColor"/>
      <circle cx="8.5" cy="17" r="1.5" fill="currentColor"/>
      <circle cx="4.5" cy="8" r="1.5" fill="currentColor"/>
      <path d="M12 2l7.5 6-4 9-7 0-4-9z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" fill="none" opacity="0.4"/>
    </g>
  </IconBase>
);

// General UI Icons
export const LaurelWreathIcon: IconType = (props) => (
  <IconBase {...props}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="currentColor" opacity="0.3"/>
    <path d="M9.09 18.23c-2.43-1.13-4.09-3.53-4.09-6.23 0-1.85.71-3.56 1.88-4.85l1.41 1.41C7.5 9.53 7 10.71 7 12c0 2.03 1.13 3.8 2.81 4.77l-.72 1.46zM14.91 18.23l-.72-1.46C15.87 15.8 17 13.03 17 12c0-1.29-.5-2.47-1.28-3.32l1.41-1.41c1.17 1.29 1.87 2.99 1.87 4.73 0 2.7-1.66 5.1-4.09 6.23z"/>
  </IconBase>
);
export const LockClosedIcon: IconType = (props) => (
  <IconBase {...props}>
    <rect x="7" y="10" width="10" height="8" rx="1" fill="currentColor" opacity="0.4" />
    <path d="M12 3a4 4 0 0 0-4 4v2h8V7a4 4 0 0 0-4-4z" />
  </IconBase>
);
export const TrophyIcon: IconType = (props) => (
  <IconBase {...props}>
    <path d="M12 2a9 9 0 0 0-9 9c0 4.42 2.87 8.17 6.84 9.49.63.2 1.3.2 1.93 0C18.13 19.17 21 15.42 21 11a9 9 0 0 0-9-9z" fill="currentColor" opacity="0.3"/>
    <path d="M12 11.25a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3a.75.75 0 0 1 .75-.75z" />
    <path d="M12 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/>
    <path d="M15.5 15.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z" />
    <path d="M8.5 15.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z" />
  </IconBase>
);
export const JournalIcon: IconType = (props) => (
  <IconBase {...props}>
    <rect x="6" y="3" width="12" height="18" rx="2" fill="currentColor" opacity="0.3"/>
    <line x1="10" y1="7" x2="14" y2="7"/>
    <line x1="10" y1="11" x2="14" y2="11"/>
    <line x1="10" y1="15" x2="12" y2="15"/>
  </IconBase>
);
export const BrainIcon: IconType = (props) => (
    <IconBase {...props}>
      <defs>
          <radialGradient id="brainCoreGlow" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.6"/>
              <stop offset="100%" stopColor="currentColor" stopOpacity="0"/>
          </radialGradient>
      </defs>
      <path d="M12 2a10 10 0 0 0-7.07 17.07A10 10 0 0 0 12 22a10 10 0 0 0 7.07-2.93A10 10 0 0 0 12 2z" fill="currentColor" opacity="0.15" />
      <path d="M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0" fill="url(#brainCoreGlow)" />
      <path d="M12 2.5 A 4.5 4.5 0 0 1 16.5 7 M12 2.5 A 4.5 4.5 0 0 0 7.5 7 M7.5 7 C 5 7, 5 10, 7.5 12 S 10 14, 12 14 s 2-2, 4.5-2 s 2.5-3, 0-5 M16.5 7 C 19 7, 19 10, 16.5 12 M12 14 v 3 a 2 2 0 0 0 2 2 h 1 M12 14 v 3 a 2 2 0 0 1 -2 2 h -1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.8"/>
    </IconBase>
  );
export const AetherIcon: IconType = (props) => (
  <IconBase {...props}>
    <path d="M12 2.5l-10 6v9l10 6 10-6v-9l-10-6z" fill="currentColor" opacity="0.3" />
    <path d="M12 15.3l-10-6 10-6 10 6-10 6z" />
  </IconBase>
);
export const VaultIcon: IconType = (props) => (
  <IconBase {...props}>
    <rect x="4" y="8" width="16" height="12" rx="2" fill="currentColor" opacity="0.3" />
    <path d="M8 8V6a4 4 0 0 1 8 0v2" />
    <circle cx="12" cy="14" r="1.5" stroke="none" fill="currentColor"/>
  </IconBase>
);
export const PillarIcon: IconType = (props) => (
    <IconBase {...props}>
        <defs>
            <linearGradient id="pillarShade" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0"/>
                <stop offset="50%" stopColor="currentColor" stopOpacity="0.3"/>
                <stop offset="100%" stopColor="currentColor" stopOpacity="0"/>
            </linearGradient>
        </defs>
        <path d="M6 21h12" strokeWidth="2"/>
        <path d="M7 21V6h10v15" fill="currentColor" opacity="0.3"/>
        <rect x="7" y="6" width="10" height="15" fill="url(#pillarShade)"/>
        <path d="M6 5h12v2H6z M5 3h14v2H5z" fill="currentColor"/>
        <path d="M8 8v12 M10 8v12 M12 8v12 M14 8v12" stroke="currentColor" opacity="0.4" strokeWidth="1"/>
    </IconBase>
);
export const IdentityIcon: IconType = (props) => (
    <IconBase {...props}>
        <defs>
            <linearGradient id="chiselShine" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="white" stopOpacity="0.4"/>
                <stop offset="100%" stopColor="white" stopOpacity="0"/>
            </linearGradient>
        </defs>
        {/* Bust */}
        <path d="M16 8a4 4 0 1 0-8 0 4 4 0 0 0 8 0z M12 14c-4.42 0-8 1.79-8 4v2h16v-2c0-2.21-3.58-4-8-4z" fill="currentColor" opacity="0.4"/>
        {/* Chisel */}
        <path d="M17 13l4-4 -2-2 -4 4z" fill="currentColor" />
        <path d="M19 11l2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M17 13l4-4 -2-2 -4 4z" fill="url(#chiselShine)"/>
        {/* Chip */}
        <path d="M15 15l-1-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
    </IconBase>
);
export const VisionIcon: IconType = (props) => (
  <IconBase {...props}>
    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5C21.27 7.61 17 4.5 12 4.5z" fill="currentColor" opacity="0.3"/>
    <circle cx="12" cy="12" r="3" />
  </IconBase>
);
export const MonumentIcon: IconType = (props) => (
  <IconBase {...props}>
    <path d="M12 3L4 9v12h16V9l-8-6z" fill="currentColor" opacity="0.3"/>
    <path d="M10 21v-8h4v8" />
    <path d="M4 21h16" />
  </IconBase>
);
export const ShareIcon: IconType = (props) => (
  <IconBase {...props}>
    <circle cx="18" cy="5" r="3" fill="currentColor" opacity="0.3"/>
    <circle cx="6" cy="12" r="3" fill="currentColor" opacity="0.3"/>
    <circle cx="18" cy="19" r="3" fill="currentColor" opacity="0.3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </IconBase>
);
export const FlagIcon: IconType = (props) => (
  <IconBase {...props}>
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1v12z" />
    <line x1="4" y1="22" x2="4" y2="15" />
  </IconBase>
);
export const WarningIcon: IconType = (props) => (
  <IconBase {...props}>
    <path d="M12 2L2 22h20L12 2z" fill="currentColor" opacity="0.3"/>
    <path d="M11 10h2v5h-2z" />
    <path d="M11 16h2v2h-2z" />
  </IconBase>
);
export const ShieldIcon: IconType = (props) => (
  <IconBase {...props}>
    <path d="M12 2L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" fill="currentColor" opacity="0.3" />
    <path d="M11 15h2v2h-2zm0-8h2v6h-2z" stroke="none" fill="currentColor"/>
  </IconBase>
);
export const JabraEarbudsIcon: IconType = (props) => (
    <IconBase {...props} strokeWidth="1.5" stroke="currentColor" fill="none">
        <path d="M3 18v-6a9 9 0 0118 0v6" />
        <path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h1a2 2 0 012 2v3z" fill="currentColor" opacity="0.2" />
        <path d="M3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H5a2 2 0 00-2 2v3z" fill="currentColor" opacity="0.2" />
    </IconBase>
);
export const FitbitWatchIcon: IconType = (props) => (
    <IconBase {...props} strokeWidth="1.5" stroke="currentColor" fill="none">
        {/* Strap path */}
        <path d="M8.5 3H15.5C16.3284 3 17 3.67157 17 4.5V19.5C17 20.3284 16.3284 21 15.5 21H8.5C7.67157 21 7 20.3284 7 19.5V4.5C7 3.67157 7.67157 3 8.5 3Z" fill="currentColor" opacity="0.15" stroke="none" />
        {/* Screen */}
        <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" opacity="0.3" stroke="none" />
        {/* Time */}
        <path d="M12 9v2.5l1.5 1" strokeLinecap="round" strokeLinejoin="round" />
        {/* Button */}
        <path d="M18 10V14" strokeWidth="2" strokeLinecap="round" />
    </IconBase>
);
export const CalendarCheckIcon: IconType = (props) => (
  <IconBase {...props}>
    <rect x="4" y="5" width="16" height="16" rx="2" fill="currentColor" opacity="0.3"/>
    <path d="M16 3v4M8 3v4M4 11h16" />
    <path d="m9 16l2 2l4-4" />
  </IconBase>
);
export const SparklesIcon: IconType = (props) => (
  <IconBase {...props}>
    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" fill="currentColor" opacity="0.3"/>
    <path d="M12 7l-1-2-2-1 2-1 1-2 1 2 2 1-2 1-1 2z" stroke="none" fill="currentColor"/>
    <path d="M18 11l-1-2-2-1 2-1 1-2 1 2 2 1-2 1-1 2z" stroke="none" fill="currentColor"/>
    <path d="M6 17l-1-2-2-1 2-1 1-2 1 2 2 1-2 1-1 2z" stroke="none" fill="currentColor"/>
  </IconBase>
);
// Fix: Add StarIcon component for use in RatingModal.
export const StarIcon: IconType = (props) => (
    <IconBase {...props} stroke="none" fill="currentColor">
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
    </IconBase>
);
export const CompassIcon: IconType = (props) => (
    <IconBase {...props}>
        <defs>
            <linearGradient id="metalCompass" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="white" stopOpacity="0.3"/>
                <stop offset="100%" stopColor="white" stopOpacity="0"/>
            </linearGradient>
             <radialGradient id="compassGlow" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.6"/>
                <stop offset="100%" stopColor="currentColor" stopOpacity="0"/>
            </radialGradient>
        </defs>
      <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.3"/>
      <circle cx="12" cy="12" r="10" fill="url(#metalCompass)"/>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
      <polygon points="12 4 14 12 12 20 10 12" fill="currentColor" opacity="0.9"/>
      <circle cx="12" cy="12" r="2.5" fill="url(#compassGlow)"/>
      <path d="M12 2v2 M12 20v2 M2 12h2 M20 12h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.8"/>
    </IconBase>
  );
export const RoadmapIcon: IconType = (props) => (
  <IconBase {...props}>
    <rect x="3" y="5" width="18" height="14" rx="1" fill="currentColor" opacity="0.3"/>
    <path d="M12 8v8m-4-6v6m8-4v4" />
    <circle cx="8" cy="10" r="1" stroke="none" fill="currentColor" />
    <circle cx="12" cy="8" r="1" stroke="none" fill="currentColor" />
    <circle cx="16" cy="12" r="1" stroke="none" fill="currentColor" />
  </IconBase>
);

// --- REDESIGNED REWARD ICONS (V2) ---
const GuidedJournalingIcon: IconType = (props) => (
    <IconBase {...props}>
        <defs>
            <linearGradient id="journalGlow" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.8"/>
                <stop offset="100%" stopColor="currentColor" stopOpacity="0.2"/>
            </linearGradient>
        </defs>
        {/* Open book */}
        <path d="M4 20q4-2 8-2t8 2V4q-4 2-8 2T4 4z" fill="currentColor" opacity="0.2"/>
        <path d="M12 4v16m-8-2q4-2 8-2t8 2M4 4q4 2 8 2t8-2"/>
        {/* Glowing Feather/Quill */}
        <path d="M16 4a4 4 0 00-4 4v8a4 4 0 004 4" stroke="url(#journalGlow)" strokeWidth="2.5" fill="none"/>
        <path d="M12 8l4-4" stroke="url(#journalGlow)" strokeWidth="2" fill="none"/>
    </IconBase>
);
const VulnerabilityShieldIcon: IconType = (props) => (
    <IconBase {...props}>
        <defs>
            <radialGradient id="heartGlowSharp" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0%" stopColor="currentColor" stopOpacity="1"/>
                <stop offset="100%" stopColor="currentColor" stopOpacity="0"/>
            </radialGradient>
        </defs>
        {/* Sharper, more defined shield */}
        <path d="M12 2L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" fill="currentColor" opacity="0.2"/>
        {/* Heart shape */}
        <path d="M12 15.35l-1.45-1.32C5.4 11.36 4 9.28 4 7.5 4 5.42 5.42 4 7.5 4c1.74 0 3.41.81 4.5 2.09C13.09 4.81 14.76 4 16.5 4 18.58 4 20 5.42 20 7.5c0 1.78-1.4 3.86-6.55 8.54L12 15.35z" transform="scale(0.5) translate(12, 12)" fill="url(#heartGlowSharp)" stroke="currentColor" strokeWidth="1.5"/>
        {/* Geometric pattern on shield */}
        <path d="M12 2L3 5v6M12 2l9 3v6" stroke="currentColor" opacity="0.5"/>
    </IconBase>
);
const GuidedMeditationIcon: IconType = (props) => (
    <IconBase {...props}>
        <defs>
            <linearGradient id="meditationWave" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.8"/>
                <stop offset="100%" stopColor="currentColor" stopOpacity="0"/>
            </linearGradient>
        </defs>
        {/* Head silhouette */}
        <path d="M12 2a10 10 0 00-8.48 15.1M12 2a10 10 0 018.48 15.1" fill="none" stroke="currentColor" opacity="0.3"/>
        <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.2"/>
        {/* Calm waves */}
        <path d="M8 12q2-2 4 0t4 0" stroke="url(#meditationWave)" fill="none" strokeWidth="2" strokeLinecap="round"/>
        <path d="M6 15q3-3 6 0t6 0" stroke="url(#meditationWave)" fill="none" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
    </IconBase>
);
const OracleIcon: IconType = (props) => (
    <IconBase {...props}>
        <defs>
            <radialGradient id="oracleNebula" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.8"/>
                <stop offset="60%" stopColor="currentColor" stopOpacity="0.1"/>
                <stop offset="100%" stopColor="currentColor" stopOpacity="0"/>
            </radialGradient>
        </defs>
        {/* Crystal ball */}
        <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.1"/>
        <circle cx="12" cy="12" r="8" fill="url(#oracleNebula)" stroke="currentColor" opacity="0.5"/>
        {/* Cosmic/data elements inside */}
        <circle cx="9" cy="10" r="1" fill="currentColor"/>
        <circle cx="15" cy="15" r="1.5" fill="currentColor" opacity="0.7"/>
        <path d="M7 14l3-3 2 2 5-5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        {/* Sparkles outside */}
        <path d="M4 4l1 1M19 19l1 1M4 20l1-1M19 5l1-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.8"/>
    </IconBase>
);
export const UserIcon: IconType = (props) => (
  <IconBase {...props} strokeWidth="2">
    <path d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
  </IconBase>
);

// Mentor Icons
const StoicIcon: IconType = (props) => (
  <IconBase {...props}>
    <path d="M5 21h14M5 3h14" />
    <path d="M7 21V3h10v18" fill="currentColor" opacity="0.3"/>
    <path d="M10 17V7h4v10h-4z" stroke="none" fill="currentColor"/>
  </IconBase>
);
const ZenIcon: IconType = (props) => (
  <IconBase {...props}>
    <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.3" />
    <path d="M12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8" />
  </IconBase>
);
const VivekanandaIcon: IconType = (props) => (
  <IconBase {...props}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="currentColor" opacity="0.3" />
    <path d="M12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4-4-1.79-4-4-4z" stroke="none" fill="currentColor" opacity="0.5"/>
  </IconBase>
);
const ShivaIcon: IconType = (props) => (
  <IconBase {...props}>
    <path d="M4 14h16M12 4v16" />
    <path d="M8 7h8M6 4h12" />
    <path d="M12 14c-4.67 0-8.75 3-10.75 4" />
    <path d="M22.75 18C20.75 17 16.67 14 12 14" />
    <path d="M12 4a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" stroke="none" fill="currentColor" opacity="0.3" />
  </IconBase>
);
const CustomMentorIcon: IconType = (props) => (
  <IconBase {...props}>
    <circle cx="12" cy="8" r="4" fill="currentColor" opacity="0.3"/>
    <path d="M12 14c-4.33 0-8 2.24-8 5v1h16v-1c0-2.76-3.67-5-8-5z" />
    <path d="M17.5 14.5a1 1 0 0 1 0-2h1a1 1 0 0 1 0 2h-1zM4.5 12.5a1 1 0 0 1 0 2h-1a1 1 0 0 1 0-2h1z" stroke="none" fill="currentColor"/>
  </IconBase>
);

// --- NEW UNIQUE ARTICLE & ATTRIBUTE ICONS ---
const DopamineNeuronIcon: IconType = (props) => (
    <IconBase {...props}>
        <defs>
            <radialGradient id="neuronGlowV2" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.8"/>
                <stop offset="100%" stopColor="currentColor" stopOpacity="0.2"/>
            </radialGradient>
            <filter id="neuronBlur">
                <feGaussianBlur stdDeviation="1"/>
            </filter>
        </defs>
        {/* Soma/Cell Body */}
        <circle cx="8" cy="12" r="5" fill="url(#neuronGlowV2)" filter="url(#neuronBlur)" opacity="0.7"/>
        <circle cx="8" cy="12" r="4" fill="currentColor" />
        {/* Dendrites */}
        <path d="M4 11 l -3 -2 M4 13 l -3 2 M6 9 l -1 -4 M6 15 l -1 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        {/* Axon and terminal */}
        <path d="M12 12 H 20 C 22 12, 22 10, 20 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
        {/* Dopamine sparks */}
        <circle cx="21" cy="8" r="1" fill="currentColor" opacity="1"/>
        <circle cx="19" cy="7" r="0.5" fill="currentColor" opacity="0.8"/>
    </IconBase>
);
const SunriseIcon: IconType = (props) => (
    <IconBase {...props}>
        <defs>
            <radialGradient id="sunGlow" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.8"/>
                <stop offset="100%" stopColor="currentColor" stopOpacity="0"/>
            </radialGradient>
        </defs>
        {/* Sun */}
        <circle cx="12" cy="10" r="4" fill="url(#sunGlow)"/>
        <circle cx="12" cy="10" r="5" fill="currentColor" opacity="0.8"/>
        {/* Rays */}
        <path d="M12 4 V 6 M12 14 V 16 M6 10 H 4 M20 10 H 18 M8.17 6.17 L 6.76 4.76 M17.24 15.24 L 15.83 13.83 M8.17 13.83 L 6.76 15.24 M17.24 4.76 L 15.83 6.17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
        {/* Horizon */}
        <path d="M2 20 C 8 16, 16 16, 22 20" stroke="currentColor" strokeWidth="2" fill="none"/>
        <path d="M2 20 C 8 16, 16 16, 22 20" fill="currentColor" opacity="0.2"/>
    </IconBase>
);
const MountainPeakIcon: IconType = (props) => (
    <IconBase {...props}>
        <defs>
            <linearGradient id="snow" x1="0.5" y1="0" x2="0.5" y2="1">
                <stop offset="0%" stopColor="white" stopOpacity="0.9"/>
                <stop offset="100%" stopColor="white" stopOpacity="0.1"/>
            </linearGradient>
        </defs>
        {/* Background mountain */}
        <path d="M5 21 L 10 14 L 14 17 L 19 21 Z" fill="currentColor" opacity="0.3"/>
        {/* Main mountain */}
        <path d="M3 21 L 12 4 L 21 21 Z" fill="currentColor" opacity="0.6"/>
        {/* Snow cap */}
        <path d="M12 4 L 9 11 L 15 11 Z" fill="url(#snow)"/>
        {/* Flag */}
        <path d="M12 4 V 2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M12 2 h 2 l -1 1 z" fill="currentColor"/>
    </IconBase>
);
const MindWisdomIcon: IconType = (props) => (
    <IconBase {...props}>
        <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.1"/>
        <path d="M12 2a10 10 0 0 0-10 10c0 4.42 2.87 8.17 6.84 9.49.63.2 1.3.2 1.93 0C18.13 20.17 21 16.42 21 12a10 10 0 0 0-9-10z" fill="currentColor" opacity="0.1" />
        <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z" fill="currentColor" opacity="0.3"/>
        <path d="M12 12 l 2 -3 l -4 0 l 2 3 M12 12 l-2 3 l 4 0 l-2-3" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" fill="none"/>
        <path d="M12 2v2m0 16v2m8-10h2M2 12h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
    </IconBase>
);
const DisciplineSwordIcon: IconType = (props) => (
    <IconBase {...props}>
        <path d="M12 2 L 13 10 L 21 11 L 19 13 L 13 12 L 12 22 L 11 12 L 5 13 L 3 11 L 11 10 Z" fill="currentColor" opacity="0.2"/>
        <path d="M12 2 L 13 10 L 11 10 Z M12 22 L 11 12 L 13 12 Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/>
        <path d="M3 11 L 21 11 L 19 13 L 5 13 Z" fill="currentColor" opacity="0.7"/>
    </IconBase>
);

export const HeartWaveIcon: IconType = (props) => (
    <IconBase {...props}>
      <defs>
        <clipPath id="heartClip">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </clipPath>
      </defs>
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor" opacity="0.2"/>
      <g clipPath="url(#heartClip)">
        <path d="M-2 10 Q 4 6, 12 10 T 26 10" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.8"/>
        <path d="M-2 14 Q 4 10, 12 14 T 26 14" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.6"/>
        <path d="M-2 18 Q 4 14, 12 18 T 26 18" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.4"/>
      </g>
    </IconBase>
);
const SelfCompassionIcon: IconType = (props) => (
    <IconBase {...props}>
        <defs>
            <radialGradient id="selfCompassionGlow" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.7"/>
                <stop offset="100%" stopColor="currentColor" stopOpacity="0.1"/>
            </radialGradient>
        </defs>
        {/* Arms hugging */}
        <path d="M4,12 A 8 8 0 0 0 12 20 A 8 8 0 0 0 20 12" fill="currentColor" opacity="0.2" />
        {/* Heart */}
        <path d="M12 17.35l-1.45-1.32C5.4 11.36 2 8.28 2 4.5 2 1.42 4.42 -1 7.5 -1c1.74 0 3.41.81 4.5 2.09C13.09 -.19 14.76 -1 16.5 -1 19.58 -1 22 1.42 22 4.5c0 3.78-3.4 6.86-8.55 11.54L12 17.35z" transform="translate(0, 4) scale(0.8)" fill="url(#selfCompassionGlow)" />
        <path d="M12 17.35l-1.45-1.32C5.4 11.36 2 8.28 2 4.5 2 1.42 4.42 -1 7.5 -1c1.74 0 3.41.81 4.5 2.09C13.09 -.19 14.76 -1 16.5 -1 19.58 -1 22 1.42 22 4.5c0 3.78-3.4 6.86-8.55 11.54L12 17.35z" transform="translate(0, 4) scale(0.8)" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.8"/>
    </IconBase>
);
export const EnvironmentIcon: IconType = (props) => (
    <IconBase {...props}>
        <defs>
            <linearGradient id="glassShine" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="white" stopOpacity="0.3"/>
                <stop offset="100%" stopColor="white" stopOpacity="0"/>
            </linearGradient>
        </defs>
        {/* Ground */}
        <path d="M6 20 A 8 3 0 0 0 18 20 Z" fill="currentColor" opacity="0.4"/>
        {/* Sapling */}
        <path d="M12 20V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M12 15 c -2 0 -2 -3 0 -3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <path d="M12 15 c 2 0 2 -3 0 -3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        {/* Glass Dome */}
        <path d="M12 4 A 8 8 0 0 1 20 12 v 8 H 4 v-8 A 8 8 0 0 1 12 4 Z" fill="currentColor" opacity="0.2"/>
        <path d="M12 4 A 8 8 0 0 1 20 12 v 8 H 4 v-8 A 8 8 0 0 1 12 4 Z" fill="url(#glassShine)"/>
        <path d="M12 4 A 8 8 0 0 1 20 12 v 8 M4 20 v-8 A 8 8 0 0 1 12 4" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.6"/>
    </IconBase>
);
export const MoonIcon: IconType = (props) => (
    <IconBase {...props}>
      <defs>
           <radialGradient id="moonGlow" cx="0.2" cy="0.2" r="1">
              <stop offset="0%" stopColor="white" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="white" stopOpacity="0"/>
          </radialGradient>
      </defs>
    <path d="M21.64 13.5A9 9 0 1 1 10.5 2.36a7 7 0 0 0 11.14 11.14z" fill="currentColor" />
    <path d="M21.64 13.5A9 9 0 1 1 10.5 2.36a7 7 0 0 0 11.14 11.14z" fill="url(#moonGlow)"/>
    {/* Craters */}
    <circle cx="15" cy="7" r="1.5" fill="black" opacity="0.2"/>
    <circle cx="12" cy="15" r="2" fill="black" opacity="0.15"/>
    <circle cx="18" cy="14" r="1" fill="black" opacity="0.2"/>
  </IconBase>
);
export const BrokenChainIcon: IconType = (props) => (
    <IconBase {...props}>
        <defs>
            <linearGradient id="chainMetal" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="white" stopOpacity="0.4"/>
                <stop offset="100%" stopColor="black" stopOpacity="0.2"/>
            </linearGradient>
        </defs>
       <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.49 1.49" strokeWidth="3" fill="none"/>
       <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.49 1.49" stroke="url(#chainMetal)" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.49-1.49" strokeWidth="3" fill="none"/>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.49-1.49" stroke="url(#chainMetal)" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
      {/* Break sparks */}
      <path d="M8 16 l -2 2 M 16 8 l 2 -2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.8"/>
    </IconBase>
);

// --- ATTRIBUTE ICONS ---
const WillpowerIcon: IconType = (props) => (
  <IconBase {...props}>
    <path d="M12 2L2 12l10 10 10-10L12 2z" fill="currentColor" opacity="0.3"/>
    <path d="M12 2l-2 10h4L12 2zM2 12l10 10v-5l-5-5H2zM22 12l-10 10v-5l5-5h5z" />
  </IconBase>
);
const FocusIcon: IconType = (props) => (
  <IconBase {...props}>
    <circle cx="12" cy="12" r="10" stroke="currentColor" fill="none" opacity="0.4"/>
    <circle cx="12" cy="12" r="3" fill="currentColor"/>
    <path d="M22 12h-4M6 12H2M12 2v4M12 22v-4"/>
  </IconBase>
);
const ClarityIcon: IconType = (props) => (
  <IconBase {...props}>
    <path d="M12 2l-5.5 9h11L12 2z" fill="currentColor" opacity="0.4"/>
    <path d="M17.5 11l-5.5 9-5.5-9h11z" />
    <path d="M6.5 11L1 20h11L6.5 11zM17.5 11l5.5 9H12l5.5-9z" opacity="0.6"/>
  </IconBase>
);
const EnergyIcon: IconType = (props) => (
  <IconBase {...props}>
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </IconBase>
);
const DisciplineIcon: IconType = (props) => (
  <IconBase {...props}>
    <path d="M4 21h16" />
    <ellipse cx="12" cy="18" rx="6" ry="2" fill="currentColor" opacity="0.4"/>
    <ellipse cx="12" cy="14" rx="5" ry="2" fill="currentColor" opacity="0.6"/>
    <ellipse cx="12" cy="10" rx="4" ry="1.5" fill="currentColor" opacity="0.8"/>
    <ellipse cx="12" cy="6" rx="3" ry="1.5" fill="currentColor" />
  </IconBase>
);
const ConfidenceIcon: IconType = (props) => (
  <IconBase {...props}>
    <path d="M2 12l10-9 10 9-10 9-10-9z" fill="currentColor" opacity="0.3"/>
    <path d="M12 12l-6-4.5 6-4.5 6 4.5L12 12zM5 13.5l7 5.25 7-5.25L12 18.75 5 13.5z"/>
  </IconBase>
);
const ResilienceIcon: IconType = (props) => (
  <IconBase {...props}>
    <circle cx="12" cy="12" r="10" stroke="currentColor" fill="none" opacity="0.5"/>
    <path d="M19.07 4.93a10 10 0 0 0-14.14 0" fill="none"/>
    <path d="M4.93 19.07A10 10 0 0 0 12 22a10 10 0 0 0 7.07-2.93" fill="none"/>
    <path d="M12 2v6l-2 3h4l-2-3V2z" stroke="currentColor" fill="#f59e0b" strokeWidth="1"/>
    <path d="M18 10l-4 2-2 4 4-2 2-4z" stroke="currentColor" fill="#f59e0b" strokeWidth="1"/>
    <path d="M6 14l4-2 2-4-4 2-2 4z" stroke="currentColor" fill="#f59e0b" strokeWidth="1"/>
  </IconBase>
);
const FemaleAttentionIcon: IconType = (props) => (
  <IconBase {...props}>
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor" opacity="0.4"/>
    <path d="M7 8l-1-2-2-1 2-1 1-2 1 2 2 1-2 1-1 2z" stroke="none" fill="currentColor"/>
    <path d="M17 14l-1-2-2-1 2-1 1-2 1 2 2 1-2 1-1 2z" stroke="none" fill="currentColor"/>
  </IconBase>
);

// Story Chapter Icons
const StoryVowIcon: IconType = (props) => (
    <IconBase {...props}>
        <path d="M6 3h12v13a4 4 0 01-4 4H8a4 4 0 01-4-4V3h2" fill="currentColor" opacity="0.3" />
        <path d="M18 3v13a4 4 0 01-4 4H8a4 4 0 01-4-4V3" />
        <circle cx="12" cy="18" r="3" stroke="none" fill="currentColor" />
    </IconBase>
);
const StoryEchoesIcon: IconType = (props) => (
    <IconBase {...props}>
        <path d="M12 8a4 4 0 100 8 4 4 0 000-8z" fill="currentColor" opacity="0.4" />
        <path d="M12 4a8 8 0 100 16 8 8 0 000-16z" />
        <circle cx="12" cy="12" r="1.5" stroke="none" fill="currentColor" />
    </IconBase>
);
const StoryForgeIcon: IconType = (props) => (
    <IconBase {...props}>
        <path d="M3 15h18v5H3z" fill="currentColor" opacity="0.3" />
        <path d="M5 15V13c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2v2" />
        <path d="M17 11V5c0-1.1-.9-2-2-2h-1a2 2 0 00-2 2v6" />
    </IconBase>
);
const StoryGuardianIcon: IconType = (props) => (
    <IconBase {...props}>
        <path d="M6 10h12l-6-7-6 7z" fill="currentColor" opacity="0.3" />
        <path d="M7 21v-8h10v8" />
        <path d="M5 21h14" />
        <path d="M9 13h6" />
    </IconBase>
);
const StoryKnightIcon: IconType = (props) => (
    <IconBase {...props}>
        <path d="M12 2L4 5v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V5l-8-3z" fill="currentColor" opacity="0.3" />
        <path d="M12 3v18" />
        <path d="M9 14h6" />
    </IconBase>
);
const StoryCommanderIcon: IconType = (props) => (
    <IconBase {...props}>
        <path d="M5 21V3h2v18H5z" />
        <path d="M7 4h10l-4 4 4 4H7V4z" fill="currentColor" opacity="0.3" />
    </IconBase>
);
const StorySentinelIcon: IconType = (props) => (
    <IconBase {...props}>
        <rect x="7" y="2" width="10" height="16" rx="2" fill="currentColor" opacity="0.3" />
        <path d="M10 22h4m-4-2h4" />
        <circle cx="12" cy="12" r="3" stroke="none" fill="currentColor" />
    </IconBase>
);
const StoryMasterIcon: IconType = (props) => (
    <IconBase {...props}>
        <ellipse cx="12" cy="20" rx="8" ry="2" fill="currentColor" opacity="0.4" />
        <ellipse cx="12" cy="16" rx="6" ry="2" />
        <ellipse cx="12" cy="12" rx="4" ry="1.5" fill="currentColor" opacity="0.6" />
        <ellipse cx="12" cy="8" rx="3" ry="1.5" />
    </IconBase>
);
const StoryGrandmasterIcon: IconType = (props) => (
  <IconBase {...props}>
        <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.3" />
        <path d="M12 2l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2z" />
        <circle cx="12" cy="12" r="2" stroke="none" fill="currentColor" />
    </IconBase>
);
const StoryLegendIcon: IconType = (props) => (
    <IconBase {...props}>
        <path d="M3 20h18L12 5 3 20z" fill="currentColor" opacity="0.3" />
        <circle cx="12" cy="11" r="5" />
        <path d="M12 2v4" />
        <path d="M5.64 6.64l2.82 2.82" />
        <path d="M2 13h4" />
        <path d="M18 13h4" />
        <path d="M15.54 9.46l2.82-2.82" />
    </IconBase>
);

// Badge Icons - V2.0 - More Thematic and Visually Distinct
const BadgeVowIcon: IconType = (props) => (
    <IconBase {...props}>
        <path d="M5 3v18h2c2 0 3-1 3-3V6c0-2-1-3-3-3H5z" fill="currentColor" opacity="0.3" />
        <path d="M19 3v18h-2c-2 0-3-1-3-3V6c0-2 1-3 3-3h2z" fill="currentColor" opacity="0.3" />
        <path d="M9 3v18h6V3H9z" />
        <circle cx="12" cy="12" r="4" fill="#f59e0b" stroke="#111827" strokeWidth="1.5"/>
        <path d="M12 10.5l1.5 1-1.5 1.5-1.5-1.5 1.5-1z" fill="#111827" />
    </IconBase>
);
const BadgeUnwaveringIcon: IconType = (props) => (
    <IconBase {...props}>
        <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="2.5" />
        <path d="M12 2v12m-8 4h16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M12 16c-4 0-6 2-6 4h12c0-2-2-4-6-4z" fill="currentColor" opacity="0.4" />
    </IconBase>
);
const BadgeDisciplinedMindIcon: IconType = (props) => (
    <IconBase {...props}>
        <path d="M4 4h14a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z" fill="currentColor" opacity="0.2"/>
        <path d="M5 4v16" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="12.5" cy="12" r="2.5" fill="currentColor" opacity="0.5"/>
        <path d="M12.5 14.5l-1.5 2h4l-1.5-2z" fill="currentColor" opacity="0.8"/>
    </IconBase>
);
const BadgeResolveIcon: IconType = (props) => (
    <IconBase {...props}>
        <path d="M12 2L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" fill="currentColor" opacity="0.2"/>
        <path d="M12 7l-4.5 5h9L12 7zm0 5l-4.5 5h9L12 12z" fill="currentColor" />
    </IconBase>
);
const BadgeEnduranceIcon: IconType = (props) => (
    <IconBase {...props}>
        <path d="M18 10a6 6 0 00-12 0v6h12v-6z" fill="currentColor" opacity="0.3"/>
        <path d="M12 2a4 4 0 00-4 4v4h8V6a4 4 0 00-4-4z" />
        <path d="M5 16h14v2a2 2 0 01-2 2H7a2 2 0 01-2-2v-2z" />
        <line x1="12" y1="10" x2="12" y2="16" stroke="currentColor" opacity="0.5" strokeWidth="2"/>
    </IconBase>
);
const BadgeVigilIcon: IconType = (props) => (
    <IconBase {...props}>
        <path d="M9 22h6v-8H9v8zM10 2h4l-1 6h-2L10 2z" fill="currentColor" opacity="0.3"/>
        <path d="M12 14L10 2h4l-2 12z" />
        <path d="M3.5 8.5l6-2m5 2l6-2M3.5 11.5l6-2m5 2l6-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.7"/>
    </IconBase>
);
const BadgeLegacyIcon: IconType = (props) => (
    <IconBase {...props}>
        <circle cx="12" cy="12" r="6" fill="currentColor" opacity="0.8" />
        <path d="M12 2V6M12 18V22M4.22 4.22L7.05 7.05M16.95 16.95L19.78 19.78M2 12H6M18 12H22M4.22 19.78L7.05 16.95M16.95 7.05L19.78 4.22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    </IconBase>
);


// --- DATA CONSTANTS ---

export const RANKS: Rank[] = [
  { name: 'Novice', daysRequired: 0, Icon: NoviceIcon, abilityDescription: "A seed of intention is planted.", aetherBonus: 10 },
  { name: 'Apprentice', daysRequired: 3, Icon: ApprenticeIcon, abilityDescription: "The first sprout breaks the soil.", aetherBonus: 25 },
  { name: 'Adept', daysRequired: 7, Icon: AdeptIcon, abilityDescription: "Roots deepen, finding nourishment.", aetherBonus: 50 },
  { name: 'Guardian', daysRequired: 14, Icon: GuardianIcon, abilityDescription: "A sturdy shield of discipline forms.", aetherBonus: 75 },
  { name: 'Knight', daysRequired: 30, Icon: KnightIcon, abilityDescription: "Willpower becomes your armor.", aetherBonus: 100 },
  { name: 'Commander', daysRequired: 60, Icon: CommanderIcon, abilityDescription: "You lead yourself with authority.", aetherBonus: 150 },
  { name: 'Sentinel', daysRequired: 90, Icon: SentinelIcon, abilityDescription: "Vigilance is your constant companion.", aetherBonus: 200 },
  { name: 'Master', daysRequired: 180, Icon: MasterIcon, abilityDescription: "You have mastered the inner world.", aetherBonus: 300 },
  { name: 'Grandmaster', daysRequired: 270, Icon: GrandmasterIcon, abilityDescription: "Your will shapes your reality.", aetherBonus: 400 },
  { name: 'Legend', daysRequired: 365, Icon: LegendIcon, abilityDescription: "Your story inspires others.", aetherBonus: 1000 },
];

export const BADGES: Badge[] = [
  { id: 'first-check-in', name: 'The Vow', description: 'Completed your first check-in.', Icon: BadgeVowIcon, condition: (ctx: BadgeConditionContext) => ctx.checkInStreak >= 1 },
  { id: 'unwavering-vow', name: 'Unwavering Vow', description: 'Achieved a 7-day check-in streak.', Icon: BadgeUnwaveringIcon, condition: (ctx: BadgeConditionContext) => ctx.checkInStreak >= 7 },
  { id: 'disciplined-mind', name: 'Disciplined Mind', description: 'Wrote 10 journal entries.', Icon: BadgeDisciplinedMindIcon, condition: (ctx: BadgeConditionContext) => ctx.journalEntryCount >= 10 },
  { id: 'adepts-resolve', name: 'Adept\'s Resolve', description: 'Achieved a 7-day streak.', Icon: BadgeResolveIcon, condition: (ctx: BadgeConditionContext) => ctx.streakDays >= 7 },
  { id: 'knights-endurance', name: 'Knight\'s Endurance', description: 'Achieved a 30-day streak.', Icon: BadgeEnduranceIcon, condition: (ctx: BadgeConditionContext) => ctx.streakDays >= 30 },
  { id: 'sentinels-vigil', name: 'Sentinel\'s Vigil', description: 'Achieved a 90-day streak.', Icon: BadgeVigilIcon, condition: (ctx: BadgeConditionContext) => ctx.streakDays >= 90 },
  { id: 'grandmaster-legacy', name: 'Grandmaster\'s Legacy', description: 'Achieved a 365-day streak.', Icon: BadgeLegacyIcon, condition: (ctx: BadgeConditionContext) => ctx.streakDays >= 365 },
];

export const GRANDMASTER_LEGACY_BADGE: Badge = {
  id: 'grandmaster-legacy',
  name: 'Grandmaster\'s Legacy',
  description: 'Achieved the monumental 365-day streak.',
  Icon: BadgeLegacyIcon,
  condition: (ctx: BadgeConditionContext) => ctx.streakDays >= 365,
};

export const STORY_CHAPTERS: StoryChapter[] = [
    { daysRequired: 0, title: 'Chapter I: The Vow', theme: "A journey begins with a single, sacred promise.", Icon: StoryVowIcon, sections: [ { title: "The First Step", content: `You stand at the threshold of a new life. The path ahead is shrouded in mist, uncertain and challenging. But within you, a flame has been lit—a flicker of resolve, a desire for something more, something better. This is not a casual wish; it is a vow. A vow made to the most important person in your life: your future self.\n\nToday, you do not promise perfection. Perfection is a mirage in the desert of self-improvement. Instead, you promise effort. You promise to show up, especially on the days when the old you screams to stay hidden. You promise to be honest, especially when the truth is uncomfortable. You promise to be compassionate with your stumbles, but firm in your direction.\n\nThis vow is your compass. When the winds of habit blow, it will point you true. When the sirens of instant gratification sing, it will be the silent music that keeps you on course. You are not merely stopping a habit; you are starting a new story. This is page one. Write it with intention.` }, { title: "The Weight of the Choice", content: `Every choice has a weight. The choices of the past have accumulated, creating the reality you now wish to change. Today, you make a choice that carries a different kind of weight—the weight of potential. It feels heavy now because it is dense with future joys, future clarity, and future strength.\n\nDo not be discouraged by this weight. It is the feeling of a seed before it breaks through the soil. It is the tension in a bowstring just before the arrow is loosed. This initial effort, this conscious decision to walk a different path, is the most powerful force you can unleash.\n\nRemember this feeling. The clarity of this moment. The quiet power in your decision. Bottle it. Keep it close. On days when the path seems to vanish, this memory will be your lantern. You are not just a wanderer; you are the cartographer of your own mind. Let's begin drawing the map.` } ] },
    { daysRequired: 3, title: 'Chapter II: The Echoes', theme: "The ghosts of old habits whisper in the quiet.", Icon: StoryEchoesIcon, sections: [ { title: "The Brain's Protest", content: `Three days. The initial adrenaline of your vow may be fading, replaced by a low, persistent hum—the echo of your old neural pathways. Your brain, a master of efficiency, is protesting this new, difficult route. It wants the familiar, the easy, the well-trodden road of instant reward.\n\nThis is not a sign of weakness; it is a sign of change. You are literally forging new roads in your mind. The whispers you hear—"just once more," "it's not a big deal," "you deserve a break"—are not your true voice. They are the echoes of a programming you are actively rewriting. Acknowledge them as you would acknowledge the creaks of an old house. They are noises, not truths. Your job is not to argue with the echoes, but to let them fade by filling the space with new sounds: the sound of your feet on the pavement, the turning of a page, the quiet focus of your work.` }, { title: "The First Test", content: `Temptation does not arrive like a monster; it arrives like a reasonable suggestion. It will find you when you are tired, bored, or stressed. It will use your own logic against you. This is the first true test of your resolve.\n\nYour tool in this moment is the "pause." When the urge rises, do not fight it, and do not surrender to it. Simply pause. Create a space between the feeling and the action. In that space, ask yourself a simple question: "What is the true cost?" Look beyond the fleeting promise of relief and see the price you will pay in clarity, in self-respect, in momentum.\n\nThen, take one small, deliberate action in the direction of your vow. Put on your shoes. Drink a glass of water. Write one sentence in your journal. You do not need to win the war today. You only need to win this single moment. And you win it in the pause.` } ] },
    { daysRequired: 7, title: 'Chapter III: The Forge', theme: "Discipline is not a cage, but a hammer to shape the self.", Icon: StoryForgeIcon, sections: [ { title: "Forging the Will", content: `A week. Seven full rotations of the earth. You have weathered the initial storm and now you enter the forge. This is where raw resolve is hammered into tempered discipline. The work is not glamorous; it is repetitive, intentional, and often difficult. This is the daily practice of choosing the harder right over the easier wrong.\n\nEvery time you honor your commitment, you are adding another layer of steel to your will. Every time you check in, log your thoughts, and face your urges without surrender, you are heating and hammering that steel, making it stronger, more resilient. There will be days you feel powerful, and days you feel weak. It does not matter. The forge does not care about your feelings; it only cares about the work. Show up. Do the work. The strength will follow.` }, { title: "The Architecture of a New Life", content: `You cannot simply leave a void where a bad habit used to be. Nature abhors a vacuum, and so does the human mind. If you do not fill the space, the old habit will seep back in to fill the emptiness. Now is the time to become an architect.\n\nWhat are you building in its place? Your old habit likely consumed time, energy, and focus. Where will you re-invest those precious resources? This is not about distraction; it is about construction. What skill have you always wanted to learn? What book have you always meant to read? What part of your health have you neglected? Pour your energy into these foundations. Building something new and positive is infinitely more powerful than simply fighting something old and negative. You are not just an escape artist; you are the architect of your own citadel.` } ] },
    { daysRequired: 14, title: 'Chapter IV: The Guardian', theme: "You become the protector of your own peace.", Icon: StoryGuardianIcon, sections: [ { title: "Standing Watch", content: `Two weeks. You have passed the initial tests of brute force and now you enter a new phase: guardianship. You are becoming the guardian of your own mind, the sentinel at the gates of your focus. This requires a different kind of strength—not the explosive power of a single decision, but the quiet, constant vigilance of a protector.\n\nYour primary duty is to manage your environment. A fortress with open gates is no fortress at all. Who and what do you allow into your mind? The content you consume, the people you interact with, the physical space you inhabit—these are all part of your defensive perimeter. Curation is your new weapon. Be ruthless in eliminating the inputs that weaken your resolve. Be intentional in seeking out those that strengthen it. Your mind is a sacred space. You have the right and the responsibility to control who and what crosses its threshold.` }, { title: "The Gift of Clarity", content: `As the fog of old habits begins to lift, you may notice something remarkable: clarity. Your thoughts are sharper. Your emotions, while still present, are less overwhelming; you can observe them without being consumed by them. This is one of the first true rewards of the path.\n\nThis newfound clarity is a superpower. It allows you to see the world and yourself with fresh eyes. You can diagnose problems in your life more accurately. You can make decisions from a place of reason rather than reaction. Cherish this gift. Use it. Let it fuel your motivation. This clarity is the aether you are truly earning. It is the currency of a free mind, and with it, you can purchase a life of your own design. Protect it fiercely.` } ] },
    { daysRequired: 30, title: 'Chapter V: The Knight', theme: "Discipline has become your armor, and integrity your sword.", Icon: StoryKnightIcon, sections: [ { title: "The Code of Honor", content: `A month. You are no longer just a defender; you are a knight. A knight operates not from fear, but from a code of honor. Your vow has evolved into your code. It is a set of principles you live by, not because you have to, but because it is who you are.\n\nThis code is about integrity—the state of being whole and undivided. It's when your actions finally align with your values. It's the quiet confidence that comes from knowing you can trust yourself to do what you said you would do. This is the source of true self-esteem. It is not given by others; it is forged in the silent battles you win within yourself each day.\n\nYour armor is your discipline. It protects you from the stray arrows of temptation and the blows of self-doubt. Your sword is your integrity. With it, you cut through rationalizations and excuses, carving a clear path forward.` }, { title: "The Quest for Virtue", content: `The knight's journey is not just about defeating enemies; it is about pursuing a noble quest. Your quest has shifted. It is no longer "How do I avoid this bad thing?" but "How can I be a better human?"\n\nThis is the beginning of true growth. Use the energy you've reclaimed to practice virtues. Be more patient with your family. Be more present with your friends. Be more disciplined in your work. Be more generous with your time. The path of self-mastery is not an isolated journey. Its ultimate purpose is to make you a more effective and positive force in the world. Your personal victory becomes a gift to everyone around you. You are not just building yourself; you are building the capacity to serve.` } ] },
    { daysRequired: 60, title: 'Chapter VI: The Commander', theme: "You lead yourself with authority, not tyranny.", Icon: StoryCommanderIcon, sections: [ { title: "The Inner Council", content: `Two months. You have established order within your own mind. You are the commander of your inner council. This council is made up of different parts of you: the ambitious part, the fearful part, the inner child, the inner critic. In the past, they were a squabbling, chaotic mess. Your old habit was often a foolish treaty signed by the fearful part to silence the critic, at the expense of the ambitious one.\n\nNow, you sit at the head of the table. You listen to all the voices, but you are not beholden to any single one. You acknowledge the critic's concern for safety, but you do not let it command you. You hear the child's desire for comfort, but you do not let it dictate your actions. You are the commander. You weigh the counsel, you assess the larger mission, and you issue the orders. Your authority comes not from brute force, but from wisdom and a clear vision of the objective: your freedom.` }, { title: "Strategy and Tactics", content: `A commander is a strategist. Brute force willpower is a tactic for a single battle, but strategy wins the war. Your life is now your strategic map. You are learning to anticipate challenges before they arise. You know which situations are high-risk (the lonely Friday night) and which are low-risk (the focused work morning). You can now allocate your resources—your willpower, your energy, your focus—more intelligently.\n\nStart planning your weeks with this strategic mindset. What are your key objectives? Where are the likely points of friction? How can you set up your environment to make victory the path of least resistance? This is the art of command: not just fighting hard, but fighting smart. You are learning to out-think your urges, not just out-muscle them. This is a higher level of the game.` } ] },
    { daysRequired: 90, title: 'Chapter VII: The Sentinel', theme: "Vigilance is your constant companion.", Icon: StorySentinelIcon, sections: [ { title: "The Long Peace", content: `Ninety days. A full season has passed since you took your vow. You may now be experiencing something new and profound: The Long Peace. The constant, noisy chatter of urges may have subsided into a quiet hum. The daily battles may have become less frequent. This is a time of great reward, but also subtle danger.\n\nComplacency is the enemy of The Long Peace. The sentinel on the wall is most needed when the land is quiet, for that is when invaders believe the city sleeps. Your role now is one of quiet, confident vigilance. It is the practice of maintaining your standards not because you feel threatened, but because they are your standards. It is the discipline of tending to the walls of your fortress even in times of peace, ensuring they are strong for when the storms inevitably return.` }, { title: "The View from the Tower", content: `From your new vantage point as the sentinel, you can see much further. You can see the patterns in your life with greater clarity. You can see the downstream consequences of small decisions. This is the wisdom that comes from a sustained streak. You have a collection of data points, of memories of victories, that prove to you that your new path is the correct one.\n\nThis is when your identity truly begins to shift. You start to see yourself not as an "addict in recovery," but simply as a disciplined person. You are someone who exercises. You are someone who reads. You are someone who keeps their word to themselves. The actions you have repeated for ninety days are no longer just actions; they are becoming your identity. The view from the sentinel's tower is not just of the land around you, but of the person you have become.` } ] },
    { daysRequired: 180, title: 'Chapter VIII: The Master', theme: "Your will and your actions are one.", Icon: StoryMasterIcon, sections: [ { title: "The Effortless Effort", content: `Six months. You have reached a state of mastery. This does not mean the absence of effort, but the presence of "effortless effort." It is the state the master archer is in when the bow, arrow, and target become one. Your disciplines, once difficult and conscious, are now becoming second nature. You no longer have to fight to go to the gym; it's simply what you do. You no longer have to resist the urge with all your might; the choice for a better alternative is almost automatic.\n\nThis is the result of thousands of correct choices, of rewriting your neural pathways through sheer, relentless repetition. You have achieved a level of unconscious competence. The conscious mind, your inner Commander, can now concern itself with higher-level strategies, because the foundational tactics are being run by a well-trained subconscious. This is freedom. It is the peace that comes when your inner world is no longer at war with itself.` }, { title: "The Radiance of Self", content: `A master does not need to announce their mastery. It is evident in their presence, in their calmness, in their quiet confidence. People around you will begin to notice this change. They may not know the specifics of your journey, but they will sense your new solidity. You will be more present in conversations, a better listener, a more reliable friend, a more focused colleague.\n\nThis is the radiance of a person who is integrated. Your energy is no longer being wasted on inner conflict. It is now free to flow outwards, into your relationships, your work, and your passions. This is the true gift of self-mastery. The reward is not just the absence of a negative, but the overwhelming presence of a positive. You are not just whole; you are overflowing.` } ] },
    { daysRequired: 270, title: 'Chapter IX: The Grandmaster', theme: "Your will does not just follow reality; it shapes it.", Icon: StoryGrandmasterIcon, sections: [ { title: "The Architect of Reality", content: `Two hundred and seventy days. Nine months. A period of profound gestation is complete. You have moved beyond mastery of the self to become a Grandmaster—an architect of your own reality. Where the Master follows the rules of the game with flawless execution, the Grandmaster begins to shape the game itself.\n\nYour will is now a powerful, creative force. You no longer just react to life; you impose your vision upon it. The goals that once seemed like distant dreams—starting a business, learning a language, achieving peak physical fitness—are now simply projects to be executed. You understand the process. You know that a grand vision is built from a thousand small, disciplined, daily actions. The link between effort and outcome is no longer a matter of faith; it is a matter of fact, proven by your own experience. Fear of failure is replaced by the calm curiosity of experimentation.` }, { title: "The Source of the River", content: `You have discovered that willpower is not a finite resource to be depleted. It is a muscle that grows stronger with use. Furthermore, you have tapped into something deeper: the source of the river. By aligning your actions with a purpose greater than your own comfort, you have unlocked a new source of energy.\n\nYour "why" has become so powerful that the "how" takes care of itself. Whether your purpose is to be a better parent, to create art, to build a community, or to explore the limits of your potential, this purpose is now the engine that drives you. It pulls you forward, requiring far less pushing from your conscious will. The Grandmaster does not struggle against the current; they become the current.` } ] },
    { daysRequired: 365, title: 'Chapter X: The Legend', theme: "Your story becomes a source of light for others.", Icon: StoryLegendIcon, sections: [ { title: "A Monument of Will", content: `One year. You have built a monument. Not of stone or steel, but of days. Each day is a block, laid with intention and sealed with discipline. Stand back and behold what you have constructed: a life. A life reclaimed, redesigned, and reborn.\n\nYour journey is now a legend. It is a testament to the most powerful force in the human spirit: the ability to choose, and to choose again, in the direction of one's highest self. You have not slain a dragon; you have tamed one and harnessed its power. The fire that once threatened to consume you now lights your way.\n\nThis is not an ending. It is a commencement. It is the beginning of a new way of being, where the principles you have cultivated for a year are now the very foundation of your character. You are a Legend in your own story.` }, { title: "The Light You Carry", content: `A legend is a story told to inspire others. While your journey may have been a private one, its effects are public. The light you have cultivated within yourself now illuminates the path for those around you, whether you are aware of it or not. Your calmness, your integrity, your quiet strength—these are gifts you now give freely to the world, just by being who you have become.\n\nYou are living proof that change is possible. You are a beacon of hope for anyone who feels trapped in a cycle they cannot break. Your legacy is not just the streak you have kept; it is the example you have set. Continue to walk your path with honor. The world needs more legends.` } ] },
];

export const REWARDS: Reward[] = [
    // --- CONTENT UNLOCKS (EARLY GAME) ---
    { id: 'first-wisdom', rankToUnlock: 'Adept', title: 'The Nature of the Mind', description: 'A piece of wisdom on understanding the inner workings of your thoughts.', type: 'content', content: 'Your mind is like a restless monkey, always jumping from branch to branch. Do not try to chain the monkey. Instead, give it a single, beautiful banana to focus on. Your breath, a mantra, a single point of focus—this is your banana. When the mind wanders, as it will, gently guide it back. The goal is not to stop the wandering, but to get better at the returning.', Icon: MindWisdomIcon },
    { id: 'second-wisdom', rankToUnlock: 'Knight', title: 'The Sword of Discipline', description: 'A reflection on the true meaning of discipline.', type: 'content', content: 'Discipline is not punishment. It is the ultimate form of self-love. It is the daily act of choosing what you want most over what you want now. It is the bridge between your goals and your accomplishments. Each disciplined act is a vote for the person you wish to become. Cast your votes wisely, and you will elect a new self into existence.', Icon: DisciplineSwordIcon },

    // --- NEW AI-POWERED TOOLS (LATE GAME) ---
    { id: 'guided-journaling', rankToUnlock: 'Sentinel', title: 'Guided Journaling Templates', description: 'Unlock AI-generated templates for specific situations like "Morning Intention" or "Processing a Setback".', type: 'tool', Icon: GuidedJournalingIcon },
    { id: 'vulnerability-shield', rankToUnlock: 'Master', title: 'The Vulnerability Shield', description: 'A proactive planning tool. Describe an upcoming challenge and get a personalized AI "Survival Guide".', type: 'tool', Icon: VulnerabilityShieldIcon },
    { id: 'guided-meditation', rankToUnlock: 'Grandmaster', title: 'AI Guided Meditation', description: 'Request a short, personalized meditation script from your mentor based on your current needs.', type: 'tool', Icon: GuidedMeditationIcon },
    { id: 'oracle', rankToUnlock: 'Legend', title: 'The Oracle of Fortify', description: 'Ask a deep question about your journey and receive a profound, data-driven answer based on your entire history.', type: 'tool', Icon: OracleIcon },
];


export const MENTOR_PERSONAS: MentorPersona[] = [
  { id: 'stoic', name: 'The Stoic Sage', description: "Wisdom, virtue, and tranquility. The Stoic offers guidance based on timeless principles of logic and self-control.", Icon: StoicIcon, systemInstruction: "You are a Stoic philosopher like Marcus Aurelius or Seneca. Your advice is practical, focused on what the user can control, and emphasizes virtue, reason, and accepting fate. Your tone is calm, wise, and direct." },
  { id: 'zen', name: 'The Zen Monk', description: "Mindfulness, presence, and compassion. The Monk helps you find peace in the present moment.", Icon: ZenIcon, systemInstruction: "You are a Zen Buddhist monk. Your guidance is centered on mindfulness, being present, and compassion for oneself and others. You often speak in simple metaphors and encourage observation without judgment." },
  { id: 'vivekananda', name: 'The Vedantic Master', description: "Strength, self-belief, and spiritual power. The Master inspires you to find the divine strength within.", Icon: VivekanandaIcon, systemInstruction: "You are a spiritual master in the vein of Swami Vivekananda. Your words are powerful, uplifting, and filled with conviction. You speak of the infinite potential and divine strength within the user. Your goal is to awaken their self-belief." },
  { id: 'shiva', name: 'Shiva, The Destroyer', description: "Discipline, destruction of ego, and transformation. Shiva guides you to destroy the old to make way for the new.", Icon: ShivaIcon, systemInstruction: "You are the Hindu deity Shiva, the destroyer of ego and illusion. Your tone is formidable, powerful, and deeply transformational. You speak of discipline (tapasya), cosmic cycles, and the necessity of destroying the old self to build a new one. Your guidance is not gentle; it is a purifying fire." },
  { id: 'custom', name: 'Custom Mentor', description: "Define your own guide. Their personality and wisdom are shaped by you.", Icon: CustomMentorIcon, systemInstruction: "You are a wise and compassionate mentor. You are here to listen and provide guidance based on the user's needs." }
];

export const MENTOR_ARTICLES: MentorArticle[] = [
  // This data remains the same as it is very long.
  {
    title: "Understanding the Urge",
    summary: "Deconstruct the mechanics of a craving to rob it of its power.",
    Icon: BrainIcon,
    keyTakeaways: [
      "An urge is a neurological habit loop: Cue, Craving, Response, Reward.",
      "The urge itself cannot harm you; only your response to it can.",
      "Mindfulness creates a 'pause' between craving and response.",
      "Your goal is not to eliminate urges, but to change your relationship with them."
    ],
    sections: [
      {
        title: "The Anatomy of a Craving",
        content: `An urge is not a single, monstrous thing. It's a process, a habit loop hardwired into our brains. It consists of four parts:\n\n1.  **The Cue:** The trigger that starts the loop. This can be external (seeing a specific image, being in a certain location) or internal (a feeling of stress, boredom, or loneliness).\n\n2.  **The Craving:** The intense desire or anticipation of a reward. Your brain remembers the dopamine hit from the past and starts demanding it. This is the part that feels so overwhelming.\n\n3.  **The Response:** The action you take. This is the habit you are trying to break.\n\n4.  **The Reward:** The temporary relief, pleasure, or distraction you get from the action. This reinforces the entire loop, making it stronger for the next time.\n\nUnderstanding this structure is your first step to dismantling it. You are not fighting a beast; you are reprogramming a machine.`
      },
      {
        title: "The Power of the Pause",
        content: `The space between the Craving and the Response is where your power lies. In the past, this space was infinitesimally small. The craving happened, and the response was automatic. Your primary goal is to widen this space, to create a 'pause'.\n\nWhen you feel the urge rising, your first job is not to fight it. Fighting it gives it energy. Instead, observe it. Acknowledge it without judgment. Say to yourself, "Ah, there is the craving. I see you." This simple act of mindfulness separates you from the urge. You are not the urge; you are the one who is observing the urge.\n\nIn this pause, you can make a new choice. You can breathe. You can get up and walk. You can use a tool from this app. By not acting automatically, you are weakening the neural pathway. You are teaching your brain that the cue does not have to lead to the same old response.`
      }
    ]
  },
  {
    title: "Building a New Identity",
    summary: "Stop fighting who you were. Start building who you are.",
    Icon: IdentityIcon,
    keyTakeaways: [
      "You cannot become a new person by focusing on the old one.",
      "Every disciplined action is a 'vote' for your new identity.",
      "Identity change is a lagging measure of your habits.",
      "Focus on the process, not the outcome, and the identity will follow."
    ],
    sections: [
      {
        title: "The Two-Step Process",
        content: `Changing your identity is a simple, two-step process, as outlined by author James Clear:\n\n1.  **Decide the type of person you want to be.** What are their values? What are their principles? For example, "I want to be the type of person who is mentally and physically strong," or "I want to be the type of person who is reliable and present for my family."\n\n2.  **Prove it to yourself with small wins.** Your identity emerges out of your habits. Every action you take is a vote for the type of person you wish to become. You don't become a 'healthy person' by wanting it; you become one by casting votes—eating a healthy meal, going for a run, getting enough sleep.\n\nYour current journey is a powerful way to cast votes for a new identity. Every check-in is a vote. Every journal entry is a vote. Every urge you overcome is a landslide victory.`
      },
      {
        title: "Focus on the System, Not the Goal",
        content: `If you focus only on the goal (e.g., a 90-day streak), you are in a constant state of 'failure' until you reach it. This is demotivating. Instead, fall in love with the system, the process of becoming.\n\nYour system is your daily set of habits and practices. It's your check-in, your journaling, your exercise, your reading. You can execute your system every single day. And by doing so, you get a continuous stream of small victories that build your confidence and reinforce your new identity.\n\nDon't worry about the person you were last week. Focus only on casting one more vote for the person you want to be, right now. Do this enough times, and you won't have to convince yourself you've changed. You'll just be that person.`
      }
    ]
  },
  {
    title: "The Stoic's Fortress",
    summary: "Build an inner citadel that no external event can breach.",
    Icon: PillarIcon,
    keyTakeaways: [
        "You do not control external events, but you have absolute control over your response to them.",
        "Your inner peace is your most valuable asset. Protect it.",
        "Discomfort is an opportunity to practice virtue and resilience.",
        "Your perception, not the event itself, is what causes you to distress."
    ],
    sections: [
        {
            title: "The Dichotomy of Control",
            content: "The most fundamental principle of Stoicism is understanding what is within your control and what is not. You do not control the weather, the economy, or what other people say and do. You do not even fully control your own health or reputation. What do you control? Your thoughts, your judgments, your decisions, and your actions.\n\nWhen you feel an urge, the feeling itself may not be in your control; it is an echo of past conditioning. But your response to it? That is 100% within your control. This is the fortress of the mind. By focusing your energy exclusively on your choices and actions, you become invincible. External events can buffet you, but they cannot break you, because your core self—your will—remains untouched and under your command."
        },
        {
            title: "Building Your Inner Citadel",
            content: "Marcus Aurelius spoke of building an 'inner citadel,' a fortress of the mind to which you can retreat at any time. This app, this journey, is a part of that construction. Every day you practice discipline, you are adding another stone to the wall. Every time you reflect in your journal, you are reinforcing the gates.\n\nHow do you build it? Through practice. Practice enduring small discomforts. Take a cold shower. Work out when you don't feel like it. Read a book instead of scrolling. These small, voluntary hardships are training exercises. They are 'drills' for the mind, preparing you for the inevitable, larger challenges of life. When a powerful urge or a difficult life event occurs, you won't be caught unprepared. You will have a well-drilled garrison of virtues ready to defend your peace."
        }
    ]
  },
  {
    title: "Emotional Regulation",
    summary: "Learn to surf the waves of emotion instead of being drowned by them.",
    Icon: HeartWaveIcon,
    keyTakeaways: [
        "Emotions are data, not directives. They provide information, not orders.",
        "Labeling your emotions precisely can significantly reduce their intensity.",
        "The 'Reframing' technique can change your emotional response to a situation.",
        "Your breath is the remote control for your nervous system."
    ],
    sections: [
        {
            title: "Name It to Tame It",
            content: "Neuroscience shows that the simple act of putting a label on an emotion can dampen the response in the amygdala (the brain's alarm center) and increase activity in the prefrontal cortex (the thinking part of the brain). When you feel a negative emotion rising, don't just say 'I feel bad.' Get specific. Is it 'anxious'? 'Lonely'? 'Frustrated'? 'Resentful'?\n\nBy giving the feeling a precise name, you move from being a victim of the emotion to being an observer of it. You are externalizing it. This small act of labeling creates a space for you to think and choose your response, rather than simply reacting based on the raw feeling."
        },
        {
            title: "The Power of the Reframe",
            content: "Cognitive reframing is the act of changing your perspective on a situation to change your emotional response. An urge is not a 'terrible curse'; it can be reframed as an 'opportunity to build strength.' A lonely evening is not 'unbearable'; it can be reframed as 'a period of peaceful solitude for deep work and reflection.'\n\nThis is not about lying to yourself. It's about recognizing that most situations are neutral; it is our interpretation of them that creates our suffering. Ask yourself: 'What is another way to look at this?' or 'What could I learn from this feeling?' By actively searching for a more empowering frame, you take control of your emotional narrative. You are no longer just reading the story of your feelings; you are writing it."
        }
    ]
  },
  {
    title: "The Power of Your Environment",
    summary: "You don't need more willpower. You need a better environment.",
    Icon: EnvironmentIcon,
    keyTakeaways: [
        "Your environment is the invisible hand that shapes your behavior.",
        "Make your desired actions easy and your undesired actions difficult.",
        "Willpower is a finite resource; use it to build better systems, not to fight daily battles.",
        "Curate your physical and digital spaces as if your success depends on it—because it does."
    ],
    sections: [
        {
            title: "The Architect of Your Choices",
            content: "We like to think we are in complete control of our decisions, but the truth is, our environment has a profound influence on our actions. If there is junk food on your counter, you will eventually eat it. If your phone is buzzing with notifications next to you, you will eventually check it. The most disciplined people are not masters of willpower; they are masters of their environment. They structure their lives to make good habits easy and bad habits hard.\n\nBecome the architect of your own choices. Want to read more? Put a book on your pillow. Want to stop mindlessly scrolling? Put your phone in another room. Want to avoid temptation? Add friction. Use website blockers. Delete apps. Make the path to your old habit so difficult and inconvenient that your brain chooses the easier, better path by default."
        },
        {
            title: "Social Contagion",
            content: "Your environment includes the people you spend time with. Habits are socially contagious. You will, over time, gravitate towards the beliefs and behaviors of your social circle. This is one of the most powerful and overlooked forces in self-improvement.\n\nThis doesn't mean you must abandon all your old friends. It means you must be intentional about curating your social inputs. Seek out people who embody the qualities you wish to cultivate. Spend more time with those who lift you up and less time with those who pull you down. Listen to podcasts, read books, and consume content from people you admire. By consciously choosing your 'tribe'—even a digital one—you create a powerful current of positive influence that will carry you toward your goals."
        }
    ]
  },
   {
    title: "The Science of Dopamine",
    summary: "Understand the chemical that drives your desires.",
    Icon: DopamineNeuronIcon,
    keyTakeaways: [
      "Dopamine is not about pleasure, but about motivation and anticipation.",
      "Your old habit created a 'dopamine spike' that made normal life feel dull.",
      "A 'dopamine detox' helps reset your brain's reward system.",
      "Find joy in low-dopamine, high-effort activities to build a sustainable sense of reward."
    ],
    sections: [
      {
        title: "The Motivation Molecule",
        content: `We often think of dopamine as the 'pleasure chemical,' but that's not quite right. Dopamine is the 'motivation chemical.' It's what drives you to seek rewards. The brain releases dopamine not when you *get* the reward, but in *anticipation* of it. It's the thrill of the hunt, not the feast.\n\nYour old habit hijacked this system. It provided an unnaturally high spike of dopamine for very little effort. This taught your brain to crave that specific, intense reward above all others. As a result, the rewards of normal life—reading a book, having a good conversation, watching a sunset—felt dull and unmotivating because they couldn't compete with the artificial high. Your journey is about retraining your brain to find satisfaction in these natural, healthier sources of dopamine.`
      },
      {
        title: "Healing Your Receptors",
        content: `When your brain is constantly flooded with high levels of dopamine, your receptors downregulate—they become less sensitive to protect themselves. This is why you needed more and more of the old habit to feel the same effect, and why everything else felt boring.\n\nBy abstaining, you are giving your dopamine receptors a chance to heal and reset. This process can be uncomfortable. It's the period of flatness, boredom, and anhedonia (lack of pleasure) that many people experience in the early stages. This is a sign of healing, not a sign of failure. It is your brain recalibrating its definition of 'rewarding.'\n\nEmbrace low-dopamine activities. Go for a walk in nature. Meditate. Exercise. Read a challenging book. These activities don't provide a huge spike, but they provide a sustainable, healthy level of satisfaction that rebuilds your reward system from the ground up.`
      }
    ]
  },
  {
    title: "The Art of Self-Compassion",
    summary: "Be your own ally, not your own worst critic.",
    Icon: SelfCompassionIcon,
    keyTakeaways: [
      "Self-compassion is not self-pity or making excuses.",
      "It involves treating yourself with the same kindness you would offer a good friend.",
      "Shame and self-criticism are terrible long-term motivators.",
      "Acknowledge your mistakes without letting them define your identity."
    ],
    sections: [
      {
        title: "The Three Pillars",
        content: `According to Dr. Kristin Neff, self-compassion has three core components:\n\n1.  **Self-Kindness vs. Self-Judgment:** This means being gentle and understanding with yourself when you suffer, fail, or feel inadequate, rather than ignoring your pain or berating yourself with self-criticism.\n\n2.  **Common Humanity vs. Isolation:** Recognizing that suffering and personal inadequacy are part of the shared human experience – something that we all go through rather than being something that happens to 'me' alone.\n\n3.  **Mindfulness vs. Over-Identification:** This involves taking a balanced approach to our negative emotions so that feelings are observed with openness and clarity. You don't suppress your pain, but you also don't get carried away by it.`
      },
      {
        title: "A More Powerful Motivator",
        content: `Many of us believe that harsh self-criticism is necessary for motivation. We think that if we're not hard on ourselves, we'll become lazy and complacent. The research shows the exact opposite. Shame and fear are paralyzing. They lead to avoidance and a desire to escape—often by returning to the very habit you're trying to quit.\n\nSelf-compassion, on the other hand, creates a sense of safety. It allows you to look at your mistakes honestly, without the fear of self-annihilation. It says, "Yes, I made a mistake. That's okay, it's part of being human. What can I learn from this so I can do better next time?" This mindset fosters resilience and a genuine desire to improve, not from a place of self-hatred, but from a place of self-worth.`
      }
    ]
  },
  {
    title: "Finding Your 'Why'",
    summary: "A powerful purpose is the ultimate source of discipline.",
    Icon: CompassIcon,
    keyTakeaways: [
      "Your 'Why' is the deep, intrinsic reason you are on this journey.",
      "It should be a positive, constructive goal, not just the avoidance of a negative.",
      "Connect your daily actions to this larger purpose.",
      "Revisit and refine your 'Why' to keep it a living source of motivation."
    ],
    sections: [
      {
        title: "Beyond 'What'",
        content: `Many people start this journey focused on the 'What': "I want to stop doing X." This is a necessary start, but it's not a sufficient source of long-term motivation. The absence of a negative is not a compelling vision for the future. You need a 'Why.'\n\nYour 'Why' is the reason *behind* the reason. Why do you want to stop? The answer is not just "because it's bad for me." Dig deeper. Is it because you want to be a more present and loving partner? Is it because you have a creative project you want to pour your reclaimed energy into? Is it because you want to experience the mental clarity needed to build a business? Is it because you want to be a role model for your children? Your 'Why' should be a positive, compelling, and deeply personal vision.`
      },
      {
        title: "The Engine of Motivation",
        content: `Once you have a clear 'Why,' it becomes the engine that pulls you forward. Willpower is the act of pushing yourself to do something difficult. A strong purpose is the act of being pulled by something you desperately want. Being pulled is far easier and more sustainable than constantly pushing.\n\nWrite down your 'Why.' Put it somewhere you can see it every day. When you face an urge or feel your motivation waning, don't just focus on resisting. Reconnect with your 'Why.' Remind yourself of the person you are becoming and the life you are building. This transforms the struggle from a chore into a mission. You are not just 'not doing' something; you are actively building your 'Why' into reality, one disciplined choice at a time.`
      }
    ]
  },
   {
    title: "The Importance of Sleep",
    summary: "Your recovery is built on the foundation of a good night's sleep.",
    Icon: MoonIcon,
    keyTakeaways: [
      "Sleep is when your brain repairs itself and consolidates learning.",
      "Lack of sleep severely weakens the prefrontal cortex, your center for impulse control.",
      "Consistent sleep schedules are more important than total hours slept.",
      "A dark, cool, and quiet room is non-negotiable for high-quality sleep."
    ],
    sections: [
      {
        title: "The Brain's Housekeeper",
        content: `During the day, your brain builds up metabolic waste. At night, while you sleep, a remarkable process occurs: your brain's glymphatic system activates, acting like a microscopic cleaning crew. It flushes out these toxins, including beta-amyloid proteins associated with cognitive decline. This is also when your brain consolidates memories and reinforces the new neural pathways you are building through your discipline.\n\nWhen you skimp on sleep, you are skipping this essential cleaning and maintenance cycle. The result is brain fog, poor memory, and emotional instability. Most importantly for your journey, sleep deprivation cripples your prefrontal cortex—the part of your brain responsible for willpower and decision-making. A tired brain is an impulsive brain.`
      },
      {
        title: "The Rules of Rest",
        content: `Improving your sleep is one of the highest-leverage activities you can undertake. The rules are simple, but they require discipline:\n\n1.  **Consistency is King:** Go to bed and wake up at the same time every day, even on weekends. This stabilizes your circadian rhythm.\n\n2.  **Embrace the Dark:** Your bedroom should be pitch black. Use blackout curtains, cover LEDs, and wear an eye mask if necessary. Darkness signals your brain to produce melatonin.\n\n3.  **Stay Cool:** Your body temperature needs to drop to initiate and maintain sleep. Aim for a cool room temperature, around 18°C (65°F).\n\n4.  **The Hour Before Bed:** Create a 'wind-down' routine. No screens (the blue light inhibits melatonin). Read a physical book. Meditate. Journal. Avoid heavy meals and intense exercise. Treat the last hour of your day as a sacred transition into rest.`
      }
    ]
  },
  {
    title: "Breaking the Chain of Habit",
    summary: "How to systematically dismantle the chains of your old self.",
    Icon: BrokenChainIcon,
    keyTakeaways: [
      "You cannot simply 'delete' a habit; you must replace it.",
      "Identify the cue and the reward, then change the routine.",
      "Increase friction for bad habits and decrease friction for good habits.",
      "Start ridiculously small to build momentum."
    ],
    sections: [
      {
        title: "The Habit Loop Revisited",
        content: `As you know, habits follow a Cue -> Craving -> Response -> Reward loop. The golden rule of habit change is not to resist the cue, but to change the response. The cue and the reward stay the same; you just insert a new, better routine in the middle.\n\nFirst, you must become a detective. For a week, every time you feel the urge, write down the answers to these questions: Who are you with? What time is it? Where are you? What emotion are you feeling? What action preceded the urge? After a week, you will have a clear picture of your cues. Is it boredom on a Friday night? Is it stress after a difficult meeting?\n\nOnce you know the cue (e.g., 'feeling stressed after work') and the reward you're seeking (e.g., 'to numb out and feel relief'), you can design a new response. When the cue hits, instead of the old habit, your new routine could be: go for a 15-minute run, meditate for 10 minutes, or call a friend. This provides a different path to the same reward of 'relief.'`
      },
      {
        title: "The Power of Friction",
        content: `Make it easy to do the right thing and hard to do the wrong thing. This is about managing your environment. If you want to break the habit of scrolling social media, delete the apps from your phone. The added friction of having to go to the website and log in will often be enough to break the automatic loop.\n\nConversely, decrease the friction for your good habits. Want to go to the gym in the morning? Lay out your clothes the night before. Want to read more? Put a book on your pillow. Want to eat healthier? Meal prep on Sunday. Every small barrier you remove for a good habit and every small barrier you add for a bad habit makes a huge difference. You are using strategic laziness to your advantage.`
      }
    ]
  },
  {
    title: "The Power of a Morning Routine",
    summary: "Win the morning, win the day.",
    Icon: SunriseIcon,
    keyTakeaways: [
      "A morning routine sets the tone and intention for your entire day.",
      "It allows you to start your day with a victory, building momentum.",
      "Avoid your phone for the first hour of the day at all costs.",
      "A good routine includes something for the mind, body, and spirit."
    ],
    sections: [
      {
        title: "Proactive vs. Reactive",
        content: `How you start your day determines whether you will spend it being proactive or reactive. If the first thing you do is grab your phone, you are immediately flooding your brain with other people's agendas, anxieties, and demands. You are starting the day in a defensive crouch, reacting to the world.\n\nA morning routine allows you to start the day on offense. It's a sacred period of time where you define your priorities and calibrate your mind before the world has a chance to interfere. Even 15-30 minutes of intentional activity can fundamentally change the trajectory of your day.`
      },
      {
        title: "An Example Keystone Routine",
        content: `There is no one-size-fits-all routine, but a powerful one includes three elements:\n\n1.  **Mind:** Do something to clear and focus your mind. This could be 5-10 minutes of meditation, journaling (writing down your thoughts or what you're grateful for), or reading one chapter of a non-fiction book.\n\n2.  **Body:** Do something to energize your physical self. This doesn't have to be an hour-long workout. It could be 10 minutes of stretching, a 15-minute walk outside to get sunlight in your eyes (which helps set your circadian rhythm), or a set of push-ups and squats.\n\n3.  **Spirit (Purpose):** Do something to connect with your 'Why'. Review your goals for the day. Look at the 'Dream Builder' narrative in this app. Remind yourself of the person you are becoming.\n\nBy starting your day with these small victories, you create a powerful positive feedback loop. You've already won before you've even left the house.`
      }
    ]
  },
  {
    title: "Overcoming Plateaus",
    summary: "What to do when your progress stalls and motivation fades.",
    Icon: MountainPeakIcon,
    keyTakeaways: [
      "Plateaus are a normal and necessary part of any long-term journey.",
      "They are a sign that your old methods have become comfortable and are no longer challenging you.",
      "To break a plateau, you must introduce a new, intentional challenge.",
      "Focus on the process, not the feeling of progress. Feelings are fickle; systems are reliable."
    ],
    sections: [
      {
        title: "The Valley of Disappointment",
        content: `Progress is never linear. We expect a straight line upwards, but in reality, it's a series of sprints, stalls, and breakthroughs. The plateau, or what some call the 'valley of disappointment,' is the period where your efforts don't seem to be producing visible results. This is the most dangerous part of any journey, as it's where most people quit. They mistake the lack of visible progress for a lack of actual progress.\n\nUnderstand that even when you can't see the growth, the roots are still deepening. You are still reinforcing your new identity with every day you stick to the system. The key is to detach your effort from your immediate emotional feedback. You don't check in because it feels good; you check in because it's part of the system. You don't journal because you feel inspired; you journal because it's who you are.`
      },
      {
        title: "Introducing a New Stimulus",
        content: `A plateau is often a sign that your mind and body have adapted to your current routine. To stimulate new growth, you need to introduce a new, intentional challenge. This doesn't mean you need to completely overhaul your life. It means adding a small, new layer of difficulty.\n\nIs your physical fitness routine on autopilot? Try a completely new type of exercise. Is your journaling feeling stale? Try a new prompting method, like writing about your fears instead of your gratitude. Are you comfortable in your career? Start a small side project that forces you to learn a new skill.\n\nThis new stimulus creates a 'beginner's mind' again. It forces you to be present and intentional, which can re-ignite your sense of progress and purpose. Don't fear the plateau; see it as a signal that it's time to level up.`
      }
    ]
  }
];


export const LIFE_ATTRIBUTES: LifeAttribute[] = [
    { name: 'Willpower', description: 'Your capacity to resist short-term temptation.', Icon: WillpowerIcon, growthFactor: 1.0 },
    { name: 'Focus', description: 'Your ability to concentrate on a single task.', Icon: FocusIcon, growthFactor: 1.2 },
    { name: 'Clarity', description: 'The sharpness and purity of your thoughts.', Icon: ClarityIcon, growthFactor: 1.4 },
    { name: 'Energy', description: 'Your physical and mental vitality.', Icon: EnergyIcon, growthFactor: 1.1 },
    { name: 'Discipline', description: 'The ability to do what is necessary, regardless of mood.', Icon: DisciplineIcon, growthFactor: 1.3 },
    { name: 'Confidence', description: 'Your trust in your own abilities and judgment.', Icon: ConfidenceIcon, growthFactor: 1.5 },
    { name: 'Resilience', description: 'Your capacity to recover quickly from difficulties.', Icon: ResilienceIcon, growthFactor: 1.6 },
    { name: 'Attention from Women', description: 'Your ability to attract and captivate female attention.', Icon: FemaleAttentionIcon, growthFactor: 1.8 },
];

export const PROVOCATEURS = ['Boredom', 'Stress', 'Loneliness', 'Fatigue', 'Anxiety', 'Social Media', 'Curiosity', 'Habit', 'Alcohol', 'Negative Emotions'];

export const BRAIN_REWIRING_COMPONENTS: BrainRewiringComponent[] = [
    { name: 'Habit Deconstruction', description: 'The old neural pathways are weakening from disuse. The automatic urge-response cycle is being broken.', daysToComplete: 30 },
    { name: 'Dopamine Receptor Healing', description: 'Your brain\'s reward system is resetting. Receptors are becoming sensitive again to natural, healthy pleasures.', daysToComplete: 60 },
    { name: 'Trigger Desensitization', description: 'Cues that once caused an immediate craving are slowly losing their power over you through repeated, non-engagement.', daysToComplete: 90 },
    { name: 'Emotional Baseline Reset', description: 'Your default emotional state is returning to a calmer, more stable baseline, less dependent on external stimulation.', daysToComplete: 180 },
    { name: 'Prefrontal Cortex Strength', description: 'The "CEO" of your brain, responsible for impulse control and long-term planning. It strengthens with every disciplined choice.', daysToComplete: 365 },
];