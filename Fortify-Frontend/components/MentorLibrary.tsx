import React, { useState } from 'react';
import { type MentorArticle } from '../types';
import ArticleView from './ArticleView';

interface MentorLibraryProps {
  articles: MentorArticle[];
}

const MentorLibrary: React.FC<MentorLibraryProps> = ({ articles }) => {
  const [viewingArticle, setViewingArticle] = useState<MentorArticle | null>(null);

  return (
    <div className="w-full flex flex-col gap-4" style={{ animation: 'fade-in 0.3s ease-out' }}>
      <div className="glass-panel rounded-2xl p-6 text-center">
        <h3 className="text-lg font-semibold text-white mb-2">Wisdom Library</h3>
        <p className="text-sm text-slate-300">Reflect on these core principles to strengthen your resolve.</p>
      </div>

      <div className="space-y-4">
        {articles.map((article, index) => (
          <button
            key={index}
            onClick={() => setViewingArticle(article)}
            className="w-full text-left p-4 flex items-center gap-4 glass-panel rounded-xl hover:bg-white/10 transition-colors duration-200"
          >
            <article.Icon className="w-10 h-10 text-amber-300 flex-shrink-0" />
            <div className="flex-grow">
              <h4 className="font-semibold text-white">{article.title}</h4>
              <p className="text-sm text-slate-400 mt-1">{article.summary}</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        ))}
      </div>
       
       {viewingArticle && <ArticleView article={viewingArticle} onClose={() => setViewingArticle(null)} />}

       <style>{`
        @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
      `}</style>
    </div>
  );
};

export default React.memo(MentorLibrary);