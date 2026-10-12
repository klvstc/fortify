import React, { useEffect } from 'react';
import { WarningIcon, FlagIcon } from '../constants';

interface FalseCheckInNudgeModalProps {
  isOpen: boolean;
  reasoning: string;
  onConfirm: () => void; // User wants to check in anyway
  onReset: () => void; // User agrees and wants to reset
  onClose: () => void; // User wants to close without committing
  offenseCount: number;
  onOpenReportModal: (content: string) => void;
}

const FalseCheckInNudgeModal: React.FC<FalseCheckInNudgeModalProps> = ({ isOpen, reasoning, onConfirm, onReset, onClose, offenseCount, onOpenReportModal }) => {
  
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      // Escape should be a safe, non-destructive action.
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xl flex items-center justify-center z-50 p-4" onClick={onClose} style={{ animation: 'fade-in 0.3s ease-out' }}>
      <div className="glass-panel rounded-2xl shadow-xl p-8 max-w-sm w-full text-center border border-rose-500/50 relative" onClick={(e) => e.stopPropagation()} style={{ animation: 'modal-pop 0.3s ease-out forwards' }}>
        <button onClick={() => onOpenReportModal(reasoning)} className="absolute top-2 right-2 p-1 text-slate-500 hover:text-rose-400 transition-colors" aria-label="Report AI reasoning">
            <FlagIcon className="w-4 h-4" />
        </button>
        <WarningIcon className="w-16 h-16 mx-auto text-rose-400 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-4">Are You Sure?</h2>
        <p className="text-slate-300 mb-6">{reasoning}</p>
        <p className="text-slate-400 text-sm mb-6">Honesty with yourself is the bedrock of this journey. True strength lies in acknowledging setbacks, not hiding them.</p>
        {offenseCount >= 4 && (
            <div className="bg-amber-900/50 border border-amber-700 p-3 rounded-lg mb-6">
                <p className="text-yellow-300 text-sm font-bold">Warning: Further false check-ins will result in the suspension of Aether rewards.</p>
            </div>
        )}
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <button
            onClick={onReset}
            className="flex-1 px-6 py-2 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-lg transition-colors"
          >
            I need to reset.
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-6 py-2 bg-gradient-to-r from-rose-500 to-red-600 hover:opacity-90 text-white font-semibold rounded-lg transition-opacity"
          >
            Check in anyway.
          </button>
        </div>
      </div>
       <style>{`
        @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
        @keyframes modal-pop {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default React.memo(FalseCheckInNudgeModal);
