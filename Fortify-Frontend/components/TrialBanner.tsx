import React from 'react';

interface TrialBannerProps {
  isTrialActive: boolean;
  daysLeft: number;
  onClick: () => void;
}

const TrialBanner: React.FC<TrialBannerProps> = ({ isTrialActive, daysLeft, onClick }) => {
  if (!isTrialActive) {
    return (
        <button
          onClick={onClick}
          className="w-full bg-gradient-to-r from-rose-700 to-red-600 text-center p-2 rounded-lg mb-4 text-sm font-semibold text-white shadow-lg hover:opacity-90 transition-opacity"
          aria-label="Trial period has ended. Go to account."
        >
          <p>Your free trial has ended. Subscribe to continue your journey.</p>
        </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="w-full bg-gradient-to-r from-amber-600 to-amber-500 text-center p-2 rounded-lg mb-4 text-sm font-semibold text-white shadow-lg hover:opacity-90 transition-opacity"
      aria-label={`Trial period status: ${daysLeft} days left. Go to account.`}
    >
      {daysLeft > 0 ? (
        <p>You have {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left in your free trial.</p>
      ) : (
        <p>Your free trial ends today. Subscribe to keep your progress.</p>
      )}
    </button>
  );
};

export default React.memo(TrialBanner);