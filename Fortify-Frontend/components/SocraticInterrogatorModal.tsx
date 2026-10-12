import React, { useState, useEffect, useRef, FC } from 'react';
import { type Chat } from "@google/genai";
import { type SocraticContext, type ChatMessage } from '../types';
import { BrainIcon, FlagIcon } from '../constants';

interface SocraticInterrogatorModalProps {
  isOpen: boolean;
  context: SocraticContext | null;
  chat: Chat | null; // Chat might not be available if backend session isn't created
  onClose: () => void;
  onOpenReportModal: (content: string) => void;
}

const SocraticInterrogatorModal: FC<SocraticInterrogatorModalProps> = ({ isOpen, context, chat, onClose, onOpenReportModal }) => {
    const [history, setHistory] = useState<ChatMessage[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [input, setInput] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            window.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'auto';
        };
    }, [isOpen, onClose]);
    
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history, isTyping]);
    
    useEffect(() => {
        if (isOpen && context) {
            const provocateursText = context.provocateurs.length > 0 ? ` triggered by: ${context.provocateurs.join(', ')}` : '';
            const initialMessage = `Let's explore this. You logged an urge with an intensity of ${context.urgeIntensity}/10${provocateursText}. You wrote: "${context.journalEntry}".\n\nTake a moment to close your eyes. Where in your body do you feel this urge most intensely right now? Describe the physical sensation.`;
            // NOTE: This initial message is now just a placeholder. The real one would come from the backend chat session.
            setHistory([{ role: 'model', content: "Let's explore this urge. What is the very first physical sensation you notice?" }]);
        } else if (!isOpen) {
            // Cleanup on close
            setHistory([]);
            setIsTyping(false);
            setInput('');
        }
    }, [isOpen, context]);
    
    const handleSend = async () => {
        if (!input.trim() || !chat || isTyping) return;
        
        const currentInput = input;
        setInput('');
        setHistory(prev => [...prev, { role: 'user', content: currentInput }]);
        setIsTyping(true);
        
        try {
            // This assumes a chat session object is passed from the parent.
            // A real implementation would involve sending this to a backend endpoint.
            const response = await chat.sendMessage({ message: currentInput });
            setHistory(prev => [...prev, { role: 'model', content: response.text }]);
        } catch (error) {
            setHistory(prev => [...prev, { role: 'model', content: "It seems my thoughts are clouded. Let's pause for a moment. What is the simplest, kindest thing you can do for yourself right now?" }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xl flex items-center justify-center z-50 p-4"
            onClick={onClose}
            style={{ animation: 'fade-in 0.3s ease-out' }}
        >
            <div
                className="glass-panel rounded-2xl shadow-2xl w-full max-w-2xl h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
                style={{ animation: 'slide-up 0.4s ease-out' }}
            >
                <header className="p-4 border-b border-white/10 flex items-center justify-between sticky top-0 rounded-t-2xl z-10">
                    <div className="flex items-center gap-3">
                        <BrainIcon className="w-8 h-8 text-sky-400"/>
                        <div>
                            <h2 className="text-xl font-bold text-white">Interrogate the Urge</h2>
                            <p className="text-sm text-slate-400">Deconstruct the feeling. Find your power.</p>
                        </div>
                    </div>
                    <button aria-label="Close" onClick={onClose} className="text-3xl text-slate-500 hover:text-white transition-colors">&times;</button>
                </header>

                <div className="flex-grow overflow-y-auto p-4 pr-2 space-y-4">
                    {history.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex items-end gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`max-w-md p-3 rounded-2xl ${msg.role === 'user' ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-br-none' : 'bg-black/20 text-slate-200 rounded-bl-none'}`}>
                                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                </div>
                                {msg.role === 'model' && (
                                    <button onClick={() => onOpenReportModal(msg.content)} className="p-1 text-slate-500 hover:text-rose-400 transition-colors" aria-label="Report this message">
                                        <FlagIcon className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
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

                <footer className="p-4 border-t border-white/10">
                    <div className="flex items-center gap-2">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Answer the question..."
                            rows={1}
                            className="flex-grow bg-black/20 rounded-lg p-2.5 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-sky-500 focus:outline-none resize-none"
                            disabled={!chat}
                        />
                        <button
                            onClick={handleSend}
                            disabled={isTyping || !input.trim() || !chat}
                            className="bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold rounded-lg p-2.5 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M3.105 3.105a.75.75 0 01.814-.156l14.692 4.897a.75.75 0 010 1.308L3.92 17.052a.75.75 0 01-.814-.156L2.01 15.623a.75.75 0 01.183-1.019l4.5-3.75a.75.75 0 000-1.21L2.192 5.894a.75.75 0 01-.183-1.02l1.096-1.769z" /></svg>
                        </button>
                    </div>
                     {!chat && <p className="text-xs text-rose-400 mt-2 text-center">This feature requires a dedicated backend chat session and is currently disabled.</p>}
                </footer>
            </div>
            <style>{`
                @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
                @keyframes slide-up { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default React.memo(SocraticInterrogatorModal);