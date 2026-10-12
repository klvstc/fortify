import React, { useState } from 'react';
import { type DreamBuilderInputs } from '../types';

interface DreamBuilderProps {
  onGenerate: (inputs: DreamBuilderInputs) => void;
  isGenerating: boolean;
}

const DreamBuilder: React.FC<DreamBuilderProps> = ({ onGenerate, isGenerating }) => {
  const [inputs, setInputs] = useState<DreamBuilderInputs>({
    feeling: '',
    morningAction: '',
    interaction: '',
    accomplishment: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(inputs);
  };
  
  const formFields = [
    { name: 'feeling' as const, label: 'How do you feel when you wake up?', placeholder: 'e.g., Energized, calm, and with a clear purpose...' },
    { name: 'morningAction' as const, label: 'What is the first productive action you take?', placeholder: 'e.g., I complete a hard workout and then read for 30 minutes...' },
    { name: 'interaction' as const, label: 'Describe a positive interaction you have.', placeholder: 'e.g., I have a deep, present conversation with my partner, free from distraction...' },
    { name: 'accomplishment' as const, label: 'What is a significant accomplishment you\'ve achieved?', placeholder: 'e.g., I launched my side project and it\'s helping people...' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4" style={{ animation: 'fade-in 0.5s ease-out' }}>
        <p className="text-sm text-slate-300">Answer the prompts below. The AI will then weave your answers into an inspiring narrative of your future self.</p>
        {formFields.map(field => (
            <div key={field.name}>
                <label htmlFor={field.name} className="block text-sm font-semibold text-slate-200 mb-2">{field.label}</label>
                <textarea
                    id={field.name}
                    name={field.name}
                    value={inputs[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    rows={2}
                    className="w-full p-2 bg-black/20 rounded-lg text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-fuchsia-500 focus:outline-none"
                    required
                />
            </div>
        ))}

        <button 
            type="submit"
            disabled={isGenerating}
            className="w-full py-3 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-bold rounded-lg disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors hover:opacity-90"
        >
            {isGenerating ? (
                 <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Building Your Dream...</span>
                </div>
            ) : (
                'Generate My Vision'
            )}
        </button>
        <style>{`
            @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
        `}</style>
    </form>
  );
};

export default React.memo(DreamBuilder);