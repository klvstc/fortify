import React, { useState, useMemo } from 'react';
import { type JournalEntry } from '../types';

interface VictoryCalendarProps {
  entries: JournalEntry[];
  checkInHistory: string[];
}

const JournalDayViewModal: React.FC<{ entries: JournalEntry[]; onClose: () => void }> = ({ entries, onClose }) => (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
    <div className="glass-panel rounded-2xl shadow-xl p-6 max-w-lg w-full max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
      <h2 className="text-xl font-bold text-white mb-4">Entries for {new Date(entries[0].date).toLocaleDateString()}</h2>
      <div className="overflow-y-auto space-y-4 pr-2">
        {entries.map(entry => (
          <div key={entry.id} className="bg-black/20 p-3 rounded-lg">
            <p className="text-xs text-slate-400 mb-1">{new Date(entry.date).toLocaleTimeString()}</p>
            <p className="text-slate-200 whitespace-pre-wrap text-sm">{entry.content}</p>
          </div>
        ))}
      </div>
      <button onClick={onClose} className="mt-6 w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-lg hover:opacity-90">
        Close
      </button>
    </div>
  </div>
);

const VictoryCalendar: React.FC<VictoryCalendarProps> = ({ entries, checkInHistory }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayEntries, setSelectedDayEntries] = useState<JournalEntry[] | null>(null);

  // Timezone-safe date string formatter
  const toLocalDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const journalDays = useMemo(() => {
    const dates = new Set<string>();
    entries.forEach(entry => {
      dates.add(toLocalDateString(new Date(entry.date)));
    });
    return dates;
  }, [entries]);

  const checkInDays = useMemo(() => {
    return new Set(checkInHistory);
  }, [checkInHistory]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  
  const handleDayClick = (day: number) => {
    const dateStr = toLocalDateString(new Date(year, month, day));
    const dayEntries = entries.filter(e => toLocalDateString(new Date(e.date)) === dateStr);
    if (dayEntries.length > 0) {
      setSelectedDayEntries(dayEntries);
    }
  };

  return (
    <div className="w-full glass-panel rounded-2xl p-6" style={{ animation: 'fade-in 0.3s ease-out' }}>
      <div className="flex items-center justify-between mb-4">
        <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-white/10">&lt;</button>
        <h3 className="text-lg font-semibold text-white">
          {currentDate.toLocaleString('default', { month: 'long' })} {year}
        </h3>
        <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-white/10">&gt;</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-400 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day}>{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = toLocalDateString(new Date(year, month, day));
          const hasJournal = journalDays.has(dateStr);
          const hasCheckIn = checkInDays.has(dateStr);

          let dayClasses = 'p-2 rounded-full flex items-center justify-center aspect-square transition-all duration-200 relative';
          let glowEffect = '';

          if (hasJournal && hasCheckIn) {
            dayClasses += ' bg-gradient-to-br from-emerald-500 to-teal-500 text-white font-bold cursor-pointer hover:opacity-80';
            glowEffect = 'shadow-[0_0_15px_rgba(45,212,191,0.5)]';
          } else if (hasJournal) {
            dayClasses += ' ring-2 ring-emerald-500/80 text-white cursor-pointer hover:bg-white/10';
          } else if (hasCheckIn) {
            dayClasses += ' ring-2 ring-sky-500/80 text-white';
          } else {
            dayClasses += ' text-slate-300';
          }

          return (
            <div
              key={day}
              onClick={() => handleDayClick(day)}
              className={`${dayClasses} ${glowEffect}`}
            >
              {day}
            </div>
          );
        })}
      </div>

       <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-slate-400">
        <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500"></div>
            <span>Journal & Check-in</span>
        </div>
        <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full ring-2 ring-emerald-500/80"></div>
            <span>Journal Only</span>
        </div>
        <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full ring-2 ring-sky-500/80"></div>
            <span>Check-in Only</span>
        </div>
    </div>

      {selectedDayEntries && (
        <JournalDayViewModal entries={selectedDayEntries} onClose={() => setSelectedDayEntries(null)} />
      )}
    </div>
  );
};

export default React.memo(VictoryCalendar);