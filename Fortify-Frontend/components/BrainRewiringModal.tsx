import React, { useEffect } from 'react';
import { BRAIN_REWIRING_COMPONENTS, BrainIcon } from '../constants';

interface BrainRewiringModalProps {
  isOpen: boolean;
  onClose: () => void;
  streakDays: number;
}

const BrainRewiringModal: React.FC<BrainRewiringModalProps> = ({ isOpen, onClose, streakDays }) => {
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
        className="glass-panel rounded-2xl shadow-2xl w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'slide-up 0.4s ease-out' }}
      >
        <header className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrainIcon className="w-8 h-8 text-sky-400" />
            <div>
              <h2 className="text-xl font-bold text-white">Brain Rewiring Details</h2>
              <p className="text-sm text-slate-400">Tracking the neuroplasticity of your recovery.</p>
            </div>
          </div>
          <button aria-label="Close" onClick={onClose} className="text-3xl text-slate-500 hover:text-white transition-colors">&times;</button>
        </header>

        <div className="p-6 space-y-6">
          {BRAIN_REWIRING_COMPONENTS.map((component, index) => {
            const progress = Math.min(100, (streakDays / component.daysToComplete) * 100);
            return (
              <div key={index}>
                <div className="mb-2">
                  <h4 className="font-semibold text-white">{component.name}</h4>
                  <p className="text-xs text-slate-400">{component.description}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-full bg-black/30 rounded-full h-2.5">
                    <div
                      className="bg-gradient-to-r from-sky-400 to-blue-500 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-sky-300 w-12 text-right">{Math.floor(progress)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <style>{`
        @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
        @keyframes slide-up { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default React.memo(BrainRewiringModal);
