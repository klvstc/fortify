import React, { useEffect } from 'react';
import { TrophyIcon, AetherIcon } from '../constants';

interface WagerNotificationProps {
  status: 'won' | 'lost';
  message: string;
  onClose: () => void;
}

const WagerNotification: React.FC<WagerNotificationProps> = ({ status, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const isWin = status === 'won';
  const Icon = isWin ? TrophyIcon : AetherIcon;
  const borderColor = isWin ? 'border-amber-500/50' : 'border-rose-500/50';
  const textColor = isWin ? 'text-amber-400' : 'text-rose-400';

  return (
    <div 
      className={`glass-panel border ${borderColor} rounded-2xl shadow-xl p-4 max-w-sm w-full text-left transform transition-all duration-500`}
      style={{ animation: 'slide-in 0.5s ease-out forwards' }}
      onClick={onClose}
    >
      <div className="flex items-center gap-4">
        <Icon className={`w-12 h-12 ${textColor} flex-shrink-0`} />
        <div>
            <h3 className={`font-bold ${isWin ? 'text-white' : 'text-rose-300'}`}>{isWin ? 'Commitment Fulfilled!' : 'Commitment Failed'}</h3>
            <p className="text-sm text-slate-200">{message}</p>
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

export default React.memo(WagerNotification);
