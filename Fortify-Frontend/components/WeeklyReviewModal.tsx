import React, { useEffect } from 'react';
import { type WeeklyReview } from '../types';
import { TrophyIcon, WarningIcon, VisionIcon, CompassIcon, FlagIcon } from '../constants';

interface WeeklyReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  review: WeeklyReview | null;
  isLoading: boolean;
  onOpenReportModal: (content: string) => void;
}

const sections = [
  { key: 'biggestWin' as const, title: 'Your Biggest Win', Icon: TrophyIcon, color: 'text-emerald-400' },
  { key: 'toughestChallenge' as const, title: 'Your Toughest Challenge', Icon: WarningIcon, color: 'text-rose-400' },
  { key: 'unseenPattern' as const, title: 'The Unseen Pattern', Icon: VisionIcon, color: 'text-sky-400' },
  { key: 'nextWeekMission' as const, title: 'Your Mission for Next Week', Icon: CompassIcon, color: 'text-amber-400' },
] as const;

const WeeklyReviewModal: React.FC<WeeklyReviewModalProps> = ({ isOpen, onClose, review, isLoading, onOpenReportModal }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'auto';
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
        className="glass-panel rounded-2xl shadow-2xl w-full max-w-2xl h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'slide-up 0.4s ease-out' }}
      >
        <header className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 rounded-t-2xl z-10">
          <div>
            <h2 className="text-2xl font-bold text-white">Your Weekly Review</h2>
            <p className="text-sm text-slate-400">Insights from your AI Coach based on your logs.</p>
          </div>
          <div className="flex items-center gap-4">
            {review && (
                <button onClick={() => onOpenReportModal(JSON.stringify(review))} className="p-1 text-slate-400 hover:text-rose-400 transition-colors" aria-label="Report weekly review">
                    <FlagIcon className="w-5 h-5" />
                </button>
            )}
            <button aria-label="Close" onClick={onClose} className="text-3xl text-slate-500 hover:text-white transition-colors">&times;</button>
          </div>
        </header>

        <div className="overflow-y-auto p-8 flex-grow">
          {isLoading || !review ? (
            <div className="flex flex-col justify-center items-center h-full text-center p-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400 mb-6"></div>
                <h3 className="text-xl font-semibold text-white mb-2">Analysis in Progress</h3>
                <p className="text-slate-300">Your AI Coach is analyzing your week's journal entries to uncover insights and patterns. This may take a moment.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {sections.map(({ key, title, Icon, color }, index) => {
                const content = review[key];
                if (!content) return null;
                return (
                  <div key={key} className="review-section" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className={`flex items-start gap-4 p-4 rounded-lg bg-black/20 border-l-4 ${color.replace('text-', 'border-')}`}>
                      <Icon className={`w-8 h-8 flex-shrink-0 mt-1 ${color}`} />
                      <div>
                        <h3 className={`text-xl font-semibold mb-2 ${color}`}>{title}</h3>
                        <p className="text-slate-200 leading-relaxed">{content}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <footer className="p-4 border-t border-white/10 sticky bottom-0 rounded-b-2xl">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-lg transition-opacity duration-200 hover:opacity-90"
          >
            Absorb and Continue
          </button>
        </footer>
      </div>
      <style>{`
        @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
        @keyframes slide-up { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
        .review-section {
            opacity: 0;
            transform: translateY(15px);
            animation: slide-up 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default React.memo(WeeklyReviewModal);
