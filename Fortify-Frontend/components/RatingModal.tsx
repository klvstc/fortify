import React, { useEffect } from 'react';
import { StarIcon } from '../constants';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAlreadyRated: () => void;
}

const RatingModal: React.FC<RatingModalProps> = ({ isOpen, onClose, onAlreadyRated }) => {
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
  
  const playStoreUrl = 'https://play.google.com/store/apps/details?id=app.fortify.twa';

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-xl flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="glass-panel rounded-2xl shadow-xl p-8 max-w-sm w-full text-center transform transition-all duration-300 scale-95 relative z-10"
        style={{ animation: 'modal-pop 0.4s ease-out 0.1s forwards' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center mb-6">
          <div className="flex text-amber-400">
            <StarIcon className="w-10 h-10" style={{ animation: `star-pop 0.8s 0s ease-out forwards`, opacity: 0 }} />
            <StarIcon className="w-12 h-12 -mx-2 z-10" style={{ animation: `star-pop 0.8s 0.1s ease-out forwards`, opacity: 0 }} />
            <StarIcon className="w-10 h-10" style={{ animation: `star-pop 0.8s 0.2s ease-out forwards`, opacity: 0 }}/>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Enjoying Fortify?</h2>
        <p className="text-slate-300 mb-6">
          Your feedback is important. A 5-star rating on the Play Store helps us keep Fortify free for everyone and allows others to discover the app on their journey.
        </p>
        <div className="flex flex-col gap-3">
          <a
            href={playStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onAlreadyRated}
            className="w-full block text-center py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-lg transition-opacity duration-200 hover:opacity-90"
          >
            Rate 5 Stars
          </a>
          <button
            onClick={onClose}
            className="w-full py-2 bg-white/5 text-white font-semibold rounded-lg transition-colors duration-200 hover:bg-white/10"
          >
            Maybe Later
          </button>
        </div>
         <button
          onClick={onAlreadyRated}
          className="mt-4 text-xs text-slate-400 hover:text-white transition-colors"
        >
          I've already rated it
        </button>
      </div>
      <style>{`
        @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
        @keyframes modal-pop {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes star-pop {
          0% { transform: scale(0.5) translateY(10px); opacity: 0; }
          100% { transform: scale(1) translateY(0px); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default React.memo(RatingModal);