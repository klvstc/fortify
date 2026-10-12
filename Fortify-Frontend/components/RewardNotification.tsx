import React, { useEffect } from 'react';
import { type Reward } from '../types';

interface RewardNotificationProps {
  reward: Reward;
  onClose: () => void;
}

const RewardNotification: React.FC<RewardNotificationProps> = ({ reward, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!reward) return null;

  return (
    <div 
      className="glass-panel border border-sky-500/50 rounded-2xl shadow-xl p-4 max-w-sm w-full text-left transform transition-all duration-500"
      style={{ animation: 'slide-in 0.5s ease-out forwards' }}
      onClick={onClose}
    >
      <div className="flex items-center gap-4">
        <reward.Icon className="w-12 h-12 text-sky-400 flex-shrink-0" />
        <div>
            <h3 className="font-bold text-white">Reward Unlocked!</h3>
            <p className="text-sm text-slate-200">{reward.title}</p>
        </div>
      </div>
      <style>{`
        @keyframes slide-in {
          0% { transform: translateX(120%); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default React.memo(RewardNotification);
