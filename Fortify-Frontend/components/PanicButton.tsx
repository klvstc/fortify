import React from 'react';
import { ShieldIcon } from '../constants';

interface PanicButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

const PanicButton: React.FC<PanicButtonProps> = ({ onClick, disabled = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-red-600 text-white font-semibold rounded-full shadow-lg shadow-rose-500/30 transition-all duration-300 ${
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:opacity-90 transform hover:scale-105'
      }`}
      aria-label="S.O.S. Emergency Button"
    >
      <ShieldIcon className="w-5 h-5" />
      <span>S.O.S.</span>
    </button>
  );
};

export default React.memo(PanicButton);