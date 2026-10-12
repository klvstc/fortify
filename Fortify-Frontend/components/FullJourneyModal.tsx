import React, { useEffect } from 'react';
import { RANKS, RoadmapIcon } from '../constants';

interface FullJourneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  streakDays: number;
}

const FullJourneyModal: React.FC<FullJourneyModalProps> = ({ isOpen, onClose, streakDays }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-xl flex items-center justify-center z-50 p-4"
      onClick={onClose}
      style={{ animation: 'fade-in 0.3s ease-out' }}
    >
      <div
        className="glass-panel rounded-2xl shadow-2xl w-full max-w-md h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'slide-up 0.4s ease-out' }}
      >
        <header className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <RoadmapIcon className="w-8 h-8 text-sky-400" />
            <div>
              <h2 className="text-xl font-bold text-white">The Path to Legend</h2>
              <p className="text-sm text-slate-400">Your entire 365-day journey.</p>
            </div>
          </div>
          <button aria-label="Close" onClick={onClose} className="text-3xl text-slate-500 hover:text-white transition-colors">&times;</button>
        </header>

        <div className="overflow-y-auto p-8">
          <div className="relative">
            {/* The vertical line */}
            <div className="absolute left-7 top-0 h-full w-0.5 bg-slate-700/50"></div>

            {RANKS.map((rank, index) => {
              const isUnlocked = streakDays >= rank.daysRequired;
              const isCurrent = isUnlocked && (index === RANKS.length - 1 || streakDays < RANKS[index + 1].daysRequired);
              
              return (
                <div key={rank.name} className="flex items-start gap-6 mb-8 relative">
                  <div className={`flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center z-10 transition-all duration-300 ${
                      isCurrent ? 'bg-gradient-to-br from-emerald-500 to-teal-500 ring-4 ring-emerald-500/30' : isUnlocked ? 'bg-emerald-500/30' : 'bg-slate-700/50'
                  }`}>
                    <rank.Icon className={`w-8 h-8 ${isUnlocked ? 'text-white' : 'text-slate-500'}`} />
                  </div>
                  <div className={`pt-2 transition-opacity duration-300 ${isUnlocked ? 'opacity-100' : 'opacity-60'}`}>
                    <p className={`font-bold text-lg ${isUnlocked ? 'text-white' : 'text-slate-400'}`}>
                      {rank.name}
                    </p>
                    <p className={`text-sm ${isUnlocked ? 'text-slate-300' : 'text-slate-500'}`}>
                      Requires {rank.daysRequired} {rank.daysRequired === 1 ? 'Day' : 'Days'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
        @keyframes slide-up { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default React.memo(FullJourneyModal);
