import React, { useEffect } from 'react';
import { type Rank, type AppTheme } from '../types';
import { AetherIcon } from '../constants';

interface MilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  rank: Rank;
  theme: AppTheme;
}

const Confetti: React.FC = () => {
  const confettiCount = 200; // Increased for more celebration
  // Using theme colors + white
  const colors = ['#38BDF8', '#A78BFA', '#2DD4BF', '#F472B6', '#F8FAFC'];

  const particles = Array.from({ length: confettiCount }).map((_, i) => {
    const isRect = Math.random() > 0.5;
    return {
      key: i,
      style: {
        left: `${Math.random() * 100}%`,
        top: `${-20 + Math.random() * 10}%`,
        width: `${Math.random() * 10 + 5}px`,
        height: isRect ? `${Math.random() * 6 + 4}px` : `${Math.random() * 10 + 5}px`,
        backgroundColor: colors[Math.floor(Math.random() * colors.length)],
        transform: `rotate(${Math.random() * 360}deg)`,
        animation: `fall ${Math.random() * 4 + 3}s ${Math.random() * 2}s linear forwards`,
        opacity: 0,
        borderRadius: isRect ? '0' : '50%',
      },
    };
  });

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {particles.map(p => (
        <div key={p.key} className="absolute" style={p.style} />
      ))}
    </div>
  );
};


const MilestoneModal: React.FC<MilestoneModalProps> = ({ isOpen, onClose, rank, theme }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  if (!isOpen) return null;

  const { name, Icon, daysRequired } = rank;
  
  const iconColor = theme === 'legend' ? 'text-amber-400' : 'text-[var(--color-accent-primary)]';
  const rankTextColor = theme === 'legend' ? 'text-amber-400' : 'text-[var(--color-accent-primary)]';
  const buttonClass = theme === 'legend' 
    ? 'bg-amber-500 hover:bg-amber-600 text-black'
    : 'bg-gradient-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] text-white';


  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-xl flex items-center justify-center z-50 p-4 transition-opacity duration-300"
      onClick={onClose}
    >
      <Confetti />
      <div 
        className="glass-panel rounded-2xl shadow-xl p-8 max-w-sm w-full text-center transform transition-all duration-300 scale-95 relative z-10"
        style={{ animation: 'modal-pop 0.3s ease-out forwards' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative flex justify-center mb-6">
            <div className={`absolute -inset-4 rounded-full ${iconColor} opacity-20 blur-2xl animate-subtle-pulse`}></div>
            <Icon className={`w-24 h-24 ${iconColor} relative animate-icon-pulse`} />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Milestone Reached!</h2>
        <p className="text-lg text-slate-300 mb-4">
          Congratulations! Your unwavering dedication for {daysRequired} {daysRequired === 1 ? 'day' : 'days'} has earned you the rank of <span className={`font-bold ${rankTextColor}`}>{name}</span>!
        </p>
        {rank.aetherBonus > 0 && (
            <div className="flex items-center justify-center gap-2 mb-6 bg-black/20 p-3 rounded-lg border border-white/10">
                <AetherIcon className="w-6 h-6 text-cyan-400" />
                <p className="text-md text-slate-200">
                    <span className="font-bold text-cyan-400">+{rank.aetherBonus} Aether</span> awarded for your dedication.
                </p>
            </div>
        )}
        <button
          onClick={onClose}
          className={`w-full py-3 ${buttonClass} font-bold rounded-lg transition-colors duration-200`}
        >
          Keep Going
        </button>
      </div>
      <style>{`
        @keyframes modal-pop {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fall {
          from {
            transform: translateY(0vh) rotateZ(0deg);
            opacity: 1;
          }
          to {
            transform: translateY(110vh) rotateZ(720deg);
            opacity: 0;
          }
        }
        @keyframes icon-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        .animate-icon-pulse {
          animation: icon-pulse 2.5s infinite ease-in-out;
        }
        /* Using existing subtle-pulse for the background glow */
        @keyframes subtle-pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.2;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.3;
          }
        }
        .animate-subtle-pulse {
          animation: subtle-pulse 4s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default React.memo(MilestoneModal);