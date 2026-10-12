import React, { useEffect } from 'react';
import { LaurelWreathIcon, GRANDMASTER_LEGACY_BADGE, ShareIcon } from '../constants';

interface LegendTriumphModalProps {
  isOpen: boolean;
  onClose: () => void;
  mentorName: string;
}

const LegendTriumphModal: React.FC<LegendTriumphModalProps> = ({ isOpen, onClose, mentorName }) => {
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
  
  const handleShare = () => {
    const recipient = 'aggarwaltanishq91@gmail.com';
    const subject = 'A Legend\'s Triumph: 365-Day Streak Achieved!';
    const body = 'I have successfully completed the 365-day journey on Fortify. This is a testament to discipline and will.\n\n#FortifyApp';
    const mailtoLink = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-xl flex items-center justify-center z-50 p-4 transition-opacity duration-300"
      onClick={onClose}
    >
      <div 
        className="glass-panel border-2 border-amber-500/50 rounded-2xl shadow-2xl shadow-amber-500/20 p-8 max-w-md w-full text-center transform transition-all duration-300 scale-95"
        style={{ animation: 'modal-pop-legend 0.5s cubic-bezier(0.25, 1, 0.5, 1) forwards' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center mb-4">
            <LaurelWreathIcon className="w-28 h-28 text-amber-400" />
        </div>
        <h2 className="text-4xl font-bold text-amber-300 mb-3" style={{ textShadow: '0 0 15px var(--tw-shadow-color)' }}>The Legend's Triumph</h2>
        <p className="text-lg text-amber-100/80 mb-6">
          You have walked the path for 365 days and achieved what few dare to attempt.
        </p>

        <div className="bg-black/40 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-white mb-3">Your Legacy Unlocked:</h3>
            <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-3">
                    <GRANDMASTER_LEGACY_BADGE.Icon className="w-6 h-6 text-amber-400 flex-shrink-0" />
                    <span className="text-amber-200/90">Earned the **{GRANDMASTER_LEGACY_BADGE.name}** badge.</span>
                </li>
                 <li className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex-shrink-0"></div>
                    <span className="text-amber-200/90">Unlocked the permanent **Legacy Theme**.</span>
                </li>
            </ul>
        </div>
        
        <div className="bg-black/40 rounded-lg p-4 mb-8 text-center italic">
            <p className="text-amber-100/70">"{mentorName} looks upon your journey with profound respect. 'You did not simply count the days,' they say, 'You made the days count. This victory is eternal.'"</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <button
                onClick={onClose}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:opacity-90 text-black font-bold rounded-lg transition-colors duration-200 shadow-lg shadow-amber-500/30 flex-1"
            >
                Embrace Your Legacy
            </button>
            <button
                onClick={handleShare}
                className="w-full py-3 bg-amber-200/20 hover:bg-amber-200/40 border border-amber-400 text-amber-300 font-bold rounded-lg transition-colors duration-200 flex-1 flex items-center justify-center gap-2"
            >
                <ShareIcon className="w-5 h-5" />
                Share Triumph
            </button>
        </div>
      </div>
      <style>{`
        @keyframes modal-pop-legend {
          0% { transform: scale(0.8) rotate(-5deg); opacity: 0; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default React.memo(LegendTriumphModal);