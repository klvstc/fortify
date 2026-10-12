import React, { FC, useEffect, useState } from 'react';

interface MissedCheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBackfillCheckin: (dateString: string) => void;
  onReportRelapse: () => void;
  missedDays: Date[];
}

const MissedCheckinModal: FC<MissedCheckinModalProps> = ({ isOpen, onClose, onBackfillCheckin, onReportRelapse, missedDays }) => {
  const [displayDays, setDisplayDays] = useState<Date[]>([]);
  const [loggedDays, setLoggedDays] = useState<Set<string>>(new Set());

  useEffect(() => {
    // This effect now ONLY runs when the modal's open state changes from false to true.
    // It captures the initial list of missed days to prevent the list from shrinking
    // as the user logs them, which would be caused by the `missedDays` prop updating.
    if (isOpen) {
      setDisplayDays(missedDays);
      setLoggedDays(new Set());
    }
    // `missedDays` is intentionally omitted from the dependency array to prevent re-running
    // when the prop changes while the modal is open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    // This separate effect handles non-data side-effects like keyboard listeners.
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

  // Use a timezone-aware date formatter to match the one in App.tsx.
  const toLocalDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleLogSuccess = (dateString: string) => {
    onBackfillCheckin(dateString);
    setLoggedDays(prev => new Set(prev).add(dateString));
  };

  const allDaysLogged = displayDays.length > 0 && displayDays.every(day => loggedDays.has(toLocalDateString(day)));

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-xl flex items-center justify-center z-50 p-4"
      onClick={onClose}
      style={{ animation: 'fade-in 0.3s ease-out' }}
    >
      <div
        className="glass-panel rounded-2xl shadow-2xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'slide-up 0.4s ease-out' }}
      >
        <header className="p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Log Missed Days</h2>
            <p className="text-sm text-slate-400">Address your missed check-ins with honesty.</p>
          </div>
          <button aria-label="Close" onClick={onClose} className="text-3xl text-slate-500 hover:text-white transition-colors">&times;</button>
        </header>
        
        <div className="p-6">
            <p className="text-sm text-slate-300 mb-6">For each missed day, log your success to add it to your history. Reporting a relapse will reset your streak.</p>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {displayDays.length > 0 ? (
                    displayDays.map(day => {
                        const dateString = toLocalDateString(day);
                        const isLogged = loggedDays.has(dateString);

                        return (
                            <div key={dateString} className={`flex items-center justify-between bg-black/20 p-3 rounded-lg transition-opacity ${isLogged ? 'opacity-60' : ''}`}>
                                <div>
                                    <p className="font-semibold text-slate-200">{day.toLocaleDateString(undefined, { weekday: 'long' })}</p>
                                    <p className="text-xs text-slate-400">{day.toLocaleDateString()}</p>
                                </div>
                                <div className="flex gap-2">
                                     {isLogged ? (
                                        <button
                                            disabled
                                            className="px-3 py-1.5 text-xs font-semibold rounded-md bg-slate-700 text-slate-400 cursor-not-allowed"
                                        >
                                            Logged
                                        </button>
                                     ) : (
                                        <button
                                            onClick={() => handleLogSuccess(dateString)}
                                            className="px-3 py-1.5 text-xs font-semibold rounded-md transition-colors bg-gradient-to-r from-sky-500 to-blue-600 hover:opacity-90 text-white"
                                        >
                                            Log Success
                                        </button>
                                     )}
                                     <button
                                        onClick={onReportRelapse}
                                        className="px-3 py-1.5 text-xs font-semibold rounded-md transition-colors bg-gradient-to-r from-rose-600 to-red-700 hover:opacity-90 text-white"
                                    >
                                        Report Relapse
                                    </button>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p className="text-center text-slate-400">No missed check-ins to log. Well done!</p>
                )}
                {allDaysLogged && (
                    <p className="text-center text-emerald-400 font-semibold pt-4">All missed days have been logged!</p>
                )}
            </div>
        </div>

        <footer className="p-4 border-t border-white/10">
            <button onClick={onClose} className="w-full py-2 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-lg">
                Done
            </button>
        </footer>
      </div>
      <style>{`
        @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
        @keyframes slide-up { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default React.memo(MissedCheckinModal);