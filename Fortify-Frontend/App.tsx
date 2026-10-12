import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import MilestoneTracker from './components/MilestoneTracker';
import BadgeNotification from './components/BadgeNotification';
import RewardNotification from './components/RewardNotification';
import WagerNotification from './components/WagerNotification';
import UltimateGoal from './components/UltimateGoal';
import PanicButton from './components/PanicButton';
import Auth from './components/Auth';
import NotificationControl from './components/NotificationControl';
import UserIcon from './components/UserIcon';
import StreakTimer from './components/StreakTimer';
import DailyMindset from './components/DailyMindset';
import TrialBanner from './components/TrialBanner';

import { type Rank, type JournalEntry, type Reward, type ActiveWager, type DreamBuilderInputs, type SocraticContext, type JournalTemplate, type Badge, type EmergencyNudge, type EnhancedEmergencyNudge, type WeeklyReview, type DailyMindset as DailyMindsetType, type LegacyEntry, type WagerableItem, type ChatMessage, AppState, RatingState } from './types';
import { RANKS, BADGES, REWARDS, MENTOR_PERSONAS, GRANDMASTER_LEGACY_BADGE, GrandmasterIcon, WarningIcon, BrainIcon, BRAIN_REWIRING_COMPONENTS } from './constants';
import { getMentorResponse, generateLegacySummary, getDailyMindset, validateCheckIn, getEmergencyNudge, getEnhancedEmergencyNudge, getWeeklyReview, generateVisionNarrative, getJournalingTemplate, getSubscriptionPitch, verifyRatingScreenshot } from './services/geminiService';
import { useAuth } from './contexts/AuthContext';
import { getFCMToken } from './firebase-config';

// This is a mock of the global firebase object provided by the Firebase SDK scripts.
declare const firebase: any;

// Lazy load modals and components that are not visible on initial render
const MilestoneModal = lazy(() => import('./components/MilestoneModal'));
const LegendTriumphModal = lazy(() => import('./components/LegendTriumphModal'));
const CheckinConfirmationModal = lazy(() => import('./components/CheckinConfirmationModal'));
const FalseCheckInNudgeModal = lazy(() => import('./components/FalseCheckInNudgeModal'));
const PatternInterruptModal = lazy(() => import('./components/PatternInterruptModal'));
const WeeklyReviewModal = lazy(() => import('./components/WeeklyReviewModal'));
const SocraticInterrogatorModal = lazy(() => import('./components/SocraticInterrogatorModal'));
const BrainRewiringModal = lazy(() => import('./components/BrainRewiringModal'));
const FullJourneyModal = lazy(() => import('./components/FullJourneyModal'));
const VulnerabilityShieldModal = lazy(() => import('./components/VulnerabilityShieldModal'));
const GuidedMeditationModal = lazy(() => import('./components/GuidedMeditationModal'));
const OracleModal = lazy(() => import('./components/OracleModal'));
const MissedCheckinModal = lazy(() => import('./components/MissedCheckinModal'));
const RelapseConfirmationModal = lazy(() => import('./components/RelapseConfirmationModal'));
const ReportContentModal = lazy(() => import('./components/ReportContentModal'));
const RatingModal = lazy(() => import('./components/RatingModal'));
const StoryJourney = lazy(() => import('./components/StoryJourney'));
const Legacy = lazy(() => import('./components/Legacy'));
const Sanctuary = lazy(() => import('./components/Sanctuary'));
const Rewards = lazy(() => import('./components/Rewards'));
const CommitmentVault = lazy(() => import('./components/CommitmentVault'));
// FIX: Added lazy import for the Mentor component to resolve 'Cannot find name 'Mentor'' error.
const Mentor = lazy(() => import('./components/Mentor'));
const Account = lazy(() => import('./components/Account'));


// Haptic feedback utility for a more tactile experience
const triggerHapticFeedback = (pattern: number | number[] = 20) => {
  // Check if the Vibration API is supported
  if (typeof window !== 'undefined' && window.navigator && 'vibrate' in window.navigator) {
    try {
      // Vibrate the device with the specified pattern
      window.navigator.vibrate(pattern);
    } catch (e) {
      // Haptic feedback failed, do nothing.
    }
  }
};


type Tab = 'streak' | 'story' | 'sanctuary' | 'rewards' | 'vault' | 'mentor' | 'legacy' | 'account';

type StoredMindset = {
    date: string; // YYYY-MM-DD
    mindset: DailyMindsetType;
}

const LoadingFallback: React.FC = () => (
    <div className="flex-grow flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-accent-primary)]"></div>
    </div>
);

// --- TIMEZONE-AWARE DATE FORMATTER (Moved outside component for performance) ---
const toLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};


