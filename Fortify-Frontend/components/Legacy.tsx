import React, { useState } from 'react';
import { type LegacyEntry } from '../types';
import { MonumentIcon, FlagIcon } from '../constants';

interface LegacyProps {
  log: LegacyEntry[];
  hasWrittenProverb: boolean;
  onAddProverb: (proverb: string) => void;
  onOpenReportModal: (content: string) => void;
}

const Legacy: React.FC<LegacyProps> = ({ log, hasWrittenProverb, onAddProverb, onOpenReportModal }) => {
  const [proverb, setProverb] = useState('');

  const handleSubmit = () => {
    if (proverb.trim()) {
      onAddProverb(proverb);
      setProverb('');
    }
  };

  const aiEntry = log.find(entry => entry.type === 'ai');
  const userEntry = log.find(entry => entry.type === 'user');

  return (
    <div className="w-full flex flex-col gap-6 text-left" style={{ animation: 'fade-in 0.5s ease-out' }}>
      <div className="glass-panel rounded-2xl p-6 text-center">
        <MonumentIcon className="w-16 h-16 mx-auto text-amber-300 mb-4" />
        <h3 className="text-xl font-bold text-amber-200 mb-2">The Legacy Log</h3>
        <p className="text-amber-100/70 text-sm">A permanent monument to your journey. A testament to the will that forged a new path.</p>
      </div>

      {aiEntry && (
        <div className="glass-panel rounded-2xl p-5 relative">
          <div className="flex justify-between items-start">
            <h4 className="text-lg font-bold text-amber-400 mb-3">Your Saga</h4>
            <button
              onClick={() => onOpenReportModal(aiEntry.content)}
              className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
              aria-label="Report legacy summary"
            >
              <FlagIcon className="w-4 h-4" />
            </button>
          </div>
          <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">{aiEntry.content}</p>
        </div>
      )}

      {userEntry || hasWrittenProverb ? (
        <div className="glass-panel rounded-2xl p-5">
          <h4 className="text-lg font-bold text-emerald-400 mb-3">Your Proverb</h4>
          <p className="text-slate-100 text-lg italic leading-relaxed">"{userEntry?.content || 'Your wisdom has been recorded.'}"</p>
        </div>
      ) : (
        aiEntry && (
          <div className="glass-panel rounded-2xl p-5">
            <h4 className="text-lg font-bold text-emerald-400 mb-3">Your Proverb</h4>
            <div className="flex flex-col gap-4">
              <p className="text-sm text-slate-300">You have earned the right to etch your wisdom here. What is the single most important lesson you have learned? This can only be done once.</p>
              <textarea
                value={proverb}
                onChange={(e) => setProverb(e.target.value)}
                placeholder="e.g., Discipline is the highest form of self-love."
                className="w-full p-3 bg-black/20 rounded-lg text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
              />
              <button
                onClick={handleSubmit}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
              >
                Etch Proverb into Legacy
              </button>
            </div>
          </div>
        )
      )}

      <style>{`
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default React.memo(Legacy);