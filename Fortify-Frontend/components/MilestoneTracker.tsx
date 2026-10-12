import React, { useEffect, useMemo } from 'react';
import { type Rank, type AppTheme } from '../types';
import { RANKS } from '../constants';

interface MilestoneTrackerProps {
  onNewRank: (rank: Rank) => void;
  onOpenJourneyModal: () => void;
  theme: AppTheme;
  streakDays: number;
}

const MilestoneTracker: React.FC<MilestoneTrackerProps> = ({ onNewRank, onOpenJourneyModal, theme, streakDays }) => {
  const currentRank = useMemo(() => {
    return [...RANKS].reverse().find(rank => streakDays >= rank.daysRequired) || RANKS[0];
  }, [streakDays]);

  const currentRankIndex = useMemo(() => RANKS.findIndex(r => r.name === currentRank.name), [currentRank]);
  
  const nextRank = useMemo(() => {
    return currentRankIndex < RANKS.length - 1 ? RANKS[currentRankIndex + 1] : null;
  }, [currentRankIndex]);

  useEffect(() => {
    if (currentRank) {
      onNewRank(currentRank);
    }
  }, [currentRank, onNewRank]);

  if (!currentRank) {
    return null; 
  }

  // Handle the "Legend" case where there is no next rank
  if (!nextRank) {
    return (
        <div className="w-full glass-panel rounded-2xl p-8 text-center">
            <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] mb-2 tracking-wider uppercase">Current Rank</h3>
            <div className="flex flex-col items-center gap-2 mt-4">
                <currentRank.Icon className="w-16 h-16 text-amber-400" />
                <h2 className="text-2xl font-semibold text-white">{currentRank.name}</h2>
            </div>
            <p className="text-[var(--color-accent-success)] font-semibold mt-4">You have achieved the highest rank!</p>
        </div>
    );
  }

  const previousRankDays = currentRank.daysRequired;
  const daysForNextTier = nextRank.daysRequired - previousRankDays;
  const daysIntoCurrentTier = streakDays - previousRankDays;
  const progressPercentage = Math.min((daysIntoCurrentTier / daysForNextTier) * 100, 100);

  const { Icon: CurrentIcon, name: currentName } = currentRank;
  const { Icon: NextIcon, name: nextName, daysRequired: nextDaysRequired } = nextRank;
  
  const iconColor = theme === 'legend' ? 'text-amber-400' : 'text-[var(--color-accent-primary)]';
  const nextIconColor = theme === 'legend' ? 'text-amber-300/70' : 'text-slate-400';

  return (
    <div 
      onClick={onOpenJourneyModal}
      className="w-full glass-panel rounded-2xl p-8 transition-all duration-300 hover:bg-white/10 cursor-pointer group"
    >
        <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] mb-4 tracking-wider uppercase text-center">Milestone Progress</h3>
        
        <div className="flex justify-between items-center mb-4">
            {/* Current Rank */}
            <div className="flex flex-col items-center text-center w-24">
                <CurrentIcon className={`w-12 h-12 ${iconColor}`} />
                <p className="font-bold text-white text-md mt-1">{currentName}</p>
                <p className="text-xs text-[var(--color-text-secondary)]">Current</p>
            </div>
            
            <div className="text-2xl font-bold text-slate-500 flex-shrink-0 mx-2 transition-transform duration-300 group-hover:scale-125">&rarr;</div>
            
            {/* Next Rank */}
            <div className="flex flex-col items-center text-center w-24">
                <NextIcon className={`w-12 h-12 ${nextIconColor}`} />
                <p className="font-semibold text-slate-300 text-md mt-1">{nextName}</p>
                <p className="text-xs text-[var(--color-text-secondary)]">Next</p>
            </div>
        </div>

        <div className="w-full">
            <div className="flex justify-between items-center text-xs text-[var(--color-text-secondary)] mb-1">
                <span>Progress to next rank</span>
                <span>{streakDays} / {nextDaysRequired} Days</span>
            </div>
            <div className="w-full bg-black/30 rounded-full h-3 relative overflow-hidden">
                <div 
                    className="bg-gradient-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] h-3 rounded-full transition-all duration-500" 
                    style={{ width: `${progressPercentage}%` }}>
                </div>
            </div>
        </div>
        <p className="text-xs text-slate-500 mt-3 text-center opacity-0 group-hover:opacity-100 transition-opacity">Click to view full journey</p>
    </div>
  );
};

export default React.memo(MilestoneTracker);