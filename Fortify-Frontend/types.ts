

import { type FC, type SVGProps } from 'react';

export type IconType = FC<SVGProps<SVGSVGElement>>;

export type AppTheme = 'default' | 'legend';

export interface Rank {
  name: string;
  daysRequired: number;
  Icon: IconType;
  abilityDescription: string;
  aetherBonus: number;
}

export interface JournalEntry {
  id: string;
  content: string;
  date: string;
  mood?: string;
  urgeIntensity?: number;
  provocateurs?: string[];
}

export interface CheckInData {
  lastCheckinTimestamp: number | null;
  streak: number;
}

export interface BadgeConditionContext {
    streakDays: number;
    journalEntryCount: number;
    checkInStreak: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  Icon: IconType;
  condition: (context: BadgeConditionContext) => boolean;
}

export interface EarnedBadge {
  id: string;
  date: string;
}

export interface StoryChapter {
  daysRequired: number;
  title: string;
  theme: string;
  Icon: IconType;
  sections: Array<{
    title: string;
    content: string;
  }>;
}

export interface Reward {
  id: string;
  rankToUnlock: string;
  title: string;
  description: string;
  type: 'tool' | 'content';
  content?: string; // For content type
  Icon: IconType;
}

export type WagerableItem = { type: 'aether'; amount: number };

export interface ActiveWager {
  goalDays: number; // The target streak length for this wager
  wager: WagerableItem;
  startStreakDays: number; // The streak length when the wager was made
}

export interface LegacyEntry {
    type: 'ai' | 'user';
    content: string;
    date: string;
}

// --- MENTOR TYPES ---

export interface MentorPersona {
  id: string;
  name: string;
  description: string;
  Icon: IconType;
  systemInstruction: string;
}

export interface ChatMessage {
    role: 'user' | 'model';
    content: string;
}

export interface MentorArticle {
    title: string;
    summary: string;
    Icon: IconType;
    keyTakeaways: string[];
    sections: Array<{
        title: string;
        content: string;
    }>;
}


export interface LifeAttribute {
  name: string;
  description: string;
  Icon: IconType;
  growthFactor: number;
}

export interface DailyMindset {
  quote: string;
  affirmation: string;
  story: string;
}

export interface CheckInValidationResult {
  status: 'valid' | 'suspicious';
  reasoning:string;
}

export interface EmergencyNudge {
  title: string;
  message: string;
  action: string;
}

export interface EnhancedEmergencyNudge {
  personalizedMessage: string;
  rescuePlan: string[];
  visionReminder: string;
}


export interface WeeklyReview {
  biggestWin: string;
  toughestChallenge: string;
  unseenPattern: string;
  nextWeekMission: string;
}

export interface DreamBuilderInputs {
  feeling: string;
  morningAction: string;
  interaction: string;
  accomplishment: string;
}

export interface SocraticContext {
  urgeIntensity: number;
  provocateurs: string[];
  journalEntry: string;
}

export interface BrainRewiringComponent {
  name: string;
  description: string;
  daysToComplete: number;
}

// --- NEW REWARD TOOL TYPES ---

export interface JournalTemplate {
    title: string;
    template: string;
}

export interface VulnerabilityShield {
    mindset: string;
    shieldActions: string[];
    escapeRoute: string;
}

export interface GuidedMeditation {
    title: string;
    script: string;
}

export interface OracleResponse {
    question: string;
    answer: string;
}

export interface RatingState {
  lastPromptDate: string | null;
  promptCount: number;
  hasRated: boolean;
}

// New type for centralized Play Billing state
export interface PlayBillingState {
  hasActiveSubscription: boolean;
  subscriptionExpiryDate: string | null;
  subscriptionId: string | null;
  lastPurchaseToken: string | null;
}

// --- Main Application State ---
// This now represents the entire user state synced with Firestore.
export interface AppState {
  streakStartDate: string | null;
  lastShownRankName: string | null;
  earnedBadges: EarnedBadge[];
  checkInData: CheckInData;
  aether: number;
  activeWager: ActiveWager | null;
  selectedMentorId: string;
  customMentor: Partial<MentorPersona>;
  appTheme: AppTheme;
  legacyLog: LegacyEntry[];
  hasWrittenProverb: boolean;
  falseCheckInCounter: number;
  visionNarrative: string | null;
  lastReviewDate: string | null;
  streakOffsetMillis: number;
  
  // --- Data moved from localStorage to cloud ---
  journalEntries: JournalEntry[];
  checkInHistory: string[];
  legendAchieved: boolean;
  ratingState: RatingState;
  v2_migration_complete?: boolean;
  mentorChatHistory: ChatMessage[];
  sanctuaryChatHistory: ChatMessage[];

  // --- Notification Settings ---
  fcmToken: string | null;
  timezone: string | null;
  notificationTime: string | null; // e.g. "22:00"

  // --- Subscription & Trial State ---
  trialStartDate: string | null;
  hasClaimedRatingReward?: boolean;
  playBilling: PlayBillingState | null;
}