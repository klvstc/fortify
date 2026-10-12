import React, { useState, useMemo } from 'react';
import { type EarnedBadge, type Rank, type Reward } from '../types';
import { BADGES, REWARDS, RANKS, LockClosedIcon } from '../constants';
import AttributeGrowth from './AttributeGrowth';
import UltimateGoal from './UltimateGoal';

interface RewardsProps {
  earnedBadges: EarnedBadge[];
  currentRank: Rank | null;
  streakDays: number;
  aether: number;
  onClaimReward: (cost: number) => void;
  unlockedToolIds: string[];
  onUseVulnerabilityShield: () => void;
  onUseGuidedMeditation: () => void;
  onUseOracle: () => void;
}

const Rewards: React.FC<RewardsProps> = ({ 
  earnedBadges, 
  currentRank, 
  streakDays, 
  aether, 
  onClaimReward, 
  unlockedToolIds,
  onUseVulnerabilityShield,
  onUseGuidedMeditation,
  onUseOracle,
}) => {
  const [activeTab, setActiveTab] = useState<'achievements' | 'unlocks' | 'growth'>('achievements');
  const [contentModal, setContentModal] = useState<{ isOpen: boolean; reward: Reward | null }>({ isOpen: false, reward: null });

  const earnedBadgeIds = useMemo(() => new Set(earnedBadges.map(b => b.id)), [earnedBadges]);

  const currentRankIndex = useMemo(() => {
      if (!currentRank) return -1;
      return RANKS.findIndex(r => r.name === currentRank.name);
  }, [currentRank]);
  
  const handleOpenContent = (reward: Reward) => {
    setContentModal({ isOpen: true, reward });
  };
  
  const handleCloseContent = () => {
    setContentModal({ isOpen: false, reward: null });
  };

  const handleUseTool = (toolId: string) => {
    switch (toolId) {
        case 'vulnerability-shield':
            onUseVulnerabilityShield();
            break;
        case 'guided-meditation':
            onUseGuidedMeditation();
            break;
        case 'oracle':
            onUseOracle();
            break;
        default:
            break;
    }
  };

  const navItems = [
      { id: 'achievements', label: 'Achievements', activeClass: 'bg-amber-500' },
      { id: 'unlocks', label: 'Tools', activeClass: 'bg-sky-500' },
      { id: 'growth', label: 'Growth', activeClass: 'bg-green-500' },
  ];

  return (
    <div className="w-full flex flex-col gap-6 text-left">
      <div className="glass-panel rounded-2xl p-6 text-center">
        <h3 className="text-lg font-semibold text-white mb-2">Rewards & Growth</h3>
        <p className="text-sm text-slate-300">Track accomplishments, unlock tools, and watch yourself grow.</p>
        
        <div className="mt-4 flex justify-center glass-panel rounded-full p-1.5">
          {navItems.map(item => (
            <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-full flex-1 relative transition-colors duration-300 ${activeTab === item.id ? 'text-white' : 'text-slate-300 hover:text-white'}`}
            >
                {activeTab === item.id && <div className="absolute inset-0 bg-white/10 rounded-full -z-10" />}
                <span className="relative">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'achievements' && (
        <div className="glass-panel rounded-2xl p-6" style={{ animation: 'fade-in 0.3s ease-out' }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {BADGES.map(badge => {
                const isEarned = earnedBadgeIds.has(badge.id);
                const earnedDate = isEarned ? earnedBadges.find(b => b.id === badge.id)?.date : null;

                return (
                    <div key={badge.id} className={`bg-black/20 p-4 rounded-xl flex items-center gap-4 transition-opacity duration-300 ${isEarned ? 'opacity-100' : 'opacity-50'}`}>
                        <badge.Icon className={`w-12 h-12 flex-shrink-0 ${isEarned ? 'text-amber-400' : 'text-slate-500'}`} />
                        <div>
                            <p className={`font-bold ${isEarned ? 'text-white' : 'text-slate-400'}`}>{badge.name}</p>
                            <p className="text-sm text-slate-300">{badge.description}</p>
                            {isEarned && earnedDate && (
                                <p className="text-xs text-slate-400 mt-1">Earned: {new Date(earnedDate).toLocaleDateString()}</p>
                            )}
                        </div>
                    </div>
                );
              })}
            </div>
        </div>
      )}

      {activeTab === 'unlocks' && (
        <div className="w-full space-y-4" style={{ animation: 'fade-in 0.3s ease-out' }}>
          {REWARDS.map(reward => {
            const rewardRankIndex = RANKS.findIndex(r => r.name === reward.rankToUnlock);
            const isUnlocked = currentRankIndex >= rewardRankIndex;
            
            return (
              <div key={reward.id} className={`glass-panel rounded-2xl p-4 flex items-center gap-4 transition-all duration-300 ${isUnlocked ? 'opacity-100' : 'opacity-60'}`}>
                <reward.Icon className={`w-12 h-12 flex-shrink-0 ${isUnlocked ? 'text-sky-400' : 'text-slate-500'}`} />
                <div className="flex-grow">
                  <p className={`font-bold ${isUnlocked ? 'text-white' : 'text-slate-400'}`}>{reward.title}</p>
                  <p className="text-sm text-slate-300">{reward.description}</p>
                  {!isUnlocked && <p className="text-xs text-slate-400 mt-1">Unlock at rank: {reward.rankToUnlock}</p>}
                </div>
                {isUnlocked ? (
                  reward.type === 'content' ? (
                     <button onClick={() => handleOpenContent(reward)} className="bg-gradient-to-r from-sky-500 to-blue-500 hover:opacity-90 text-white font-semibold px-4 py-2 rounded-lg text-sm">View</button>
                  ) : (
                    <button onClick={() => handleUseTool(reward.id)} className="bg-gradient-to-r from-sky-500 to-blue-500 hover:opacity-90 text-white font-semibold px-4 py-2 rounded-lg text-sm">Use Tool</button>
                  )
                ) : (
                  <LockClosedIcon className="w-7 h-7 text-slate-500 flex-shrink-0" />
                )}
              </div>
            )
          })}
        </div>
      )}

      {activeTab === 'growth' && (
         <AttributeGrowth streakDays={streakDays} />
      )}
      
      {contentModal.isOpen && contentModal.reward && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={handleCloseContent}>
          <div className="glass-panel rounded-2xl shadow-xl p-8 max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                    <contentModal.reward.Icon className="w-10 h-10 text-sky-400 flex-shrink-0" />
                    <h2 className="text-2xl font-bold text-white">{contentModal.reward.title}</h2>
                </div>
                <button onClick={handleCloseContent} className="text-slate-400 hover:text-white text-3xl">&times;</button>
            </div>
            <p className="text-slate-200 whitespace-pre-wrap leading-relaxed">{contentModal.reward.content}</p>
            <button onClick={handleCloseContent} className="mt-6 w-full py-2.5 bg-gradient-to-r from-sky-500 to-blue-500 text-white font-semibold rounded-lg hover:opacity-90 transition-colors">Close</button>
          </div>
        </div>
      )}

      <UltimateGoal aether={aether} onClaimReward={onClaimReward} />

      <style>{`
        @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
      `}</style>
    </div>
  );
};

export default React.memo(Rewards);