import React, { useState, useEffect } from 'react';

interface StreakTimerProps {
  startDate: Date | null;
}

const StreakTimer: React.FC<StreakTimerProps> = ({ startDate }) => {
  const [duration, setDuration] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    if (!startDate) {
      setDuration({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      return;
    }

    const interval = setInterval(() => {
      const now = new Date();
      const difference = now.getTime() - startDate.getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        setDuration({ days, hours, minutes, seconds });
      } else {
         setDuration({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startDate]);

  const pad = (num: number) => num.toString().padStart(2, '0');

  const TimeUnit: React.FC<{ value: string | number; label: string }> = ({ value, label }) => (
    <div className="flex flex-col items-center leading-none">
      <span
        className="text-5xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-300 tabular-nums"
        style={{ textShadow: '0 2px 10px rgba(0,0,0,0.2)', willChange: 'contents' }}
      >
        {value}
      </span>
      <span className="text-sm sm:text-base text-[var(--color-text-secondary)] tracking-widest mt-2">{label}</span>
    </div>
  );

  return (
    <div className="w-full glass-panel rounded-2xl p-6 text-center relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-br from-[var(--color-glow-1)]/20 to-transparent opacity-50 -translate-x-1/2"></div>
      <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] mb-4 tracking-wider uppercase">Current Streak</h3>
      <div className="flex justify-around items-start" aria-live="off" aria-atomic="true">
        <TimeUnit value={duration.days} label="DAYS" />
        <TimeUnit value={pad(duration.hours)} label="HOURS" />
        <TimeUnit value={pad(duration.minutes)} label="MINS" />
        <TimeUnit value={pad(duration.seconds)} label="SECS" />
      </div>
    </div>
  );
};

export default React.memo(StreakTimer);