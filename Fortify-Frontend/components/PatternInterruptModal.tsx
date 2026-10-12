import React, { FC, useEffect, useRef } from 'react';
import { type EmergencyNudge, type EnhancedEmergencyNudge } from '../types';
import { FlagIcon } from '../constants';

// A type guard to differentiate between nudge types at runtime
function isEnhancedNudge(nudge: EmergencyNudge | EnhancedEmergencyNudge): nudge is EnhancedEmergencyNudge {
  return (nudge as EnhancedEmergencyNudge).personalizedMessage !== undefined;
}

interface PatternInterruptModalProps {
  isOpen: boolean;
  isLoading: boolean;
  history: (EmergencyNudge | EnhancedEmergencyNudge)[];
  onClose: () => void;
  onEscalate: () => void;
  mentorIcon?: FC<{ className?: string }>;
  onOpenReportModal: (content: string) => void;
}

const NudgeDisplay: FC<{ nudge: EmergencyNudge | EnhancedEmergencyNudge; mentorIcon?: FC<{ className?: string }>; onOpenReportModal: (content: string) => void, isFirst: boolean }> = ({ nudge, mentorIcon: MentorIcon, onOpenReportModal, isFirst }) => {
    if (isEnhancedNudge(nudge)) {
        // Render the detailed "Enhanced Nudge" layout
        return (
            <div className="w-full text-left relative py-4">
                <button onClick={() => onOpenReportModal(JSON.stringify(nudge))} className="absolute top-2 right-0 p-1 text-slate-500 hover:text-rose-400" aria-label="Report enhanced nudge">
                    <FlagIcon className="w-4 h-4" />
                </button>
                <div className="glass-panel p-4 rounded-lg mb-4">
                    <p className="italic text-slate-300">{nudge.personalizedMessage}</p>
                </div>
                <div className="glass-panel p-4 rounded-lg mb-4">
                    <h3 className="font-semibold text-emerald-300 mb-3">Your Rescue Plan:</h3>
                    <ol className="list-decimal list-inside space-y-2 text-slate-200">
                        {nudge.rescuePlan.map((step, index) => <li key={index}>{step}</li>)}
                    </ol>
                </div>
                <div className="glass-panel p-4 rounded-lg">
                    <h3 className="font-semibold text-amber-400 mb-2">Remember Your Vision:</h3>
                    <p className="italic text-amber-200">"{nudge.visionReminder}"</p>
                </div>
            </div>
        );
    } else {
        // Render the simple "Initial Nudge" layout
        return (
            <div className="w-full relative py-4">
                <button onClick={() => onOpenReportModal(JSON.stringify(nudge))} className="absolute top-2 right-0 p-1 text-slate-500 hover:text-rose-400" aria-label="Report emergency nudge">
                    <FlagIcon className="w-4 h-4" />
                </button>
                {isFirst && MentorIcon && <MentorIcon className="w-20 h-20 mx-auto text-emerald-300 mb-6" />}
                <h1 className="text-4xl font-bold text-white mb-4" style={{ textShadow: '0 0 10px rgba(255, 255, 255, 0.3)' }}>
                    {nudge.title}
                </h1>
                <p className="text-lg text-slate-200/90 mb-8 max-w-md mx-auto">{nudge.message}</p>
                <div className="glass-panel border border-emerald-500/30 rounded-lg p-6">
                    <h3 className="text-sm font-semibold text-emerald-400 tracking-wider uppercase mb-3">Immediate Action</h3>
                    <p className="text-xl text-white font-semibold">{nudge.action}</p>
                </div>
            </div>
        );
    }
};

const PatternInterruptModal: React.FC<PatternInterruptModalProps> = ({ isOpen, isLoading, history, onClose, onEscalate, mentorIcon: MentorIcon, onOpenReportModal }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to the bottom when new content is added
    if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [history.length, isLoading]);

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

  const canEscalate = history.length > 0 && history.length < 3;

  return (
    <div
      className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl flex flex-col items-center justify-center z-50 p-4 text-center transition-opacity duration-300"
      style={{ animation: 'fade-in 0.3s ease-out' }}
      onClick={onClose}
    >
        <div 
            ref={scrollContainerRef}
            className="flex-grow w-full max-w-lg overflow-y-auto flex flex-col pt-12 pb-4 no-scrollbar"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="space-y-6">
                {history.map((nudge, index) => (
                    <div key={index} className={index === history.length - 1 ? "animate-slide-up" : ""}>
                        <NudgeDisplay 
                            nudge={nudge}
                            mentorIcon={MentorIcon}
                            onOpenReportModal={onOpenReportModal}
                            isFirst={index === 0}
                        />
                    </div>
                ))}
            </div>

            {isLoading && (
                <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400"></div>
                </div>
            )}
        </div>

        <div className="flex-shrink-0 mt-auto mb-4 w-full max-w-lg space-y-3" onClick={(e) => e.stopPropagation()}>
            {canEscalate && (
                <button
                    onClick={onEscalate}
                    disabled={isLoading}
                    className="w-full py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold rounded-full shadow-lg transition-opacity hover:opacity-90 disabled:bg-slate-600 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Thinking...' : 'Deeper Help'}
                </button>
            )}
            {history.length >= 3 && (
                 <p className="text-amber-400 font-semibold py-3">You have the tools. Now act.</p>
            )}
            <button
                onClick={onClose}
                className="w-full px-8 py-3 bg-white/5 text-white font-bold rounded-full shadow-lg transition-colors hover:bg-white/10"
            >
                I am in Control
            </button>
        </div>
        <style>{`
            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
            @keyframes slide-up { 
                0% { opacity: 0; transform: translateY(20px); } 
                100% { opacity: 1; transform: translateY(0); } 
            }
            .animate-slide-up {
                animation: slide-up 0.5s ease-out forwards;
            }
        `}</style>
    </div>
  );
};

export default React.memo(PatternInterruptModal);
