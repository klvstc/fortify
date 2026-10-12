import React, { useState, useRef, useEffect } from 'react';
import { type ChatMessage } from '../types';
import { FlagIcon, BrainIcon } from '../constants';

interface SanctuaryChatProps {
  history: ChatMessage[];
  onSendMessage: (message: string) => void;
  isTyping: boolean;
  onOpenReportModal: (content: string) => void;
  journalExists: boolean;
}

const SanctuaryChat: React.FC<SanctuaryChatProps> = ({ history, onSendMessage, isTyping, onOpenReportModal, journalExists }) => {
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [visibleMessagesCount, setVisibleMessagesCount] = useState(20);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isTyping]);
  
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = `${scrollHeight}px`;
    }
  }, [input]);

  const handleSend = () => {
    if (input.trim() && journalExists) {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const messagesToShow = history.slice(-visibleMessagesCount);

  return (
    <div className="w-full flex flex-col gap-4" style={{ animation: 'fade-in 0.3s ease-out' }}>
      <div className="glass-panel rounded-2xl p-4 h-96 flex flex-col">
        <div className="flex-grow overflow-y-auto pr-2 space-y-4">
          {history.length > visibleMessagesCount && (
            <div className="text-center">
              <button
                onClick={() => setVisibleMessagesCount(prev => Math.min(prev + 20, history.length))}
                className="text-xs text-sky-400 font-semibold hover:underline"
              >
                Load older messages
              </button>
            </div>
          )}

          {!journalExists ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 p-4">
              <BrainIcon className="w-16 h-16 mb-4 text-slate-500" />
              <p>The Inner Sage is silent.</p>
              <p className="text-sm">Write at least one journal entry to begin a conversation about your journey.</p>
            </div>
          ) : messagesToShow.length === 0 && !isTyping && history.length === 0 ? (
             <div className="flex justify-start">
              <div className="max-w-xs md:max-w-md p-3 rounded-2xl bg-black/20 text-slate-200 rounded-bl-none">
                <p className="text-sm whitespace-pre-wrap leading-relaxed">Welcome, friend. This is a quiet space for reflection. I've read through your entries and am here to help you explore your thoughts and feelings. What's on your mind?</p>
              </div>
            </div>
          ) : (
            messagesToShow.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-end gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${msg.role === 'user' ? 'bg-gradient-to-br from-sky-500 to-blue-600 text-white rounded-br-none' : 'bg-black/20 text-slate-200 rounded-bl-none'}`}>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  </div>
                  {msg.role === 'model' && (
                    <button onClick={() => onOpenReportModal(msg.content)} className="p-1 text-slate-500 hover:text-rose-400 transition-colors" aria-label="Report this message">
                      <FlagIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
          {isTyping && (
             <div className="flex justify-start">
                <div className="max-w-xs md:max-w-md p-3 rounded-2xl bg-black/20 text-slate-200 rounded-bl-none">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-sky-400 rounded-full animate-pulse delay-0"></span>
                        <span className="w-2 h-2 bg-sky-400 rounded-full animate-pulse delay-150"></span>
                        <span className="w-2 h-2 bg-sky-400 rounded-full animate-pulse delay-300"></span>
                    </div>
                </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={journalExists ? "Ask about your journey..." : "Write a journal entry first."}
            rows={1}
            disabled={!journalExists}
            className="flex-grow bg-black/20 rounded-lg p-2.5 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-sky-500 focus:outline-none resize-none transition disabled:opacity-50"
            style={{ maxHeight: '100px' }}
          />
          <button
            onClick={handleSend}
            disabled={isTyping || !input.trim() || !journalExists}
            className="bg-gradient-to-r from-sky-500 to-blue-500 text-white font-semibold rounded-lg p-2.5 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M3.105 3.105a.75.75 0 01.814-.156l14.692 4.897a.75.75 0 010 1.308L3.92 17.052a.75.75 0 01-.814-.156L2.01 15.623a.75.75 0 01.183-1.019l4.5-3.75a.75.75 0 000-1.21L2.192 5.894a.75.75 0 01-.183-1.02l1.096-1.769z" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(SanctuaryChat);