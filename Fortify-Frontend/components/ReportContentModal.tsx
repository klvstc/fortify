import React, { useState, useEffect } from 'react';
import { FlagIcon } from '../constants';

interface ReportContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentToReport: string;
}

const REPORT_REASONS = [
    'Offensive or Hateful Content',
    'Inaccurate or Misleading Information',
    'Promotes Dangerous Acts',
    'Spam or Unwanted Commercial Content',
    'Other (Please specify below)',
];

const ReportContentModal: React.FC<ReportContentModalProps> = ({ isOpen, onClose, contentToReport }) => {
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [comments, setComments] = useState('');

  useEffect(() => {
    // Reset state when modal opens
    if (isOpen) {
        setReason(REPORT_REASONS[0]);
        setComments('');
    }

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  const handleSubmit = () => {
    const recipient = 'support@unboxify.freshdesk.com';
    const subject = `Content Report from Fortify App`;
    const body = `A user has reported content from the Fortify application.

**Reason for Report:**
${reason}

**User Comments:**
${comments || 'No additional comments.'}

--- CONTENT TO REVIEW ---
${contentToReport}
--- END OF CONTENT ---
    `;
    const mailtoLink = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xl flex items-center justify-center z-50 p-4" onClick={onClose} style={{ animation: 'fade-in 0.3s ease-out' }}>
      <div className="glass-panel rounded-2xl shadow-xl p-6 max-w-lg w-full text-left" onClick={e => e.stopPropagation()} style={{ animation: 'slide-up 0.4s ease-out' }}>
        <header className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FlagIcon className="w-6 h-6 text-rose-400" />
            <h2 className="text-xl font-bold text-white">Report Content</h2>
          </div>
          <button aria-label="Close" onClick={onClose} className="text-3xl text-slate-500 hover:text-white">&times;</button>
        </header>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Content to Report:</label>
            <div className="bg-black/20 p-3 rounded-md max-h-32 overflow-y-auto text-sm text-slate-400 italic">
                "{contentToReport}"
            </div>
          </div>
          
          <div>
            <label htmlFor="report-reason" className="block text-sm font-semibold text-slate-300 mb-2">Why are you reporting this?</label>
            <select
                id="report-reason"
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="w-full p-2.5 bg-black/20 rounded-lg text-slate-200 focus:ring-2 focus:ring-rose-500 focus:outline-none border border-transparent"
            >
                {REPORT_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          
          <div>
            <label htmlFor="report-comments" className="block text-sm font-semibold text-slate-300 mb-2">Additional Comments (Optional):</label>
            <textarea
                id="report-comments"
                value={comments}
                onChange={e => setComments(e.target.value)}
                rows={3}
                placeholder="Provide more details here..."
                className="w-full p-2.5 bg-black/20 rounded-lg text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-rose-500 focus:outline-none border border-transparent"
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button onClick={onClose} className="px-6 py-2 bg-white/5 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} className="px-6 py-2 bg-gradient-to-r from-rose-500 to-red-600 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity">
            Submit Report
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
        @keyframes slide-up { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default React.memo(ReportContentModal);
