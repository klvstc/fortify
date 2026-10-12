import React, { useState, useMemo } from 'react';
import { type ActiveWager, type WagerableItem } from '../types';
import { AetherIcon, VaultIcon } from '../constants';

interface CommitmentVaultProps {
    aether: number;
    activeWager: ActiveWager | null;
    onSetWager: (goalDays: number, wager: WagerableItem) => void;
    streakDays: number;
}

const CommitmentVault: React.FC<CommitmentVaultProps> = ({ aether, activeWager, onSetWager, streakDays }) => {
    const MIN_WAGER = 10;
    const MAX_WAGER = 500;
    const MIN_DAYS = 7;
    const MAX_DAYS = 90;

    const [aetherAmount, setAetherAmount] = useState(MIN_WAGER);

    const calculatedDays = useMemo(() => {
        if (isNaN(aetherAmount) || aetherAmount < MIN_WAGER || aetherAmount > MAX_WAGER) {
            return MIN_DAYS;
        }
        const wagerRange = MAX_WAGER - MIN_WAGER;
        const dayRange = MAX_DAYS - MIN_DAYS;
        const progress = (aetherAmount - MIN_WAGER) / wagerRange;
        return Math.ceil(MIN_DAYS + progress * dayRange);
    }, [aetherAmount]);
    
    const handleSetWager = () => {
        if (aetherAmount < MIN_WAGER || aetherAmount > MAX_WAGER || aetherAmount > aether) return;
        
        const wager: WagerableItem = { type: 'aether', amount: aetherAmount };
        onSetWager(calculatedDays, wager);
    };

    if (activeWager) {
        const { goalDays, startStreakDays, wager } = activeWager;
        
        const daysCompletedSinceWager = streakDays - activeWager.startStreakDays;

        const progress = Math.min((daysCompletedSinceWager / goalDays) * 100, 100);

        return (
            <div className="w-full glass-panel rounded-2xl p-6 text-center" style={{ animation: 'fade-in 0.5s ease-out' }}>
                <VaultIcon className="w-16 h-16 mx-auto text-amber-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Commitment Locked</h3>
                <p className="text-slate-300 mb-6">Your wager is sealed. Fulfill your commitment to receive double your wager back.</p>
                
                <div className="bg-black/20 p-4 rounded-lg text-left mb-6">
                    <p className="text-slate-400 text-sm">Goal: <span className="font-bold text-white">{goalDays}-Day Streak</span></p>
                    <p className="text-slate-400 text-sm">Wagered: <span className="font-bold text-white">{wager.amount} Aether</span></p>
                    <p className="text-slate-400 text-sm">Potential Reward: <span className="font-bold text-amber-400">{wager.amount * 2} Aether</span></p>
                </div>

                <div className="w-full">
                    <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
                        <span>Progress</span>
                        <span>{daysCompletedSinceWager} / {goalDays} Days</span>
                    </div>
                    <div className="w-full bg-black/30 rounded-full h-3">
                        <div className="bg-gradient-to-r from-amber-500 to-yellow-500 h-3 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
            </div>
        );
    }
    
    const maxWagerable = Math.min(MAX_WAGER, aether);
    const canWager = aetherAmount >= MIN_WAGER && aetherAmount <= maxWagerable;

    return (
        <div className="w-full flex flex-col gap-6 text-left" style={{ animation: 'fade-in 0.5s ease-out' }}>
            <div className="glass-panel rounded-2xl p-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-white">Commitment Vault</h3>
                    <AetherIcon className="w-5 h-5 text-cyan-400" />
                    <span className="text-lg font-bold text-cyan-400">{aether}</span>
                </div>
                <p className="text-sm text-slate-300">Raise the stakes. Commit to a goal and wager for double the reward.</p>
            </div>
            
             <div className="glass-panel rounded-2xl p-6">
                 <h4 className="text-md font-semibold text-white mb-2">Place Your Wager</h4>
                 <p className="text-sm text-slate-400 mb-3">Wager between {MIN_WAGER} and {MAX_WAGER} Aether. The commitment period scales with your wager.</p>
                 <div>
                    <label htmlFor="wager-amount" className="block text-sm text-slate-400 mb-2">Amount to Wager</label>
                    <input 
                        id="wager-amount"
                        type="number" 
                        value={aetherAmount} 
                        onChange={e => setAetherAmount(parseInt(e.target.value, 10))} 
                        min={MIN_WAGER}
                        max={maxWagerable} 
                        step="5"
                        className="w-full p-3 bg-black/20 rounded-lg text-slate-200 border border-transparent focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        disabled={aether < MIN_WAGER}
                    />
                    {aether < MIN_WAGER && <p className="text-rose-400 text-xs mt-2">You need at least {MIN_WAGER} Aether to place a wager.</p>}
                 </div>

                 <div className="mt-4 bg-black/20 p-4 rounded-lg text-center">
                    <p className="text-slate-300">Your Commitment: <span className="font-bold text-white">{calculatedDays} Day Streak</span></p>
                    <p className="text-slate-300">Potential Reward: <span className="font-bold text-amber-400">{!isNaN(aetherAmount) ? aetherAmount * 2 : 0} Aether</span></p>
                 </div>
            </div>

            <button onClick={handleSetWager} disabled={!canWager} className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-lg hover:opacity-90 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors">
                Lock In Commitment
            </button>
            <style>{`
                @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
            `}</style>
        </div>
    );
};

export default React.memo(CommitmentVault);