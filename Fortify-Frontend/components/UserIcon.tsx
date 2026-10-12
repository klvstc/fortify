import React from 'react';
import { UserIcon as UserIconSVG } from '../constants';

interface UserIconProps {
  onClick: () => void;
  isActive: boolean;
}

const UserIcon: React.FC<UserIconProps> = ({ onClick, isActive }) => {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-full transition-colors duration-200 ${
        isActive
          ? 'bg-amber-600/80 text-white'
          : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
      }`}
      aria-label="Open account settings"
    >
      <UserIconSVG className="w-6 h-6" />
    </button>
  );
};

export default React.memo(UserIcon);