import React from 'react';
import { LIFE_ATTRIBUTES } from '../constants';

interface AttributeGrowthProps {
  streakDays: number;
}

const AttributeGrowth: React.FC<AttributeGrowthProps> = ({ streakDays }) => {
  return (
    <div className="w-full flex flex-col gap-4" style={{ animation: 'fade-in 0.3s ease-out' }}>
      <div className="glass-panel rounded-2xl p-6 text-center">
        <h3 className="text-lg font-semibold text-white mb-2">The Citadel of the Self</h3>
        <p className="text-sm text-slate-300">Your discipline forges new strengths within you. Watch them grow as you walk the path.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {LIFE_ATTRIBUTES.map((attr, index) => {
          const progress = Math.min((streakDays / (365 / attr.growthFactor)) * 100, 100);
          return (
            <div key={index} className="bg-black/20 p-4 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <attr.Icon className="w-8 h-8 text-green-400 flex-shrink-0" />
                <div>
                  <p className="font-bold text-white">{attr.name}</p>
                  <p className="text-xs text-slate-400">{attr.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-full bg-black/30 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <span className="text-sm font-semibold text-green-300 w-12 text-right">{Math.floor(progress)}%</span>
              </div>
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
      `}</style>
    </div>
  );
};

export default React.memo(AttributeGrowth);