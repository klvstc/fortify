import React, { useState, lazy, Suspense } from 'react';
import { type JournalEntry, type SocraticContext, type JournalTemplate, type ChatMessage } from '../types';
import { getSanctuaryInsight, getJournalingTemplate, getSanctuaryChatResponse } from '../services/geminiService';
import { JournalIcon, AetherIcon, PROVOCATEURS, CalendarCheckIcon, FlagIcon, BrainIcon } from '../constants';
import VictoryCalendar from './VictoryCalendar';
import { useAuth } from '../contexts/AuthContext';

const SanctuaryChat = lazy(() => import('./SanctuaryChat'));

interface TemplatePreviewModalProps {
    template: JournalTemplate;
    onClose: () => void;
    onUse: (templateString: string) => void;
    onReport: (content: string) => void;
}

const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({ template, onClose, onUse, onReport }) => {
    const templateString = `\n\n### ${template.title}\n\n${template.template}`;
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="glass-panel rounded-2xl shadow-xl p-6 max-w-lg w-full" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-white">Template: {template.title}</h3>
                    <button onClick={() => onReport(templateString)} className="p-1 text-slate-400 hover:text-rose-400 transition-colors" aria-label="Report template">
                        <FlagIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="bg-black/20 p-3 rounded-md max-h-48 overflow-y-auto whitespace-pre-wrap text-sm text-slate-200">
                    {template.template}
                </div>
                <div className="flex justify-end gap-4 mt-6">
                    <button onClick={onClose} className="px-4 py-2 bg-white/5 text-white font-semibold rounded-lg hover:bg-white/10">Cancel</button>
                    <button onClick={() => { onUse(templateString); onClose(); }} className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-lg hover:opacity-90">Use Template</button>
                </div>
            </div>
        </div>
    )
};


interface SanctuaryProps {
  entries: JournalEntry[];
  onAddEntry: (entry: Omit<JournalEntry, 'id' | 'date'>) => void;
  onDeleteEntry: (id: string) => void;
  unlockedToolIds: string[];
  aether: number;
  dailyLogAetherReward: number;
  onGenerateWeeklyReview: () => void;
  isReviewAvailable: boolean;
  isGeneratingReview: boolean;
  onStartInterrogation: (context: SocraticContext) => void;
  onGetJournalTemplate: () => Promise<JournalTemplate>;
  hasLoggedJournalToday: boolean;
  checkInHistory: string[];
  onOpenReportModal: (content: string) => void;
  sanctuaryChatHistory: ChatMessage[];
}

const MOODS = ['Neutral', 'Hopeful', 'Stressed', 'Lonely', 'Tired', 'Anxious', 'Proud', 'Grateful'];

