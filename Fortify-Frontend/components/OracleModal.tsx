import React, { useState, useEffect } from 'react';
import { type OracleResponse, type JournalEntry } from '../types';
import { getOracleResponse } from '../services/geminiService';
import { VisionIcon, FlagIcon } from '../constants'; // Using VisionIcon for the Oracle

interface OracleModalProps {
  isOpen: boolean;
  onClose: () => void;
  journalEntries: JournalEntry[];
  onOpenReportModal: (content: string) => void;
}

const OracleSkeletonLoader: React.FC = () => (
    <div className="space-y-6 animate-pulse">
        <div className="bg-black/20 p-4 rounded-lg">
            <div className="h-3 bg-slate-700/50 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-slate-700/50 rounded w-3/4"></div>
        </div>
        <div>
            <div className="h-4 bg-slate-700/50 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-slate-700/50 rounded w-full"></div>
            <div className="h-4 bg-slate-700/50 rounded w-full mt-2"></div>
            <div className="h-4 bg-slate-700/50 rounded w-5/6 mt-2"></div>
        </div>
    </div>
);


const OracleModal: React.FC<OracleModalProps> = ({ isOpen, onClose, journalEntries, onOpenReportModal }) => {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState<OracleResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setQuestion('');
      setResponse(null);
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
    if (!question.trim()) return;
    setIsLoading(true);
    setResponse(null);
    try {
      const result = await getOracleResponse(question, journalEntries);
      setResponse(result);
    } catch (error) {
      console.error("Error getting oracle response:", error);
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
            <VisionIcon className="w-8 h-8 text-indigo-400" />
            <div>
              <h2 className="text-xl font-bold text-white">The Oracle of Fortify</h2>
              <p className="text-sm text-slate-400">Ask a deep question. Receive profound insight.</p>
            </div>
          </div>
          <button aria-label="Close" onClick={onClose} className="text-3xl text-slate-500 hover:text-white transition-colors">&times;</button>
        </header>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {isLoading ? (
            <OracleSkeletonLoader />
          ) : response ? (
            <div className="space-y-4 animate-fade-in relative">
               <button onClick={() => onOpenReportModal(JSON.stringify(response))} className="absolute -top-2 -right-2 p-1 text-slate-500 hover:text-rose-400 transition-colors" aria-label="Report oracle response">
                  <FlagIcon className="w-4 h-4" />
              </button>
              <div className="bg-black/20 p-4 rounded-lg">
                <p className="text-sm text-slate-400 mb-1">Your Question:</p>
                <p className="italic text-slate-200">"{response.question}"</p>
              </div>
              <div>
                <h3 className="font-semibold text-indigo-300 mb-2">The Oracle's Answer:</h3>
                <p className="text-slate-200 whitespace-pre-wrap leading-relaxed">{response.answer}</p>
              </div>
              <button onClick={() => setResponse(null)} className="w-full mt-4 py-2 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-lg transition-colors">
                Ask Another Question
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-slate-300">The Oracle will analyze your entire journal history to answer one profound question. What do you wish to know?</p>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g., 'What is the biggest unseen pattern that is holding me back?'"
                rows={3}
                className="w-full p-3 bg-black/20 rounded-lg text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <button onClick={handleGenerate} disabled={isLoading || !question.trim()} className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-lg disabled:bg-slate-600 transition-colors hover:opacity-90">
                {isLoading ? 'Consulting the Oracle...' : 'Ask the Oracle'}
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

export default React.memo(OracleModal);