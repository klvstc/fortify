import React, { useEffect } from 'react';
import { type Badge } from '../types';
import { LaurelWreathIcon } from '../constants';

const ShimmerParticle: React.FC<{ style: React.CSSProperties }> = ({ style }) => (
  <div className="absolute" style={style} />
);

const BadgeNotification: React.FC<{ badge: Badge | null; onClose: () => void }> = ({ badge, onClose }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (badge) {
        window.addEventListener('keydown', handleEsc);
        document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
       if (badge) {
         document.body.style.overflow = 'auto';
       }
    };
  }, [badge, onClose]);

  if (!badge) return null;

  const particles = Array.from({ length: 40 }).map((_, i) => {
    const size = Math.random() * 6 + 3;
    const angle = Math.random() * 360;
    const radius = Math.random() * 90 + 70; // distance from center (in pixels)
    const left = `calc(50% + ${radius * Math.cos(angle * (Math.PI / 180))}px)`;
    const top = `calc(50% + ${radius * Math.sin(angle * (Math.PI / 180))}px)`;
    return {
      key: i,
      style: {
        left,
        top,
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: `hsl(${Math.random() * 60 + 20}, 100%, 70%)`,
        animation: `shimmer-burst 1.5s ${Math.random() * 0.5}s ease-out forwards`,
        opacity: 0,
        borderRadius: '50%',
      },
    };
  });

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-xl flex items-center justify-center z-50 p-4"
      onClick={onClose}
      style={{ animation: 'fade-in 0.3s ease-out' }}
    >
      <div 
        className="glass-panel border-amber-500/30 rounded-2xl shadow-2xl w-full max-w-sm text-center transform transition-all duration-300 scale-95 relative flex flex-col items-center p-8"
        style={{ animation: 'modal-pop 0.4s ease-out 0.1s forwards', visibility: 'hidden' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative mb-6">
            {particles.map(p => <ShimmerParticle key={p.key} style={p.style} />)}
            <LaurelWreathIcon className="w-48 h-48 text-amber-500/30 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            <div className="relative p-4 bg-black/20 rounded-full" style={{ animation: 'badge-reveal 0.8s ease-out 0.4s forwards', opacity: 0 }}>
                <badge.Icon className="w-24 h-24 text-amber-400" />
            </div>
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-2" style={{ animation: 'slide-up-text 0.6s ease-out 0.8s forwards', opacity: 0 }}>Achievement Unlocked!</h2>
        <h3 className="text-xl font-semibold text-amber-300 mb-2" style={{ animation: 'slide-up-text 0.6s ease-out 1s forwards', opacity: 0 }}>{badge.name}</h3>
        <p className="text-sm text-slate-300 mb-8" style={{ animation: 'slide-up-text 0.6s ease-out 1.2s forwards', opacity: 0 }}>{badge.description}</p>
        
        <button
          onClick={onClose}
          className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:opacity-90 text-black font-bold rounded-lg transition-colors"
          style={{ animation: 'slide-up-text 0.6s ease-out 1.4s forwards', opacity: 0 }}
        >
          Awesome!
        </button>
      </div>
      <style>{`
        @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
        @keyframes modal-pop { 
            0% { transform: scale(0.8); opacity: 0; }
            100% { transform: scale(1); opacity: 1; visibility: visible; }
        }
        @keyframes shimmer-burst {
            0% { transform: scale(0) rotate(0deg); opacity: 0.5; }
            50% { opacity: 1; }
            100% { transform: scale(1.5) rotate(90deg); opacity: 0; }
        }
        @keyframes badge-reveal {
            0% { transform: scale(0.5); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
        }
        @keyframes slide-up-text {
            0% { transform: translateY(20px); opacity: 0; }
            100% { transform: translateY(0px); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default React.memo(BadgeNotification);