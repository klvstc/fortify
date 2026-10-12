
import React from 'react';
import { GrandmasterIcon } from '../constants';

interface InitialStreakSetupProps {
    onStart: () => void;
}

const InitialStreakSetup: React.FC<InitialStreakSetupProps> = ({ onStart }) => {
    return (
        <div className="flex-grow flex flex-col items-center justify-center text-center animate-fade-in-slow p-4">
            <GrandmasterIcon className="w-24 h-24 text-amber-400/80 mb-6 animate-subtle-pulse" />
            <h2 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500 mb-4">
                Begin Your Journey
            </h2>
            <p className="text-lg text-slate-300 max-w-md mb-8">
                Commit to the path of self-mastery. Start your streak today and build a monument of will.
            </p>
            
            <div className="w-full max-w-sm space-y-4">
                 <button
                    onClick={onStart}
                    className="w-full px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-full shadow-lg shadow-amber-500/20 transform hover:scale-105 transition-all duration-300 ease-in-out"
                >
                    Start Your Journey
                </button>
            </div>
        </div>
    );
};

export default InitialStreakSetup;
