import React from 'react';
import { JabraEarbudsIcon, FitbitWatchIcon, AetherIcon } from '../constants';

interface UltimateGoalProps {
  aether: number;
  onClaimReward: (cost: number) => void;
  displayMode?: 'full' | 'minimal';
}

interface Goal {
  name: string;
  cost: number;
  Icon: React.FC<{ className?: string }>;
}

const GOALS: Goal[] = [
  { name: 'Jabra Elite 7 Pro Earbuds', cost: 5000, Icon: JabraEarbudsIcon },
  { name: 'Fitbit Versa 4 Smartwatch', cost: 10000, Icon: FitbitWatchIcon },
];

const GoalItem: React.FC<{ goal: Goal; aether: number; onClaimReward: (cost: number) => void; }> = ({ goal, aether, onClaimReward }) => {
  const progress = Math.min((aether / goal.cost) * 100, 100);
  const canClaim = aether >= goal.cost;

  const handleClaim = () => {
    if (!canClaim) return;
    
    onClaimReward(goal.cost);

    const recipient = 'aggarwaltanishq91@gmail.com';
    const subject = `Reward Claim: ${goal.name}`;
    const body = `Hello,\n\nI would like to claim my reward: ${goal.name}.\n\nI have reached the required ${goal.cost.toLocaleString()} Aether.\n\nPlease ship my reward to the following address:\n\n[Your Name]\n[Your Street Address]\n[Your City, State, ZIP Code]\n[Your Country]\n\nThank you!`;
    const mailtoLink = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  return (
    <div className={`bg-black/20 p-4 rounded-xl flex flex-col gap-3 border ${canClaim ? 'border-amber-400' : 'border-transparent'}`}>
      <div className="flex items-center gap-4">
        <goal.Icon className={`w-12 h-12 text-amber-300 flex-shrink-0`} />
        <div>
          <p className="font-bold text-white text-lg">{goal.name}</p>
          <div className="flex items-center gap-1.5">
            <AetherIcon className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-400 font-semibold">{goal.cost.toLocaleString()}</span>
          </div>
        </div>
      </div>
      <div className="w-full">
        <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
          <span>Progress</span>
          <span>{aether.toLocaleString()} / {goal.cost.toLocaleString()}</span>
        </div>
        <div className="w-full bg-black/30 rounded-full h-2.5">
          <div
            className="bg-gradient-to-r from-amber-500 to-yellow-500 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <button
        onClick={handleClaim}
        disabled={!canClaim}
        className={`mt-2 w-full py-2 font-bold rounded-lg transition-colors ${
            canClaim 
            ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:opacity-90 text-black' 
            : 'bg-slate-600 text-white/70 cursor-not-allowed'
        }`}
      >
        {canClaim ? 'Claim Reward' : 'Not Enough Aether'}
      </button>
    </div>
  );
};


const UltimateGoal: React.FC<UltimateGoalProps> = ({ aether, onClaimReward, displayMode = 'full' }) => {
  if (displayMode === 'minimal') {
    const goal = GOALS.find(g => g.name.includes('Jabra'));
    if (!goal) return null;

    return (
      <div className="w-full glass-panel rounded-2xl p-6">
        <h3 className="text-lg font-bold text-amber-300 mb-4 text-center">Your Ultimate Goal</h3>
        <GoalItem goal={goal} aether={aether} onClaimReward={onClaimReward} />
      </div>
    );
  }

  return (
    <div className="w-full glass-panel rounded-2xl p-6" style={{ animation: 'fade-in 0.3s ease-out' }}>
      <h3 className="text-xl font-bold text-amber-300 mb-2 text-center">The Ultimate Goal: Tangible Rewards</h3>
      <p className="text-sm text-amber-100/70 mb-6 text-center">Your discipline can earn you real-world gear. Claim your prize by emailing us once you've reached the goal.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {GOALS.map(goal => (
          <GoalItem key={goal.name} goal={goal} aether={aether} onClaimReward={onClaimReward} />
        ))}
      </div>
    </div>
  );
};

export default React.memo(UltimateGoal);