const Sanctuary: React.FC<SanctuaryProps> = ({ entries, onAddEntry, onDeleteEntry, unlockedToolIds, aether, dailyLogAetherReward, onGenerateWeeklyReview, isReviewAvailable, isGeneratingReview, onStartInterrogation, onGetJournalTemplate, hasLoggedJournalToday, checkInHistory, onOpenReportModal, sanctuaryChatHistory }) => {
  const [newEntry, setNewEntry] = useState('');
  const [selectedMood, setSelectedMood] = useState('Neutral');
  const [insight, setInsight] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGettingPrompt, setIsGettingPrompt] = useState(false);
  const [activeTab, setActiveTab] = useState<'log' | 'history' | 'calendar' | 'insight' | 'chat'>('log');
  const [validationError, setValidationError] = useState('');
  const [templatePreview, setTemplatePreview] = useState<JournalTemplate | null>(null);
  const [isSageTyping, setIsSageTyping] = useState(false);
  const { setAppState } = useAuth();
  const [visibleEntriesCount, setVisibleEntriesCount] = useState(10);

  // Urge logger state
  const [showUrgeLogger, setShowUrgeLogger] = useState(false);
  const [urgeIntensity, setUrgeIntensity] = useState(5);
  const [selectedProvocateurs, setSelectedProvocateurs] = useState<string[]>([]);

  const isGuidedJournalingUnlocked = unlockedToolIds.includes('guided-journaling');

  const handleProvocateurToggle = (provocateur: string) => {
    setSelectedProvocateurs(prev =>
      prev.includes(provocateur)
        ? prev.filter(p => p !== provocateur)
        : [...prev, provocateur]
    );
  };

  const handleAddEntry = () => {
    if (hasLoggedJournalToday) return;

    if (newEntry.trim().split(/\s+/).length < 20) {
      setValidationError('Please write at least 20 words to fully explore your thoughts. This helps in generating better insights.');
      return;
    }
    
    setValidationError('');
    onAddEntry({
      content: newEntry,
      mood: selectedMood,
      urgeIntensity: showUrgeLogger ? urgeIntensity : undefined,
      provocateurs: showUrgeLogger ? selectedProvocateurs : undefined,
    });
    setNewEntry('');
    setSelectedMood('Neutral');
    setShowUrgeLogger(false);
    setUrgeIntensity(5);
    setSelectedProvocateurs([]);
    setActiveTab('history');
  };
  
  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setInsight('');
    const result = await getSanctuaryInsight(entries);
    setInsight(result);
    setIsAnalyzing(false);
  };
  
  const handleGetPrompt = async () => {
    setIsGettingPrompt(true);
    try {
        const templateData = await onGetJournalTemplate();
        setTemplatePreview(templateData);
    } catch (error) {
        console.error("Failed to get journal template", error);
    } finally {
        setIsGettingPrompt(false);
    }
  }

  const handleSendMessageToSage = async (message: string) => {
      const userMessage: ChatMessage = { role: 'user', content: message };
      const currentHistory = [...sanctuaryChatHistory, userMessage];
      setAppState({ sanctuaryChatHistory: currentHistory });
      setIsSageTyping(true);

      try {
          const response = await getSanctuaryChatResponse(currentHistory, entries);
          const modelMessage: ChatMessage = { role: 'model', content: response };
          setAppState({ sanctuaryChatHistory: [...currentHistory, modelMessage] });
      } catch (error) {
          console.error("Error with Sage response:", error);
          const errorMessage: ChatMessage = { role: 'model', content: "My vision is clouded. The connection to your past words is broken. Please try again." };
          setAppState({ sanctuaryChatHistory: [...currentHistory, errorMessage] });
      } finally {
          setIsSageTyping(false);
      }
  };

  const navItems: { id: typeof activeTab, label: string }[] = [
      { id: 'log', label: 'Log' },
      { id: 'history', label: 'History' },
      { id: 'calendar', label: 'Calendar' },
      { id: 'insight', label: 'Insight' },
      { id: 'chat', label: 'Chat' },
  ];

  return (
    <div className="w-full flex flex-col gap-6 text-left">
      <div className="glass-panel rounded-2xl p-6 text-center">
        <div className="flex items-center justify-center gap-4">
             <JournalIcon className="w-8 h-8 text-[var(--color-accent-primary)]" />
            <div>
                 <h3 className="text-lg font-semibold text-white">The Sanctuary</h3>
                <p className="text-sm text-slate-300">Your sacred space for reflection and insight.</p>
            </div>
             <div className="flex items-center gap-1 bg-black/20 px-3 py-1 rounded-full">
                <AetherIcon className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-bold text-cyan-400">{aether}</span>
            </div>
        </div>
        
        <div className="mt-4 flex justify-center glass-panel rounded-full p-1.5">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`px-4 py-1.5 text-xs font-semibold rounded-full flex-1 relative ${activeTab === item.id ? 'text-white' : 'text-slate-300 hover:text-white'}`}>
                {activeTab === item.id && <div className="absolute inset-0 bg-white/10 rounded-full -z-10" />}
                <span className="relative">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      {activeTab === 'log' && (
        <div className="glass-panel rounded-2xl p-6" style={{ animation: 'fade-in 0.3s ease-out' }}>
            <h3 className="text-lg font-semibold text-white mb-2">Daily Log</h3>

            {hasLoggedJournalToday ? (
                <div className="text-center py-8">
                    <p className="font-semibold text-emerald-400 text-lg">Your log for today is complete.</p>
                    <p className="text-slate-300 mt-2">Reflection is a daily practice. Return tomorrow to continue building your monument of will.</p>
                </div>
            ) : (
                <>
                    <p className="text-sm text-slate-400 mb-4">Log your thoughts, feelings, or urges. Each daily entry earns you <span className="text-cyan-400 font-bold">{dailyLogAetherReward} Aether</span>.</p>
                    <textarea
                        value={newEntry}
                        onChange={(e) => setNewEntry(e.target.value)}
                        placeholder="What's on your mind? (min. 20 words)"
                        className="w-full h-32 p-3 bg-black/20 rounded-lg text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                    />
                    <div className="flex flex-col sm:flex-row gap-4 mt-4">
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-slate-400 mb-1">Mood</label>
                            <select value={selectedMood} onChange={e => setSelectedMood(e.target.value)} className="w-full p-2.5 bg-black/20 rounded-lg text-slate-200 border border-transparent focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                                {MOODS.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                        {isGuidedJournalingUnlocked && (
                            <div className="flex-1">
                                <label className="block text-xs font-medium text-slate-400 mb-1">Feeling stuck?</label>
                                <button onClick={handleGetPrompt} disabled={isGettingPrompt} className="w-full p-2.5 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50">
                                    {isGettingPrompt ? 'Generating...' : 'Guided Template'}
                                </button>
                            </div>
                        )}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-white/10">
                        <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                            <input type="checkbox" checked={showUrgeLogger} onChange={e => setShowUrgeLogger(e.target.checked)} className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-rose-500 focus:ring-rose-500" />
                            Log an Urge / Provocateur
                        </label>
                    </div>
                    
                    {showUrgeLogger && (
                        <div className="mt-4 space-y-4 p-4 bg-black/20 rounded-lg" style={{ animation: 'fade-in 0.3s ease-out' }}>
                            <div>
                                <label className="block text-sm text-slate-300 mb-2">Urge Intensity: <span className="font-bold text-rose-400">{urgeIntensity}</span></label>
                                <input type="range" min="1" max="10" value={urgeIntensity} onChange={e => setUrgeIntensity(parseInt(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500" />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-300 mb-2">Provocateurs</label>
                                <div className="flex flex-wrap gap-2">
                                    {PROVOCATEURS.map(p => {
                                        const isSelected = selectedProvocateurs.includes(p);
                                        return (
                                            <button key={p} onClick={() => handleProvocateurToggle(p)} className={`px-3 py-1.5 text-xs rounded-full transition-colors ${isSelected ? 'bg-rose-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
                                                {p}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {validationError && <p className="text-rose-400 text-sm mt-4 text-center">{validationError}</p>}
                    
                    <button
                      onClick={handleAddEntry}
                      className="mt-4 w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
                    >
                      Save Entry (+{dailyLogAetherReward} Aether)
                    </button>
                </>
            )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-4" style={{ animation: 'fade-in 0.3s ease-out' }}>
            {entries.length === 0 ? (
              <p className="text-slate-400 text-center glass-panel rounded-2xl p-6">Your log history is empty.</p>
            ) : (
              <>
                {entries.slice(0, visibleEntriesCount).map(entry => (
                  <div key={entry.id} className="glass-panel rounded-2xl p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs text-slate-400 mb-2">{new Date(entry.date).toLocaleString()}</p>
                        <p className="text-slate-200 whitespace-pre-wrap">{entry.content}</p>
                      </div>
                      {entry.mood && <span className="text-xs bg-black/20 text-slate-300 px-2 py-1 rounded-full flex-shrink-0 ml-2">{entry.mood}</span>}
                    </div>
                     {(entry.urgeIntensity || (entry.provocateurs && entry.provocateurs.length > 0)) && (
                      <div className="mt-3 pt-3 border-t border-white/10 space-y-2 text-xs">
                          {entry.urgeIntensity && (
                              <p className="text-slate-300">
                                  Urge Intensity: <span className="font-bold text-rose-400">{entry.urgeIntensity}/10</span>
                              </p>
                          )}
                          {entry.provocateurs && entry.provocateurs.length > 0 && (
                              <div className="flex flex-wrap items-center gap-2">
                                  <p className="text-slate-300">Provocateurs:</p>
                                  {entry.provocateurs.map(p => (
                                      <span key={p} className="bg-rose-900/70 text-rose-300 px-2 py-0.5 rounded-full">{p}</span>
                                  ))}
                              </div>
                          )}
                      </div>
                    )}
                    <div className="flex items-center gap-4 mt-3">
                      <button onClick={() => onDeleteEntry(entry.id)} className="text-xs text-rose-500 hover:text-rose-400">Delete</button>
                       {entry.urgeIntensity && entry.urgeIntensity >= 7 && (
                          <button 
                              onClick={() => onStartInterrogation({
                                  urgeIntensity: entry.urgeIntensity!,
                                  provocateurs: entry.provocateurs || [],
                                  journalEntry: entry.content
                              })}
                              className="text-xs text-sky-400 hover:text-sky-300 font-semibold">
                              Interrogate Urge
                          </button>
                      )}
                    </div>
                  </div>
                ))}
                {visibleEntriesCount < entries.length && (
                    <button 
                        onClick={() => setVisibleEntriesCount(prev => prev + 10)}
                        className="w-full text-center text-sm py-2.5 font-semibold rounded-lg transition-colors bg-white/5 hover:bg-white/10 text-slate-200"
                    >
                        Load More Entries
                    </button>
                )}
              </>
            )}
        </div>
      )}

      {activeTab === 'calendar' && (
          <VictoryCalendar entries={entries} checkInHistory={checkInHistory} />
      )}
      
      {activeTab === 'insight' && (
        <div className="space-y-4">
            <div className="glass-panel rounded-2xl p-6" style={{ animation: 'fade-in 0.3s ease-out' }}>
                <h3 className="text-lg font-semibold text-white mb-4">AI-Powered Insight</h3>
                <p className="text-sm text-slate-400 mb-4">Let your AI companion analyze your logs to find patterns and offer guidance. More entries lead to deeper insights.</p>
                <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || entries.length < 2}
                className="w-full py-2.5 bg-gradient-to-r from-sky-500 to-blue-500 text-white font-semibold rounded-lg hover:opacity-90 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                >
                {isAnalyzing ? 'Analyzing...' : (entries.length < 2 ? `Need ${2 - entries.length} more entries` : 'Generate Insight')}
                </button>
                {isAnalyzing && (
                    <div className="mt-4 bg-black/20 p-4 rounded-lg animate-pulse">
                        <div className="h-3 bg-slate-700/50 rounded w-full mb-2"></div>
                        <div className="h-3 bg-slate-700/50 rounded w-full mb-2"></div>
                        <div className="h-3 bg-slate-700/50 rounded w-3/4"></div>
                    </div>
                )}
                {insight && !isAnalyzing && 
                    <div className="relative mt-4 bg-black/20 p-4 rounded-lg">
                        <button onClick={() => onOpenReportModal(insight)} className="absolute top-2 right-2 p-1 text-slate-500 hover:text-rose-400 transition-colors" aria-label="Report insight">
                            <FlagIcon className="w-4 h-4" />
                        </button>
                        <div className="text-slate-300 whitespace-pre-wrap text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: insight.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-sky-300">$1</strong>') }}></div>
                    </div>
                }
            </div>

            <div className="glass-panel rounded-2xl p-6" style={{ animation: 'fade-in 0.3s ease-out 100ms' }}>
                 <div className="flex items-center gap-3 mb-4">
                    <CalendarCheckIcon className="w-8 h-8 text-indigo-400" />
                    <div>
                        <h3 className="text-lg font-semibold text-white">Weekly Review</h3>
                        <p className="text-sm text-slate-400">Your AI coach will analyze your week and provide a strategic plan.</p>
                    </div>
                 </div>
                <button
                    onClick={onGenerateWeeklyReview}
                    disabled={!isReviewAvailable || isGeneratingReview}
                    className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-lg hover:opacity-90 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                >
                    {isGeneratingReview ? 'Analyzing Week...' : 'Start My Weekly Review'}
                </button>
                 {!isReviewAvailable && !isGeneratingReview && entries.length < 7 &&
                    <p className="text-xs text-slate-400 mt-2 text-center">Requires at least 7 journal entries to generate the first review.</p>
                }
            </div>
        </div>
      )}

      {activeTab === 'chat' && (
          <Suspense fallback={<div className="text-center p-8">Loading Chat...</div>}>
              <SanctuaryChat
                  history={sanctuaryChatHistory}
                  onSendMessage={handleSendMessageToSage}
                  isTyping={isSageTyping}
                  onOpenReportModal={onOpenReportModal}
                  journalExists={entries.length > 0}
              />
          </Suspense>
      )}
      
      {templatePreview && (
        <TemplatePreviewModal 
            template={templatePreview}
            onClose={() => setTemplatePreview(null)}
            onUse={(templateString) => setNewEntry(prev => prev ? `${prev}${templateString}`: templateString)}
            onReport={(content) => onOpenReportModal(content)}
        />
      )}

      <style>{`@keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }`}</style>
    </div>
  );
};

export default React.memo(Sanctuary);