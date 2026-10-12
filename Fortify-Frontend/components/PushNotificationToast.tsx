import React from 'react';

interface PushNotificationToastProps {
  onEnable: () => void;
  onDismiss: () => void;
}

const PushNotificationToast: React.FC<PushNotificationToastProps> = ({ onEnable, onDismiss }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 z-50 flex justify-center" style={{ animation: 'slide-up-toast 0.5s ease-out forwards' }}>
      <div className="bg-slate-800 rounded-lg shadow-xl p-4 max-w-lg w-full flex items-center justify-between gap-4 border border-slate-700">
        <div>
          <p className="font-semibold text-white">Stay on Track</p>
          <p className="text-sm text-slate-300">Enable notifications for a daily check-in reminder at 9:00 PM.</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button onClick={onDismiss} className="px-3 py-1.5 text-sm text-slate-300 hover:text-white">Later</button>
          <button onClick={onEnable} className="px-3 py-1.5 text-sm font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 text-white rounded-md">Enable</button>
        </div>
      </div>
      <style>{`
        @keyframes slide-up-toast {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(env(safe-area-inset-bottom, 0px)); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default React.memo(PushNotificationToast);