const MainAppView: React.FC = () => {
    const { appState, setAppState, logout } = useAuth();
  
    const {
      streakStartDate,
      lastShownRankName,
      earnedBadges,
      checkInData,
      aether,
      activeWager,
      selectedMentorId,
      customMentor,
      appTheme,
      legacyLog,
      hasWrittenProverb,
      falseCheckInCounter,
      visionNarrative,
      lastReviewDate,
      streakOffsetMillis,
      
      // State moved from local to cloud
      journalEntries,
      checkInHistory,
      legendAchieved,
      ratingState,
      mentorChatHistory,
      sanctuaryChatHistory,
      
      // Notification state
      fcmToken,
      notificationTime,
      timezone,
  
      // Subscription State
      trialStartDate,
      hasClaimedRatingReward,
      playBilling,
    } = appState;
  
    // UI State
    const [activeTab, setActiveTab] = useState<Tab>('streak');
    const [isMilestoneModalOpen, setMilestoneModalOpen] = useState(false);
    const [isLegendModalOpen, setLegendModalOpen] = useState(false);
    const [isJourneyModalOpen, setJourneyModalOpen] = useState(false);
    const [newlyEarnedBadge, setNewlyEarnedBadge] = useState<Badge | null>(null);
    const [newlyUnlockedReward, setNewlyUnlockedReward] = useState<Reward | null>(null);
    const [wagerNotification, setWagerNotification] = useState<{status: 'won' | 'lost', message: string} | null>(null);
    const [isMentorTyping, setIsMentorTyping] = useState(false);
    const [isCheckinConfirmationOpen, setCheckinConfirmationOpen] = useState(false);
    const [isVerifyingCheckIn, setIsVerifyingCheckIn] = useState(false);
    const [checkInNudge, setCheckInNudge] = useState<{ isOpen: boolean; reasoning: string }>({ isOpen: false, reasoning: '' });
    const [socraticContext, setSocraticContext] = useState<SocraticContext | null>(null);
    const [isVulnerabilityShieldModalOpen, setVulnerabilityShieldModalOpen] = useState(false);
    const [isGuidedMeditationModalOpen, setGuidedMeditationModalOpen] = useState(false);
    const [isOracleModalOpen, setOracleModalOpen] = useState(false);
    const [isMissedCheckinModalOpen, setMissedCheckinModalOpen] = useState(false);
    const [isRelapseConfirmationOpen, setRelapseConfirmationOpen] = useState(false);
    const [reportModalState, setReportModalState] = useState<{isOpen: boolean, content: string}>({isOpen: false, content: ''});
    const [isRatingModalOpen, setRatingModalOpen] = useState(false);
    const [isBrainRewiringModalOpen, setBrainRewiringModalOpen] = useState(false);
    const [weeklyReviewData, setWeeklyReviewData] = useState<WeeklyReview | null>(null);
    const [isWeeklyReviewModalOpen, setWeeklyReviewModalOpen] = useState(false);
    const [isGeneratingReview, setIsGeneratingReview] = useState(false);
    const [isGeneratingVision, setIsGeneratingVision] = useState(false);
    
    const [dailyMindset, setDailyMindset] = useState<DailyMindsetType | null>(null);
    const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
    
    // SOS/Pattern Interrupt State
    const [isPatternInterruptModalOpen, setPatternInterruptModalOpen] = useState(false);
    const [patternInterruptHistory, setPatternInterruptHistory] = useState<(EmergencyNudge | EnhancedEmergencyNudge)[]>([]);
    const [isFetchingPatternInterrupt, setIsFetchingPatternInterrupt] = useState(false);

    // Screenshot Verification State
    const [isVerifyingScreenshot, setIsVerifyingScreenshot] = useState(false);
    const [screenshotVerificationResult, setScreenshotVerificationResult] = useState<{success: boolean; message: string} | null>(null);
  
    // --- DERIVED STATE ---
    const lastShownRank = useMemo(() => lastShownRankName ? RANKS.find(r => r.name === lastShownRankName) || null : null, [lastShownRankName]);
    
    const effectiveStreakStartDate = useMemo(() => {
      if (!streakStartDate) return null;
      const date = new Date(streakStartDate);
      if (isNaN(date.getTime())) {
          return null;
      }
      return new Date(date.getTime() + streakOffsetMillis);
    }, [streakStartDate, streakOffsetMillis]);
    
    const appStreakDays = useMemo(() => {
      if (!effectiveStreakStartDate) return 0;
      
      const today = new Date();
      
      // Clone date to avoid modifying original
      const startDate = new Date(effectiveStreakStartDate);
  
      // Set times to midnight in local timezone to compare day boundaries
      today.setHours(0, 0, 0, 0);
      startDate.setHours(0, 0, 0, 0);
  
      const diffTime = today.getTime() - startDate.getTime();
  
      // Calculate difference in days. Using Math.round is more robust against
      // Daylight Saving Time changes where a day might not be exactly 24 hours long.
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
      return Math.max(0, diffDays);
    }, [effectiveStreakStartDate]);
  
    const currentRank = useMemo(() => (
      [...RANKS].reverse().find(rank => appStreakDays >= rank.daysRequired) || RANKS[0]
    ), [appStreakDays]);
    
    const calculateAetherReward = useCallback((days: number) => {
      return Math.max(5, 10 - Math.floor(days / 30));
    }, []);
  
    const dailyAetherReward = useMemo(() => calculateAetherReward(appStreakDays), [appStreakDays, calculateAetherReward]);
  
    const hasCheckedInToday = useMemo(() => {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      return checkInData.lastCheckinTimestamp ? checkInData.lastCheckinTimestamp >= todayStart.getTime() : false;
    }, [checkInData.lastCheckinTimestamp]);
  
    const hasLoggedJournalToday = useMemo(() => {
      if (journalEntries.length === 0) return false;
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const latestEntryDate = new Date(journalEntries[0].date);
      return latestEntryDate >= todayStart;
    }, [journalEntries]);
  
    const canCheckInTime = new Date().getHours() >= 21;
  
    const isReviewAvailable = useMemo(() => {
      if (journalEntries.length < 7) return false;
      if (!lastReviewDate) return true;
      const sevenDaysInMillis = 7 * 24 * 60 * 60 * 1000;
      return new Date().getTime() - new Date(lastReviewDate).getTime() > sevenDaysInMillis;
    }, [journalEntries.length, lastReviewDate]);
    
    const unlockedToolIds = useMemo(() => {
      if (!currentRank) return [];
      const currentRankIndex = RANKS.findIndex(r => r.name === currentRank.name);
      return REWARDS
        .filter(reward => {
            const rewardRankIndex = RANKS.findIndex(r => r.name === reward.rankToUnlock);
            return currentRankIndex >= rewardRankIndex;
        })
        .map(r => r.id);
    }, [currentRank]);
    
    const recentMissedDays = useMemo(() => {
      if (!streakStartDate) return [];
      const missed: Date[] = [];
      const historySet = new Set(checkInHistory);
      const today = new Date();
      const startDate = new Date(streakStartDate);
  
      for (let i = 1; ; i++) {
          const pastDate = new Date(today);
          pastDate.setDate(today.getDate() - i);
          if (pastDate < startDate) break;
          const dateString = toLocalDateString(pastDate);
          if (!historySet.has(dateString)) {
              missed.push(pastDate);
          }
      }
      return missed.sort((a, b) => b.getTime() - a.getTime());
    }, [streakStartDate, checkInHistory]);
  
    const hasMissedCheckins = useMemo(() => recentMissedDays.length > 0, [recentMissedDays]);
    
    // --- SUBSCRIPTION & PAYWALL LOGIC ---
    const isSubscribed = useMemo(() => playBilling?.hasActiveSubscription ?? false, [playBilling]);

    const { isTrialActive, trialDaysLeft } = useMemo(() => {
      if (!trialStartDate) return { isTrialActive: false, trialDaysLeft: 0 };
      const trialStart = new Date(trialStartDate);
      const trialEndDate = new Date(trialStart.getTime() + 7 * 24 * 60 * 60 * 1000);
      const now = new Date();
      const isActive = now < trialEndDate;
      // Ensure days left doesn't go below 0 for display
      const daysLeft = Math.max(0, Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      return { isTrialActive: isActive, trialDaysLeft: daysLeft };
    }, [trialStartDate]);
  
    const isAppLocked = useMemo(() => !isTrialActive && !isSubscribed, [isTrialActive, isSubscribed]);
    const [subscriptionPitch, setSubscriptionPitch] = useState<string | null>(null);
    const [isPitchLoading, setIsPitchLoading] = useState(false);
  
    // --- EFFECTS ---
  
    useEffect(() => {
      // If the app is locked, force the user to the account/subscription tab.
      if (isAppLocked) {
        setActiveTab('account');
      }
    }, [isAppLocked]);
  
    useEffect(() => {
      const generatePitch = async () => {
          // Only generate pitch if the app is locked and the user is on the account tab.
          if (isAppLocked && activeTab === 'account' && !subscriptionPitch && !isPitchLoading) {
              setIsPitchLoading(true);
              try {
                  const journalSummary = journalEntries.slice(0, 5).map(e => e.content).join(' ');
                  const pitch = await getSubscriptionPitch({ streakDays: appStreakDays, journalSummary });
                  setSubscriptionPitch(pitch);
              } catch (e) {
                  setSubscriptionPitch("You've fought hard to get here. Investing in yourself is the next step to solidifying your new life.");
              } finally {
                  setIsPitchLoading(false);
              }
          }
      };
      generatePitch();
    }, [activeTab, isAppLocked, subscriptionPitch, journalEntries, appStreakDays, isPitchLoading]);
    
    useEffect(() => {
      if (activeTab === 'story' && legacyLog.length > 0) {
        setActiveTab('legacy');
      }
    }, [activeTab, legacyLog]);
  
    useEffect(() => {
        if ('Notification' in window) {
            setNotificationPermission(Notification.permission);
        }
    }, []);
    
    useEffect(() => {
      // If notifications have been granted but we haven't stored the user's timezone,
      // it implies permission was granted outside the standard 'Enable' button flow
      // (e.g., via a Trusted Web Activity wrapper). We must capture and save it now
      // to ensure reminders are sent at the correct local time.
      if (notificationPermission === 'granted' && !timezone) {
        const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        setAppState({ timezone: userTimezone });
      }
    }, [notificationPermission, timezone, setAppState]);
  
    useEffect(() => {
      const fetchMindset = async () => {
        const todayStr = new Date().toISOString().split('T')[0];
        const storedMindsetData = localStorage.getItem('dailyMindset');
        
        if (storedMindsetData) {
          try {
            const storedMindset: StoredMindset = JSON.parse(storedMindsetData);
            if (storedMindset.date === todayStr && storedMindset.mindset) {
              setDailyMindset(storedMindset.mindset);
              return; // Mindset is fresh, no need to fetch
            }
          } catch (e) {
            localStorage.removeItem('dailyMindset');
          }
        }
  
        try {
          const newMindset = await getDailyMindset();
          setDailyMindset(newMindset);
          const newStoredMindset: StoredMindset = {
            date: todayStr,
            mindset: newMindset,
          };
          localStorage.setItem('dailyMindset', JSON.stringify(newStoredMindset));
        } catch (err) {
          setDailyMindset({
              quote: "Your strength is greater than your struggle.",
              affirmation: "I am worthy of a peaceful and free life.",
              story: "Remember that cravings are temporary. Breathe through it, moment by moment. You've got this."
          })
        }
      };
      
      fetchMindset();
      
    }, []);
    
    useEffect(() => {
      if (!streakStartDate) {
          if (streakOffsetMillis !== 0) setAppState({ streakOffsetMillis: 0 });
          return;
      }
  
      let offset = 0;
      const start = new Date(streakStartDate);
      start.setHours(0, 0, 0, 0);
  
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const checkInHistorySet = new Set(checkInHistory);
  
      // ROBUST FIX: Start checking for missed days from the day *after* the streak started.
      // The day a streak begins is implicitly a success and does not require a check-in.
      const dayAfterStart = new Date(start);
      dayAfterStart.setDate(start.getDate() + 1);
  
      for (let d = dayAfterStart; d < today; d.setDate(d.getDate() + 1)) {
          const dateStr = toLocalDateString(d);
          if (!checkInHistorySet.has(dateStr)) {
              offset += 24 * 60 * 60 * 1000;
          }
      }
      
      if (offset !== streakOffsetMillis) {
          setAppState({ streakOffsetMillis: offset });
      }
    }, [streakStartDate, checkInHistory, setAppState]);
  
    const checkAndAwardBadges = useCallback(() => {
      const context = { streakDays: appStreakDays, journalEntryCount: journalEntries.length, checkInStreak: checkInData.streak };
      const newlyEarned = [];
      BADGES.forEach(badge => {
        const isEarned = earnedBadges.some(eb => eb.id === badge.id);
        if (!isEarned && badge.condition(context)) {
          triggerHapticFeedback([100, 50, 100]);
          newlyEarned.push({ id: badge.id, date: new Date().toISOString() });
          setNewlyEarnedBadge(badge);
        }
      });
      if (newlyEarned.length > 0) {
          setAppState({ earnedBadges: [...earnedBadges, ...newlyEarned] });
      }
    }, [appStreakDays, journalEntries.length, checkInData.streak, earnedBadges, setAppState]);
    
    const checkAndUnlockRewards = useCallback((newRank: Rank) => {
        const newRankIndex = RANKS.findIndex(r => r.name === newRank.name);
        const lastShownRankIndex = lastShownRank ? RANKS.findIndex(r => r.name === lastShownRank.name) : -1;
  
        if (newRankIndex > lastShownRankIndex) {
            const oldUnlockedIds = new Set(lastShownRank ? REWARDS.filter(reward => {
                const rewardRankIndex = RANKS.findIndex(r => r.name === reward.rankToUnlock);
                return lastShownRankIndex >= rewardRankIndex;
            }).map(r => r.id) : []);
            
            const newUnlockedRewards = REWARDS.filter(reward => {
                const rewardRankIndex = RANKS.findIndex(r => r.name === reward.rankToUnlock);
                return newRankIndex >= rewardRankIndex;
            });
            
            const justUnlockedReward = newUnlockedRewards.find(r => !oldUnlockedIds.has(r.id));
  
            if (justUnlockedReward) {
                triggerHapticFeedback(50);
                setNewlyUnlockedReward(justUnlockedReward);
            }
        }
    }, [lastShownRank]);
  
    useEffect(() => {
      if (!legendAchieved && appStreakDays >= 365) {
        setAppState({
          appTheme: 'legend',
          legendAchieved: true,
        });
        setLegendModalOpen(true);
      }
    }, [appStreakDays, legendAchieved, setAppState]);
    
    useEffect(() => {
      const wager = activeWager;
      if (wager && appStreakDays - wager.startStreakDays >= wager.goalDays) {
        triggerHapticFeedback([50, 75, 150]);
        const wageredAmount = wager.wager.amount;
        setAppState({
            aether: aether + wageredAmount * 2,
            activeWager: null
        });
        setWagerNotification({ status: 'won', message: `Commitment fulfilled! You won ${wageredAmount * 2} Aether!` });
      }
    }, [appStreakDays, activeWager, setAppState, aether]);
  
    useEffect(() => {
      if(streakStartDate) {
        checkAndAwardBadges();
      }
    }, [appStreakDays, journalEntries.length, checkInData.streak, checkAndAwardBadges, streakStartDate]);
  
    useEffect(() => {
      // Guard against running for new users with no streak, or if the feature is disabled
      if (appStreakDays < 1 || !ratingState) return;
  
      const { hasRated, promptCount, lastPromptDate } = ratingState;
  
      if (hasRated || promptCount >= 8) {
        return; // Don't show if user has rated or been prompted 8 times
      }
      
      // Check if it's the first prompt (promptCount is 0, but they have a streak)
      // or if 7 days have passed since the last prompt.
      const sevenDaysInMillis = 7 * 24 * 60 * 60 * 1000;
      const lastPrompt = lastPromptDate ? new Date(lastPromptDate).getTime() : 0;
      const now = new Date().getTime();
      
      // The first prompt can happen on day 1. Subsequent prompts wait 7 days.
      if (promptCount === 0 || (now - lastPrompt > sevenDaysInMillis)) {
        setRatingModalOpen(true);
        setAppState({
          ratingState: {
            ...ratingState,
            promptCount: promptCount + 1,
            lastPromptDate: new Date().toISOString(),
          }
        });
      }
    }, [appStreakDays, ratingState, setAppState]);
    
  
  
    // --- HANDLERS (wrapped in useCallback for performance) ---
    const handleOpenReportModal = useCallback((content: string) => {
      setReportModalState({ isOpen: true, content });
    }, []);
    
    // Consolidated effect to manage all notification state (token, timezone, default time)
    useEffect(() => {
      const manageNotificationState = async () => {
        if (notificationPermission === 'granted') {
          const updates: Partial<AppState> = {};
          
          // 1. Get/update FCM token
          const token = await getFCMToken();
          if (token && token !== fcmToken) {
            updates.fcmToken = token;
          }
          
          // 2. Get/update timezone
          const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          if (timezone !== userTimezone) {
            updates.timezone = userTimezone;
          }

          // 3. Set default notification time if not already set
          if (!notificationTime) {
            updates.notificationTime = '21:00';
          }
          
          // If there are any updates, send them to Firestore.
          if (Object.keys(updates).length > 0) {
            setAppState(updates);
          }
        }
      };
      
      manageNotificationState();
    }, [notificationPermission, fcmToken, timezone, notificationTime, setAppState]);
    
    const handleEnableNotifications = useCallback(async () => {
      // This function's only job is to get permission and update the state,
      // which then triggers the useEffect above.
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
          triggerHapticFeedback(50);
      }
    }, []);
  
    const handleSetNotificationTime = useCallback((time: string) => {
        setAppState({ notificationTime: time });
    }, [setAppState]);
    
    const handleResetStreak = useCallback(() => {
      setCheckinConfirmationOpen(false);
      if (activeWager) {
          setWagerNotification({ status: 'lost', message: `Commitment failed. You lost your wager of ${activeWager.wager.amount} Aether.` });
      }
      
      setAppState({
          activeWager: null,
          checkInData: { lastCheckinTimestamp: null, streak: 0 },
          appTheme: appTheme === 'legend' ? 'default' : appTheme,
          falseCheckInCounter: 0,
          streakStartDate: null,
          lastShownRankName: null,
          streakOffsetMillis: 0,
      });
    }, [activeWager, appTheme, setAppState]);
    
    const performRelapse = useCallback(() => {
      triggerHapticFeedback([200, 75, 50]);
      if (activeWager) {
          setWagerNotification({ status: 'lost', message: `Commitment failed. You lost your wager of ${activeWager.wager.amount} Aether.` });
      }
      
      setAppState({
          activeWager: null,
          checkInData: { lastCheckinTimestamp: null, streak: 0 },
          appTheme: appTheme === 'legend' ? 'default' : appTheme,
          falseCheckInCounter: 0,
          streakStartDate: null,
          streakOffsetMillis: 0,
          lastShownRankName: null,
      });
    }, [activeWager, setAppState, appTheme]);
    
    const handleReportPastRelapse = useCallback(() => {
      setMissedCheckinModalOpen(false);
      performRelapse();
    }, [performRelapse]);
  
    const handleImmediateRelapse = useCallback(() => {
      setRelapseConfirmationOpen(false);
      performRelapse();
    }, [performRelapse]);
  
    const handleNewRank = useCallback((newRank: Rank) => {
      const newRankIndex = RANKS.findIndex(r => r.name === newRank.name);
      const lastShownRankIndex = lastShownRank ? RANKS.findIndex(r => r.name === lastShownRank.name) : -1;
      
      if (newRankIndex > lastShownRankIndex) {
          triggerHapticFeedback([100, 50, 150, 50, 100]);
          setMilestoneModalOpen(true);
          const aetherBonus = newRank.aetherBonus || 0;
          setAppState({
              aether: aether + aetherBonus,
              lastShownRankName: newRank.name
          });
      }
      checkAndUnlockRewards(newRank);
    }, [lastShownRank, checkAndUnlockRewards, setAppState, aether]);
    
    const handleAddJournalEntry = useCallback((entry: Omit<JournalEntry, 'id' | 'date'>) => {
      if (hasLoggedJournalToday) return;
      const newEntry: JournalEntry = { ...entry, id: Date.now().toString(), date: new Date().toISOString() };
      const reward = calculateAetherReward(appStreakDays);
      setAppState({
          journalEntries: [newEntry, ...journalEntries],
          aether: aether + reward
      });
    }, [hasLoggedJournalToday, calculateAetherReward, appStreakDays, setAppState, journalEntries, aether]);
    
    const handleDeleteJournalEntry = useCallback((id: string) => {
      setAppState({
          journalEntries: journalEntries.filter(entry => entry.id !== id),
          aether: Math.max(0, aether - 10)
      });
    }, [setAppState, journalEntries, aether]);
    
    const isCheckinReady = canCheckInTime && !hasCheckedInToday;
    
    const handleCheckInAttempt = useCallback(async () => {
      if (!canCheckInTime) return;
      setIsVerifyingCheckIn(true);
      try {
          const validation = await validateCheckIn({ journalEntries });
          if (!hasCheckedInToday && validation.status === 'suspicious' && validation.reasoning) {
              setCheckInNudge({ isOpen: true, reasoning: validation.reasoning });
          } else {
              setCheckinConfirmationOpen(true);
          }
      } catch (error) {
          setCheckinConfirmationOpen(true);
      } finally {
          setIsVerifyingCheckIn(false);
      }
    }, [canCheckInTime, journalEntries, hasCheckedInToday]);
  
    const handleConfirmCheckIn = useCallback(() => {
      triggerHapticFeedback(100);
      setCheckinConfirmationOpen(false);
      setCheckInNudge({ isOpen: false, reasoning: '' });
  
      const currentTime = new Date();
      
      // Robustly calculate the start of yesterday's date to handle DST changes correctly.
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const startOfYesterday = new Date(startOfToday);
      startOfYesterday.setDate(startOfToday.getDate() - 1);
      
      const newCheckInData = {
          lastCheckinTimestamp: currentTime.getTime(),
          streak: (checkInData.lastCheckinTimestamp && checkInData.lastCheckinTimestamp >= startOfYesterday.getTime()) ? checkInData.streak + 1 : 1
      };
      
      const todayStr = toLocalDateString(currentTime);
      const newHistory = Array.from(new Set([...checkInHistory, todayStr]));
      
      let aetherUpdate = aether;
      // GUARD: Only award Aether for the current day's check-in, and only if it hasn't been done yet.
      // This prevents any Aether from being awarded for back-filled check-ins, as they use a different mechanism.
      if (falseCheckInCounter < 5 && !hasCheckedInToday) {
          aetherUpdate += calculateAetherReward(appStreakDays);
      }
      setAppState({
          checkInData: newCheckInData,
          aether: aetherUpdate,
          checkInHistory: newHistory
      });
    }, [checkInData, checkInHistory, calculateAetherReward, appStreakDays, setAppState, aether, falseCheckInCounter, hasCheckedInToday]);
    
    const handleBackfillCheckin = useCallback((dateString: string) => {
      if (checkInHistory.includes(dateString)) return;
      setAppState({ checkInHistory: [...checkInHistory, dateString].sort() });
    }, [checkInHistory, setAppState]);
  
    const handleProceedWithSuspiciousCheckIn = useCallback(() => {
      setAppState({ falseCheckInCounter: falseCheckInCounter + 1 });
      setCheckInNudge({ isOpen: false, reasoning: '' });
      setCheckinConfirmationOpen(true);
    }, [setAppState, falseCheckInCounter]);
  
    const handleSetWager = useCallback((goalDays: number, wager: WagerableItem) => {
      triggerHapticFeedback(100);
      setAppState({
          aether: aether - wager.amount,
          activeWager: { goalDays, wager, startStreakDays: appStreakDays }
      });
    }, [appStreakDays, setAppState, aether]);
    
    const handleSendMessageToMentor = useCallback(async (message: string) => {
      triggerHapticFeedback(20);
      const userMessage: ChatMessage = { role: 'user', content: message };
      const currentHistory = [...mentorChatHistory, userMessage];
      setAppState({ mentorChatHistory: currentHistory });
      setIsMentorTyping(true);
  
      const activeMentor = (selectedMentorId === 'custom')
        ? { ...MENTOR_PERSONAS.find(m => m.id === 'custom')!, ...customMentor }
        : MENTOR_PERSONAS.find(m => m.id === selectedMentorId)!;
        
      try {
          // BUG FIX: Pass `mentorChatHistory` (the history *before* the user's new message)
          // because the service function adds the new message to the payload itself.
          // This prevents sending the same message twice.
          const response = await getMentorResponse(activeMentor, mentorChatHistory, message, {
              streakDays: appStreakDays,
              journalSummary: journalEntries.slice(0, 3).map(e => e.content).join(' '),
          });
          const modelMessage: ChatMessage = { role: 'model', content: response };
          setAppState({ mentorChatHistory: [...currentHistory, modelMessage] });
      } catch(error) {
          const errorMessage: ChatMessage = { role: 'model', content: "I am having trouble connecting at the moment. Please try again later." };
          setAppState({ mentorChatHistory: [...currentHistory, errorMessage] });
      } finally {
          setIsMentorTyping(false);
      }
    }, [mentorChatHistory, setAppState, selectedMentorId, customMentor, appStreakDays, journalEntries]);
  
    const handleUnlockLegacy = useCallback(async () => {
      if (legacyLog.length > 0) return;
      const summary = await generateLegacySummary({
        ranksAchieved: RANKS.filter(r => appStreakDays >= r.daysRequired),
        journalSummary: journalEntries.slice(0, 10).map(e => e.content).join('\n---\n'),
        badgesEarned: earnedBadges.map(eb => BADGES.find(b => b.id === eb.id)?.name).filter(Boolean) as string[],
      });
      const aiEntry: LegacyEntry = { type: 'ai', content: summary, date: new Date().toISOString() };
      setAppState({ legacyLog: [aiEntry] });
      setActiveTab('legacy');
    }, [legacyLog.length, appStreakDays, journalEntries, earnedBadges, setAppState]);
  
    const handleAddProverb = useCallback((proverb: string) => {
      if (hasWrittenProverb) return;
      const userEntry: LegacyEntry = { type: 'user', content: proverb, date: new Date().toISOString() };
      setAppState({ legacyLog: [...legacyLog, userEntry], hasWrittenProverb: true });
    }, [hasWrittenProverb, legacyLog, setAppState]);
  
    const handleClaimReward = useCallback((cost: number) => {
      if (aether >= cost) {
          triggerHapticFeedback(100);
          setAppState({ aether: aether - cost });
      }
    }, [setAppState, aether]);
    
    const handleSOS = useCallback(async () => {
      triggerHapticFeedback([200, 100, 200]);
      if (isAppLocked) return; // Prevent SOS usage if app is locked
      setPatternInterruptHistory([]); // Clear previous session
      setPatternInterruptModalOpen(true);
      setIsFetchingPatternInterrupt(true);
  
      const activeMentor = MENTOR_PERSONAS.find(p => p.id === selectedMentorId) || MENTOR_PERSONAS[0];
      try {
          const nudge = await getEmergencyNudge({
              streakDays: appStreakDays,
              rank: currentRank?.name || 'Novice',
              mentor: activeMentor,
          });
          setPatternInterruptHistory([nudge]);
      } catch (error) {
          setPatternInterruptHistory([{ title: "Hold Fast.", message: "The storm is temporary...", action: "Breathe."}]);
      } finally {
          setIsFetchingPatternInterrupt(false);
      }
    }, [selectedMentorId, appStreakDays, currentRank, isAppLocked]);
  
    const handleEscalateSOS = useCallback(async () => {
      if (isFetchingPatternInterrupt || patternInterruptHistory.length === 0 || patternInterruptHistory.length >= 10) return;
  
      setIsFetchingPatternInterrupt(true);
      try {
          const enhancedData = await getEnhancedEmergencyNudge({ 
              journalEntries, 
              visionNarrative,
              previousNudges: patternInterruptHistory,
              escalationLevel: patternInterruptHistory.length,
          });
          setPatternInterruptHistory(prev => [...prev, enhancedData]);
      } catch (error) {
          setPatternInterruptHistory(prev => [...prev, { 
              personalizedMessage: `The system is struggling, but you are not. Let's try this: focus on your immediate surroundings. Name five things you can see. (Level ${patternInterruptHistory.length})`,
              rescuePlan: ["Stand up.", "Drink water."], 
              visionReminder: "Remember your vision." 
          }]);
      } finally {
          setIsFetchingPatternInterrupt(false);
      }
    }, [isFetchingPatternInterrupt, patternInterruptHistory, journalEntries, visionNarrative]);
  
    const handleClosePatternInterrupt = useCallback(() => {
      setPatternInterruptModalOpen(false);
      setTimeout(() => {
          setPatternInterruptHistory([]);
      }, 300);
    }, []);
  
    const handleGenerateWeeklyReview = useCallback(async () => {
      setIsGeneratingReview(true);
      setWeeklyReviewModalOpen(true);
      const sevenDaysAgo = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000);
      const recentEntries = journalEntries.filter(e => new Date(e.date) > sevenDaysAgo);
      
      try {
        const review = await getWeeklyReview(recentEntries);
        setWeeklyReviewData(review);
        setAppState({ lastReviewDate: new Date().toISOString() });
      } catch(error) {
        setWeeklyReviewData({ biggestWin: "Consistency", toughestChallenge: "Stress", unseenPattern: "N/A", nextWeekMission: "Focus on peace." });
      } finally {
        setIsGeneratingReview(false);
      }
    }, [journalEntries, setAppState]);
    
    const handleGenerateVision = useCallback(async (inputs: DreamBuilderInputs) => {
      setIsGeneratingVision(true);
      try {
          const narrative = await generateVisionNarrative(inputs);
          setAppState({ visionNarrative: narrative });
      } catch(error) {
          setAppState({ visionNarrative: "I am a person of strength and integrity." });
      } finally {
          setIsGeneratingVision(false);
      }
    }, [setAppState]);
    
    const handleResetVision = useCallback(() => setAppState({ visionNarrative: null }), [setAppState]);
    
    const handleStartSocraticInterrogation = useCallback((context: SocraticContext) => {
      setSocraticContext(context);
    }, []);
      
    const handleCloseSocraticInterrogation = useCallback(() => setSocraticContext(null), []);
    
    const handleGetJournalTemplate = useCallback(async (): Promise<JournalTemplate> => {
      return await getJournalingTemplate();
    }, []);
    
    const handleAlreadyRated = useCallback(() => {
      if (!ratingState) return;
      setAppState({
        ratingState: {
          ...ratingState,
          hasRated: true,
        }
      });
      setRatingModalOpen(false);
    }, [ratingState, setAppState]);

    const fileToBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
      };
      reader.onerror = error => reject(error);
    });

    const handleVerifyScreenshot = useCallback(async (file: File) => {
        setIsVerifyingScreenshot(true);
        setScreenshotVerificationResult(null);
        try {
            const base64Image = await fileToBase64(file);
            const result = await verifyRatingScreenshot(base64Image, file.type);
            
            if (result.isGenuine && result.isAppNameVisible && result.isFiveStars) {
                let newTrialStartDate: Date;

                if (isTrialActive) {
                    // If the trial is currently active, push the start date forward by 14 days.
                    // This effectively adds 14 days to the end of the current trial period.
                    const currentTrialStart = new Date(trialStartDate!);
                    newTrialStartDate = new Date(currentTrialStart.getTime() + (14 * 24 * 60 * 60 * 1000));
                } else {
                    // If the trial has expired, start a new 14-day trial.
                    // This is done by setting the start date 7 days in the future, because the
                    // total trial duration is hardcoded to 7 days from the start date.
                    const now = new Date();
                    newTrialStartDate = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));
                }
                
                setAppState({
                    trialStartDate: newTrialStartDate.toISOString(),
                    hasClaimedRatingReward: true,
                });
                setScreenshotVerificationResult({ success: true, message: "Success! Your trial has been extended by 14 days." });
                triggerHapticFeedback(100);
            } else {
                setScreenshotVerificationResult({ success: false, message: result.reason });
            }
        } catch (error) {
            setScreenshotVerificationResult({ success: false, message: "An unexpected error occurred. Please try again." });
        } finally {
            setIsVerifyingScreenshot(false);
        }
    }, [setAppState, trialStartDate, isTrialActive]);
    
    // FIX: Replaced `Omit` with `Exclude` for union type filtering.
    const navTabs: (Exclude<Tab, 'account'>)[] = useMemo(() => {
      return ['streak', legacyLog.length > 0 ? 'legacy' : 'story', 'sanctuary', 'rewards', 'vault', 'mentor'];
    }, [legacyLog.length]);
  
    const checkinButtonText = !canCheckInTime ? 'Available after 9 PM' : hasCheckedInToday ? 'Checked In!' : `Check In (+${dailyAetherReward} Aether)`;
    const overallRewiringProgress = useMemo(() => {
      const totalProgress = BRAIN_REWIRING_COMPONENTS.reduce((sum, component) => {
          return sum + Math.min(100, (appStreakDays / component.daysToComplete) * 100);
      }, 0);
      return totalProgress / BRAIN_REWIRING_COMPONENTS.length;
    }, [appStreakDays]);

    const renderContent = () => {
      switch(activeTab) {
        case 'streak':
          return (
            <main className="flex flex-col items-center gap-8">
              {falseCheckInCounter >= 3 && ( <div className="w-full bg-rose-900/50 border border-rose-700 rounded-xl p-3 text-center text-sm text-rose-300 flex items-center justify-center gap-2"><WarningIcon className="w-5 h-5" /><span>Honesty is key. Aether rewards are at risk due to repeated false check-ins.</span></div> )}
              <StreakTimer startDate={effectiveStreakStartDate} />
              <MilestoneTracker onNewRank={handleNewRank} onOpenJourneyModal={() => setJourneyModalOpen(true)} theme={appTheme} streakDays={appStreakDays} />
              
              <div className="w-full glass-panel rounded-2xl p-6 flex flex-col items-center gap-4">
                <div className="w-full flex items-center justify-between">
                    <div><h3 className="text-sm font-semibold text-[var(--color-text-secondary)] tracking-wider uppercase">Daily Check-in</h3><p className="text-lg text-white font-bold">{appStreakDays} Day Streak</p></div>
                    <button onClick={handleCheckInAttempt} disabled={isVerifyingCheckIn || !canCheckInTime} className={`px-6 py-3 text-white font-bold rounded-full shadow-lg transition-all duration-300 relative overflow-hidden group ${ isCheckinReady ? 'bg-gradient-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)]' : 'bg-slate-700 cursor-not-allowed opacity-60' }`}>
                      <span className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                      <span className="relative z-10">{isVerifyingCheckIn ? 'Verifying...' : checkinButtonText}</span>
                      {isCheckinReady && <span className="absolute inset-0 bg-white/20 animate-pulse-once-new rounded-full"></span>}
                    </button>
                </div>
                 {falseCheckInCounter >= 5 && hasCheckedInToday && ( <p className="text-rose-400 text-xs text-center">Aether rewards for check-ins are suspended due to repeated false check-ins.</p> )}
                <div className="w-full flex gap-3 mt-2">
                    <button
                        onClick={() => setMissedCheckinModalOpen(true)}
                        disabled={!hasMissedCheckins || falseCheckInCounter >= 3}
                        className={`flex-1 text-center text-sm py-2.5 font-semibold rounded-lg transition-colors duration-200 ${
                            (!hasMissedCheckins || falseCheckInCounter >= 3)
                            ? 'bg-slate-800/50 border border-slate-700 text-slate-500 cursor-not-allowed'
                            : 'bg-white/5 hover:bg-white/10 text-slate-200'
                        }`}
                    >
                        {hasMissedCheckins ? 'Log Missed Days' : 'All Caught Up!'}
                    </button>
                    <button
                        onClick={() => setRelapseConfirmationOpen(true)}
                        className="flex-1 text-center text-sm py-2.5 bg-gradient-to-r from-rose-500 to-red-600 hover:opacity-90 text-white font-semibold rounded-lg transition-colors duration-200"
                    >
                        Report Relapse
                    </button>
                </div>
              </div>
               <NotificationControl 
                  permission={notificationPermission}
                  onEnable={handleEnableNotifications}
                  notificationSettings={(fcmToken && notificationTime && timezone) ? { time: notificationTime, timezone: timezone, token: fcmToken } : null}
                  onSetTime={handleSetNotificationTime}
                />
              <div className="w-full"><UltimateGoal aether={aether} onClaimReward={handleClaimReward} displayMode="minimal" /></div>
              <button onClick={() => setBrainRewiringModalOpen(true)} className="w-full glass-panel rounded-2xl p-6 text-center hover:bg-white/10 transition-colors cursor-pointer group">
                <div className="flex items-center justify-between gap-3 mb-4">
                    <div className='flex items-center gap-3'><BrainIcon className="w-8 h-8 text-[var(--color-accent-primary)]" /><h3 className="text-lg font-semibold text-white">Brain Rewiring Progress</h3></div>
                    <span className="text-xs text-[var(--color-text-secondary)] group-hover:text-white transition-colors">View Details &rarr;</span>
                </div>
                <div className="w-full bg-black/30 rounded-full h-2.5 relative overflow-hidden"><div className="bg-gradient-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] h-2.5 rounded-full transition-all duration-500" style={{ width: `${overallRewiringProgress}%` }} /></div>
              </button>
              <DailyMindset mindset={dailyMindset} onOpenReportModal={handleOpenReportModal} />
            </main>
          );
        case 'story': return legacyLog.length === 0 ? <StoryJourney streakDays={appStreakDays} /> : <Legacy log={legacyLog} hasWrittenProverb={hasWrittenProverb} onAddProverb={handleAddProverb} onOpenReportModal={handleOpenReportModal} />;
        case 'legacy': return <Legacy log={legacyLog} hasWrittenProverb={hasWrittenProverb} onAddProverb={handleAddProverb} onOpenReportModal={handleOpenReportModal} />;
        case 'sanctuary': return <Sanctuary entries={journalEntries} onAddEntry={handleAddJournalEntry} onDeleteEntry={handleDeleteJournalEntry} unlockedToolIds={unlockedToolIds} aether={aether} dailyLogAetherReward={dailyAetherReward} onGenerateWeeklyReview={handleGenerateWeeklyReview} isReviewAvailable={isReviewAvailable} isGeneratingReview={isGeneratingReview} onStartInterrogation={handleStartSocraticInterrogation} onGetJournalTemplate={handleGetJournalTemplate} hasLoggedJournalToday={hasLoggedJournalToday} checkInHistory={checkInHistory} onOpenReportModal={handleOpenReportModal} sanctuaryChatHistory={sanctuaryChatHistory} />;
        case 'rewards': return <Rewards earnedBadges={earnedBadges} currentRank={currentRank} streakDays={appStreakDays} aether={aether} onClaimReward={handleClaimReward} unlockedToolIds={unlockedToolIds} onUseVulnerabilityShield={() => setVulnerabilityShieldModalOpen(true)} onUseGuidedMeditation={() => setGuidedMeditationModalOpen(true)} onUseOracle={() => setOracleModalOpen(true)} />;
        case 'vault': return <CommitmentVault aether={aether} activeWager={activeWager} onSetWager={handleSetWager} streakDays={appStreakDays} />;
        case 'mentor': return <Mentor selectedMentorId={selectedMentorId} setSelectedMentorId={(id) => setAppState({ selectedMentorId: id })} customMentor={customMentor} setCustomMentor={(mentor) => setAppState({ customMentor: mentor })} chatHistory={mentorChatHistory} onSendMessage={handleSendMessageToMentor} isTyping={isMentorTyping} visionNarrative={visionNarrative} isGeneratingVision={isGeneratingVision} onGenerateVision={handleGenerateVision} onResetVision={handleResetVision} onOpenReportModal={handleOpenReportModal} />;
        case 'account':
          return <Account 
              pitch={isPitchLoading ? "Crafting your personal encouragement..." : subscriptionPitch}
              isTrialActive={isTrialActive}
              trialDaysLeft={trialDaysLeft}
              logout={logout}
              hasClaimedRatingReward={!!hasClaimedRatingReward}
              onVerifyScreenshot={handleVerifyScreenshot}
              isVerifyingScreenshot={isVerifyingScreenshot}
              screenshotVerificationResult={screenshotVerificationResult}
            />;
        default: return null;
      }
    }
        
    return (
      <div className="min-h-screen flex flex-col safe-padding font-sans antialiased text-slate-100 transition-colors duration-500">
        <div className="w-full max-w-2xl mx-auto flex flex-col flex-grow">
          <header className="mb-6 w-full flex justify-between items-center">
              <div className="text-left">
                  <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)] pb-2">Fortify</h1>
              </div>
              <div className="flex items-center gap-4">
                <PanicButton onClick={handleSOS} disabled={isAppLocked} />
                <UserIcon onClick={() => setActiveTab('account')} isActive={activeTab === 'account'} />
              </div>
          </header>
          
          {trialStartDate && !isSubscribed && <TrialBanner isTrialActive={isTrialActive} daysLeft={trialDaysLeft} onClick={() => setActiveTab('account')} />}
          
          <nav className="mb-8 flex justify-center">
            <div className="flex glass-panel rounded-full p-1.5 overflow-x-auto no-scrollbar">
              {navTabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => {
                      if (isAppLocked && tab !== 'streak') return;
                      setActiveTab(tab);
                  }}
                  disabled={isAppLocked && tab !== 'streak'}
                  className={`px-5 py-2 text-sm font-semibold rounded-full capitalize transition-colors duration-300 flex-shrink-0 relative ${ activeTab === tab ? 'text-white' : 'text-slate-300 hover:text-white' } ${isAppLocked && tab !== 'streak' ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {activeTab === tab && <div className="absolute inset-0 bg-white/10 rounded-full -z-10" style={{animation: 'nav-pop 0.3s ease-out'}} />}
                  <span className="relative">{tab}</span>
                </button>
              ))}
            </div>
          </nav>
  
          <div className="w-full">
            <Suspense fallback={<LoadingFallback />}>
              {renderContent()}
            </Suspense>
          </div>
          
          <Suspense fallback={null}>
              <RatingModal 
                isOpen={isRatingModalOpen} 
                onClose={() => setRatingModalOpen(false)} 
                onAlreadyRated={handleAlreadyRated}
              />
              {currentRank && <MilestoneModal isOpen={isMilestoneModalOpen} onClose={() => setMilestoneModalOpen(false)} rank={currentRank} theme={appTheme} /> }
              <LegendTriumphModal isOpen={isLegendModalOpen} onClose={() => { setLegendModalOpen(false); handleUnlockLegacy(); }} mentorName={MENTOR_PERSONAS.find(m => m.id === selectedMentorId)?.name || 'Your Mentor'} />
              <CheckinConfirmationModal isOpen={isCheckinConfirmationOpen} onClose={() => setCheckinConfirmationOpen(false)} onConfirm={handleConfirmCheckIn} onReset={handleResetStreak} />
              <FalseCheckInNudgeModal isOpen={checkInNudge.isOpen} reasoning={checkInNudge.reasoning} onConfirm={handleProceedWithSuspiciousCheckIn} onClose={() => setCheckInNudge({ isOpen: false, reasoning: '' })} onReset={() => { setCheckInNudge({ isOpen: false, reasoning: '' }); handleResetStreak(); }} offenseCount={falseCheckInCounter} onOpenReportModal={handleOpenReportModal} />
              <PatternInterruptModal isOpen={isPatternInterruptModalOpen} isLoading={isFetchingPatternInterrupt} history={patternInterruptHistory} onEscalate={handleEscalateSOS} onClose={handleClosePatternInterrupt} mentorIcon={MENTOR_PERSONAS.find(p => p.id === selectedMentorId)?.Icon} onOpenReportModal={handleOpenReportModal} />
              <WeeklyReviewModal isOpen={isWeeklyReviewModalOpen} onClose={() => setWeeklyReviewModalOpen(false)} review={weeklyReviewData} isLoading={isGeneratingReview} onOpenReportModal={handleOpenReportModal} />
              <SocraticInterrogatorModal isOpen={!!socraticContext} context={socraticContext} chat={null} onClose={handleCloseSocraticInterrogation} onOpenReportModal={handleOpenReportModal} />
              <BrainRewiringModal isOpen={isBrainRewiringModalOpen} onClose={() => setBrainRewiringModalOpen(false)} streakDays={appStreakDays} />
              <FullJourneyModal isOpen={isJourneyModalOpen} onClose={() => setJourneyModalOpen(false)} streakDays={appStreakDays} />
              <VulnerabilityShieldModal isOpen={isVulnerabilityShieldModalOpen} onClose={() => setVulnerabilityShieldModalOpen(false)} onOpenReportModal={handleOpenReportModal} />
              <GuidedMeditationModal isOpen={isGuidedMeditationModalOpen} onClose={() => setGuidedMeditationModalOpen(false)} onOpenReportModal={handleOpenReportModal} />
              <OracleModal isOpen={isOracleModalOpen} onClose={() => setOracleModalOpen(false)} journalEntries={journalEntries} onOpenReportModal={handleOpenReportModal} />
              <MissedCheckinModal isOpen={isMissedCheckinModalOpen} onClose={() => setMissedCheckinModalOpen(false)} onBackfillCheckin={handleBackfillCheckin} onReportRelapse={handleReportPastRelapse} missedDays={recentMissedDays} />
              <RelapseConfirmationModal isOpen={isRelapseConfirmationOpen} onClose={() => setRelapseConfirmationOpen(false)} onConfirm={handleImmediateRelapse} />
              <ReportContentModal isOpen={reportModalState.isOpen} onClose={() => setReportModalState({ isOpen: false, content: '' })} contentToReport={reportModalState.content} />
          </Suspense>
  
          {newlyEarnedBadge && <BadgeNotification badge={newlyEarnedBadge} onClose={() => setNewlyEarnedBadge(null)} /> }
          <div className="fixed z-50 flex flex-col gap-4 items-end" style={{ top: `calc(1.25rem + env(safe-area-inset-top, 0px))`, right: `calc(1.25rem + env(safe-area-inset-right, 0px))` }}>
              {wagerNotification && <WagerNotification status={wagerNotification.status} message={wagerNotification.message} onClose={() => setWagerNotification(null)} />}
              {newlyUnlockedReward && <RewardNotification reward={newlyUnlockedReward} onClose={() => setNewlyUnlockedReward(null)} />}
          </div>
        </div>
        <style>{`
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          @keyframes pulse-once-new { 0%, 100% { transform: scale(1); opacity: 0; } 50% { transform: scale(3); opacity: 0.5; } }
          .animate-pulse-once-new { animation: pulse-once 1.5s ease-out; }
          @keyframes nav-pop { 0% { transform: scale(0.95); opacity: 0.8; } 100% { transform: scale(1); opacity: 1; } }
          .tabular-nums { font-variant-numeric: tabular-nums; }
        `}</style>
      </div>
    );
};


const BeginJourneyScreen: React.FC = () => {
    const { appState, setAppState } = useAuth();
    const { appTheme } = appState;

    const handleStartStreak = useCallback(() => {
        triggerHapticFeedback([100, 50, 100]);
        const updates: Partial<AppState> = {
            activeWager: null,
            checkInData: { lastCheckinTimestamp: null, streak: 0 },
            appTheme: appTheme === 'legend' ? 'default' : appTheme,
            falseCheckInCounter: 0,
            streakStartDate: new Date().toISOString()
        };
        setAppState(updates);
    }, [appTheme, setAppState]);

    return (
        <div className="min-h-screen flex flex-col safe-padding font-sans antialiased text-slate-100">
            <div className="w-full max-w-2xl mx-auto flex flex-col flex-grow">
                <div className="flex-grow flex flex-col items-center justify-center text-center p-4">
                    <GrandmasterIcon className="w-24 h-24 text-[var(--color-accent-primary)] mb-6" />
                    <h2 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-4">Begin Your Journey</h2>
                    <p className="text-lg text-slate-300 max-w-md mb-8">Commit to the path of self-mastery. Start your streak today and build a monument of will.</p>
                    <button onClick={handleStartStreak} className="w-full max-w-sm px-8 py-4 bg-gradient-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] text-white font-bold rounded-full shadow-lg shadow-blue-500/30">Start Your Journey</button>
                </div>
            </div>
        </div>
    );
};


const App: React.FC = () => {
    const { user, loading, appState } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[var(--color-accent-primary)]"></div>
                <p className="text-slate-300 mt-4">Fortifying your session...</p>
            </div>
        );
    }
    
    if (!user) {
        return <Auth />;
    }

    if (!appState.streakStartDate) {
        return <BeginJourneyScreen />;
    }
    
    return <MainAppView />;
};

export default App;