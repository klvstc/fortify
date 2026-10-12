import React, { useEffect } from 'react';
import { WarningIcon } from '../constants';

interface RelapseConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const RelapseConfirmationModal: React.FC<RelapseConfirmationModalProps> = ({ isOpen, onClose, onConfirm }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
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
      <div className="glass-panel rounded-2xl shadow-xl p-8 max-w-sm w-full text-center" onClick={(e) => e.stopPropagation()} style={{ animation: 'modal-pop 0.3s ease-out forwards' }}>
        <WarningIcon className="w-16 h-16 mx-auto text-rose-400 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-4">Report Relapse?</h2>
        <p className="text-slate-300 mb-6">Are you sure you want to report a relapse? Your streak will be reset to this moment. This action is irreversible but marks the beginning of a new, honest journey.</p>
        <div className="flex flex-col gap-3">
          <button
            onClick={onConfirm}
            className="w-full px-6 py-3 bg-gradient-to-r from-rose-500 to-red-600 text-white font-bold rounded-lg transition-opacity hover:opacity-90"
          >
            Yes, I Relapsed
          </button>
          <button
            onClick={onClose}
            className="w-full px-6 py-2 bg-white/5 text-white font-semibold rounded-lg transition-colors hover:bg-white/10"
          >
            Cancel
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

export default React.memo(RelapseConfirmationModal);
