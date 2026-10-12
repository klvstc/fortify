import React, { useState, useEffect } from 'react';
import { STORY_CHAPTERS, LockClosedIcon } from '../constants';
import { type StoryChapter } from '../types';

// The new infographic-style view for a single chapter.
const StoryChapterView: React.FC<{ chapter: StoryChapter; onClose: () => void }> = ({ chapter, onClose }) => {
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleEsc);
        
        return () => {
            document.body.style.overflow = 'auto';
            window.removeEventListener('keydown', handleEsc);
        };
    }, [onClose]);

    return (
        <div 
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
            style={{ animation: 'fade-in 0.3s ease-out' }}
        >
            <div 
                className="glass-panel rounded-2xl shadow-2xl w-full max-w-2xl h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
                style={{ animation: 'slide-up 0.4s ease-out' }}
            >
                <header className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 rounded-t-2xl">
                    <div className="flex items-center gap-4">
                        <chapter.Icon className="w-10 h-10 text-[var(--color-accent-primary)] flex-shrink-0" />
                        <div>
                            <h2 className="text-2xl font-bold text-white">{chapter.title}</h2>
                            <p className="text-sm text-slate-400">{chapter.theme}</p>
                        </div>
                    </div>
                    <button onClick={onClose} aria-label="Close" className="text-3xl text-slate-500 hover:text-white transition-colors">&times;</button>
                </header>
                <div className="overflow-y-auto p-8 space-y-8 flex-grow">
                    {chapter.sections.map((section, index) => (
                        <div key={index} className="story-section" style={{ animationDelay: `${index * 100}ms`}}>
                            <h3 className="text-xl font-semibold text-[var(--color-accent-primary)] mb-3">{section.title}</h3>
                            <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">{section.content}</p>
                        </div>
                    ))}
                </div>
            </div>
             <style>{`
                @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
                @keyframes slide-up { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
                .story-section {
                    opacity: 0;
                    transform: translateY(15px);
                    animation: slide-up 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
};


interface StoryJourneyProps {
  streakDays: number;
}

const StoryJourney: React.FC<StoryJourneyProps> = ({ streakDays }) => {
  const [viewingChapter, setViewingChapter] = useState<StoryChapter | null>(null);

  return (
    <div className="w-full flex flex-col gap-6 text-left" style={{ animation: 'fade-in-main 0.5s ease-out' }}>
       <div className="glass-panel rounded-2xl p-6 text-center">
        <h3 className="text-lg font-semibold text-white mb-2">The Saga of the Self</h3>
        <p className="text-sm text-slate-300">As you progress, new chapters of your epic journey will be unlocked, reflecting your own growth and resilience.</p>
      </div>

      <div className="space-y-4">
        {STORY_CHAPTERS.map((chapter, index) => {
          const isUnlocked = streakDays >= chapter.daysRequired;

          return (
            <button 
                key={index} 
                onClick={() => isUnlocked && setViewingChapter(chapter)}
                disabled={!isUnlocked}
                className={`w-full text-left glass-panel rounded-2xl p-5 transition-all duration-300 flex items-center gap-5 ${isUnlocked ? 'hover:bg-white/10 cursor-pointer' : 'opacity-60'}`}
            >
                <chapter.Icon className={`w-10 h-10 flex-shrink-0 ${isUnlocked ? 'text-[var(--color-accent-primary)]' : 'text-slate-500'}`} />
                <div className="flex-grow">
                    <div className="flex justify-between items-center">
                        <h4 className={`text-xl font-bold ${isUnlocked ? 'text-white' : 'text-slate-500'}`}>{chapter.title}</h4>
                        {!isUnlocked && <LockClosedIcon className="w-6 h-6 text-slate-500" />}
                    </div>
                    <p className={`mt-1 text-sm ${isUnlocked ? 'text-slate-300' : 'text-slate-400'}`}>
                        {isUnlocked ? chapter.theme : `Requires ${chapter.daysRequired} Days`}
                    </p>
                </div>
            </button>
          );
        })}
      </div>

      {viewingChapter && <StoryChapterView chapter={viewingChapter} onClose={() => setViewingChapter(null)} />}

      <style>{`
        @keyframes fade-in-main {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default React.memo(StoryJourney);