import React, { useState, useMemo } from 'react';
import { type MentorPersona, type ChatMessage, type DreamBuilderInputs } from '../types';
import { MENTOR_PERSONAS, MENTOR_ARTICLES, SparklesIcon, FlagIcon } from '../constants';
import MentorChat from './MentorChat';
import MentorLibrary from './MentorLibrary';
import DreamBuilder from './DreamBuilder';

interface MentorProps {
  selectedMentorId: string;
  setSelectedMentorId: (id: string) => void;
  customMentor: Partial<MentorPersona>;
  setCustomMentor: (mentor: Partial<MentorPersona>) => void;
  chatHistory: ChatMessage[];
  onSendMessage: (message: string) => void;
  isTyping: boolean;
  visionNarrative: string | null;
  isGeneratingVision: boolean;
  onGenerateVision: (inputs: DreamBuilderInputs) => void;
  onResetVision: () => void;
  onOpenReportModal: (content: string) => void;
}

const Mentor: React.FC<MentorProps> = ({
  selectedMentorId,
  setSelectedMentorId,
  customMentor,
  setCustomMentor,
  chatHistory,
  onSendMessage,
  isTyping,
  visionNarrative,
  isGeneratingVision,
  onGenerateVision,
  onResetVision,
  onOpenReportModal,
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'library' | 'dreamBuilder'>('chat');
  
  const selectedMentor = useMemo(() => {
    if (selectedMentorId === 'custom') {
      return {
        ...MENTOR_PERSONAS.find(m => m.id === 'custom')!,
        ...customMentor,
      };
    }
    return MENTOR_PERSONAS.find(m => m.id === selectedMentorId)!;
  }, [selectedMentorId, customMentor]);

  const handleMentorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMentorId(e.target.value);
  };
  
  const handleCustomMentorChange = (field: 'name' | 'systemInstruction', value: string) => {
    setCustomMentor({ ...customMentor, [field]: value });
  };

  const navItems = [
    { id: 'chat', label: 'Chat' },
    { id: 'library', label: 'Wisdom Library' },
    { id: 'dreamBuilder', label: 'Dream Builder' },
  ];

  return (
    <div className="w-full flex flex-col gap-6 text-left" style={{ animation: 'fade-in 0.5s ease-out' }}>
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Your Mentor</h3>
            <selectedMentor.Icon className="w-10 h-10 text-[var(--color-accent-primary)]" />
        </div>
        
        <select
          value={selectedMentorId}
          onChange={handleMentorChange}
          className="w-full p-3 bg-black/20 rounded-lg text-slate-200 mb-4 focus:ring-2 focus:ring-emerald-500 focus:outline-none border border-transparent"
        >
          {MENTOR_PERSONAS.map(m => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
        <p className="text-sm text-slate-400">{selectedMentor.description}</p>
        
        {selectedMentorId === 'custom' && (
            <div className="mt-4 space-y-4 pt-4 border-t border-white/10">
                <input
                    type="text"
                    placeholder="Custom Mentor Name"
                    value={customMentor.name || ''}
                    onChange={(e) => handleCustomMentorChange('name', e.target.value)}
                    className="w-full p-2 bg-black/20 rounded-lg text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                 <textarea
                    placeholder="Describe your mentor's personality and wisdom... (e.g., 'You are Batman. You are disciplined, strategic, and speak about overcoming darkness.')"
                    value={customMentor.systemInstruction || ''}
                    onChange={(e) => handleCustomMentorChange('systemInstruction', e.target.value)}
                    className="w-full h-24 p-2 bg-black/20 rounded-lg text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
            </div>
        )}
      </div>

      <div className="flex justify-center glass-panel rounded-full p-1.5">
          {navItems.map(item => (
            <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-full flex-1 relative transition-colors duration-300 ${activeTab === item.id ? 'text-white' : 'text-slate-300 hover:text-white'}`}
            >
                {activeTab === item.id && <div className="absolute inset-0 bg-white/10 rounded-full -z-10" />}
                <span className="relative">{item.label}</span>
            </button>
          ))}
      </div>
      
      {activeTab === 'chat' && (
        <MentorChat 
            history={chatHistory} 
            onSendMessage={onSendMessage}
            isTyping={isTyping}
            onOpenReportModal={onOpenReportModal}
        />
      )}
      {activeTab === 'library' && (
        <MentorLibrary articles={MENTOR_ARTICLES} />
      )}
       {activeTab === 'dreamBuilder' && (
        <div className="glass-panel rounded-2xl p-6" style={{ animation: 'fade-in 0.3s ease-out' }}>
          <div className="flex items-center gap-3 mb-4">
            <SparklesIcon className="w-8 h-8 text-fuchsia-400" />
            <h4 className="text-lg font-bold text-fuchsia-400">The Dream Builder</h4>
          </div>
          {visionNarrative ? (
            <div className="space-y-4 relative">
              <button onClick={() => onOpenReportModal(visionNarrative)} className="absolute top-0 right-0 p-1 text-slate-500 hover:text-rose-400 transition-colors" aria-label="Report vision narrative">
                  <FlagIcon className="w-4 h-4" />
              </button>
              <p className="text-slate-100 text-lg italic leading-relaxed whitespace-pre-wrap">"{visionNarrative}"</p>
              <button
                onClick={onResetVision}
                className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-lg transition-colors"
              >
                Refine My Vision
              </button>
            </div>
          ) : (
            <DreamBuilder onGenerate={onGenerateVision} isGenerating={isGeneratingVision} />
          )}
        </div>
      )}
      
      <style>{`
        @keyframes fade-in { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default React.memo(Mentor);