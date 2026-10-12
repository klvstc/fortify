import React from 'react';
import { type DailyMindset as DailyMindsetType } from '../types';
import { FlagIcon } from '../constants';

interface DailyMindsetProps {
  mindset: DailyMindsetType | null;
  onOpenReportModal: (content: string) => void;
}

const SkeletonLoader: React.FC = () => (
    <div className="space-y-4 animate-pulse">
        <div>
            <div className="h-4 bg-slate-700/50 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-slate-700/50 rounded w-3/4"></div>
        </div>
        <div>
            <div className="h-4 bg-slate-700/50 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-slate-700/50 rounded w-1/2"></div>
        </div>
        <div>
            <div className="h-4 bg-slate-700/50 rounded w-1/4 mb-2"></div>
            <div className="h-3 bg-slate-700/50 rounded w-full"></div>
            <div className="h-3 bg-slate-700/50 rounded w-5/6 mt-2"></div>
        </div>
    </div>
);


const DailyMindset: React.FC<DailyMindsetProps> = ({ mindset, onOpenReportModal }) => {
  return (
    <div className="w-full glass-panel rounded-2xl p-8 text-left relative">
      {mindset && (
        <button
          onClick={() => onOpenReportModal(JSON.stringify(mindset))}
          className="absolute top-3 right-3 p-1 text-slate-500 hover:text-rose-400 transition-colors"
          aria-label="Report daily mindset"
        >
          <FlagIcon className="w-4 h-4" />
        </button>
      )}
      <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] mb-4 tracking-wider uppercase text-center">Daily Mindset</h3>
      {!mindset ? (
        <SkeletonLoader />
      ) : (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-[var(--color-accent-primary)]">Quote</h4>
            <p className="text-slate-200 italic">"{mindset.quote}"</p>
          </div>
          <div>
            <h4 className="font-semibold text-[var(--color-accent-primary)]">Affirmation</h4>
            <p className="text-slate-200">{mindset.affirmation}</p>
          </div>
          <div>
            <h4 className="font-semibold text-[var(--color-accent-primary)]">Success Story</h4>
            <p className="text-slate-300 text-sm">{mindset.story}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(DailyMindset);