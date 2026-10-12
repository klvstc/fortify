import React, { useState, useEffect } from 'react';
import { type GuidedMeditation } from '../types';
import { getGuidedMeditation } from '../services/geminiService';
import { HeartWaveIcon, FlagIcon } from '../constants'; // Using HeartWaveIcon for meditation

interface GuidedMeditationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenReportModal: (content: string) => void;
}

const MeditationSkeletonLoader: React.FC = () => (
    <div className="space-y-4 animate-pulse">
        <div className="h-6 bg-slate-700/50 rounded w-1/2 mb-4"></div>
        <div className="h-4 bg-slate-700/50 rounded w-full"></div>
        <div className="h-4 bg-slate-700/50 rounded w-full mt-2"></div>
        <div className="h-4 bg-slate-700/50 rounded w-full mt-2"></div>
        <div className="h-4 bg-slate-700/50 rounded w-3/4 mt-2"></div>
    </div>
);


const GuidedMeditationModal: React.FC<GuidedMeditationModalProps> = ({ isOpen, onClose, onOpenReportModal }) => {
  const [need, setNeed] = useState('');
  const [meditation, setMeditation] = useState<GuidedMeditation | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNeed('');
      setMeditation(null);
      setIsLoading(false);
    }
  }, [isOpen]);
  
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

  const handleGenerate = async () => {
    if (!need.trim()) return;
    setIsLoading(true);
    setMeditation(null);
    try {
      const result = await getGuidedMeditation(need);
      setMeditation(result);
    } catch (error) {
      console.error("Error generating meditation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xl flex items-center justify-center z-50 p-4" onClick={onClose} style={{ animation: 'fade-in 0.3s ease-out' }}>
      <div className="glass-panel rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()} style={{ animation: 'slide-up 0.4s ease-out' }}>
        <header className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <HeartWaveIcon className="w-8 h-8 text-fuchsia-400" />
            <div>
              <h2 className="text-xl font-bold text-white">AI Guided Meditation</h2>
              <p className="text-sm text-slate-400">Instant calm, tailored to your needs.</p>
            </div>
          </div>
          <button aria-label="Close" onClick={onClose} className="text-3xl text-slate-500 hover:text-white transition-colors">&times;</button>
        </header>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {isLoading ? (
            <MeditationSkeletonLoader />
          ) : meditation ? (
            <div className="space-y-4 animate-fade-in relative">
                <button onClick={() => onOpenReportModal(JSON.stringify(meditation))} className="absolute -top-2 -right-2 p-1 text-slate-500 hover:text-rose-400 transition-colors" aria-label="Report meditation script">
                  <FlagIcon className="w-4 h-4" />
                </button>
                <h3 className="font-semibold text-fuchsia-300 mb-2">{meditation.title}</h3>
                <p className="text-slate-200 whitespace-pre-wrap leading-relaxed">{meditation.script}</p>
              <button onClick={() => setMeditation(null)} className="w-full mt-4 py-2 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-lg transition-colors">
                Generate Another
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-slate-300">What do you need help with right now? Describe the feeling you want to address.</p>
              <input
                type="text"
                value={need}
                onChange={(e) => setNeed(e.target.value)}
                placeholder="e.g., 'Calming anxiety before a meeting'"
                className="w-full p-3 bg-black/20 rounded-lg text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-fuchsia-500 focus:outline-none"
              />
              <button onClick={handleGenerate} disabled={isLoading || !need.trim()} className="w-full py-3 bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white font-bold rounded-lg disabled:bg-slate-600 transition-colors hover:opacity-90">
                {isLoading ? 'Generating Script...' : 'Generate My Meditation'}
              </button>
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
        @keyframes slide-up { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default React.memo(GuidedMeditationModal);