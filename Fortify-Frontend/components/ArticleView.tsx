import React, { useEffect } from 'react';
import { type MentorArticle } from '../types';

interface ArticleViewProps {
  article: MentorArticle;
  onClose: () => void;
}

const ArticleView: React.FC<ArticleViewProps> = ({ article, onClose }) => {
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
                <header className="p-6 border-b border-white/10 flex flex-col gap-4 sticky top-0 rounded-t-2xl z-10">
                    <div className="flex items-center gap-4">
                        <article.Icon className="w-10 h-10 text-[var(--color-accent-primary)] flex-shrink-0" />
                        <div>
                            <h2 className="text-2xl font-bold text-white">{article.title}</h2>
                            <p className="text-sm text-slate-400">{article.summary}</p>
                        </div>
                    </div>
                    <div className="bg-black/20 p-4 rounded-lg">
                        <h3 className="text-sm font-semibold text-[var(--color-accent-primary)] mb-2">Key Takeaways</h3>
                        <ul className="space-y-1.5 text-sm text-slate-300">
                            {article.keyTakeaways.map((takeaway, index) => (
                                <li key={index} className="flex items-start gap-2">
                                    <svg className="w-4 h-4 text-[var(--color-accent-primary)] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                                    <span>{takeaway}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <button aria-label="Close" onClick={onClose} className="absolute top-4 right-4 text-3xl text-slate-500 hover:text-white transition-colors">&times;</button>
                </header>
                <div className="overflow-y-auto p-8 space-y-8 flex-grow">
                    {article.sections.map((section, index) => (
                        <div key={index} className="article-section" style={{ animationDelay: `${index * 100}ms`}}>
                            <h3 className="text-xl font-semibold text-[var(--color-accent-primary)] mb-3">{section.title}</h3>
                            <div className="text-slate-200 leading-relaxed whitespace-pre-wrap space-y-4" dangerouslySetInnerHTML={{ __html: section.content.replace(/\n/g, '</p><p class="mt-4">') }} />
                        </div>
                    ))}
                </div>
            </div>
             <style>{`
                @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
                @keyframes slide-up { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
                .article-section {
                    opacity: 0;
                    transform: translateY(15px);
                    animation: slide-up 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default React.memo(ArticleView);