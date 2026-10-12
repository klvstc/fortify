import React, { useState } from 'react';
import { VAPID_PUBLIC_KEY } from '../firebase-config';

// This is a mock of the global firebase object provided by the Firebase SDK scripts.
declare const firebase: any;

const BellIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
);

const CheckCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const XCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

interface NotificationControlProps {
  permission: NotificationPermission;
  onEnable: () => void;
  notificationSettings: { time: string; timezone: string; token: string; } | null;
  onSetTime: (time: string) => void;
}

const NotificationControl: React.FC<NotificationControlProps> = ({ permission, onEnable, notificationSettings, onSetTime }) => {
    const [testStatus, setTestStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

    // Don't render if notifications are not supported by the browser at all.
    if (!('Notification' in window)) {
        return null;
    }
    
    const handleSendTest = async () => {
        setTestStatus('sending');
        try {
            const testFunction = firebase.functions().httpsCallable('sendTestNotification');
            const result = await testFunction();
            if (result.data.success) {
                setTestStatus('success');
            } else {
                setTestStatus('error');
            }
        } catch (error) {
            console.error("Error sending test notification:", error);
            setTestStatus('error');
        } finally {
            setTimeout(() => setTestStatus('idle'), 4000); // Reset after 4 seconds
        }
    };
    
    const formatTime = (time24: string) => {
        if (!time24) return '';
        const [hours, minutes] = time24.split(':');
        const d = new Date();
        d.setHours(parseInt(hours, 10));
        d.setMinutes(parseInt(minutes, 10));
        return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    };

    if (permission === 'granted') {
        let testButtonText = 'Send Test';
        if (testStatus === 'sending') testButtonText = 'Sending...';
        if (testStatus === 'success') testButtonText = 'Sent!';
        if (testStatus === 'error') testButtonText = 'Failed!';
        
        return (
            <div className="w-full bg-slate-800/50 rounded-xl p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <CheckCircleIcon className="w-6 h-6 text-emerald-300 flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-white text-sm">Daily reminders enabled</p>
                            {notificationSettings && (
                                <p className="text-xs text-slate-300">Next reminder at {formatTime(notificationSettings.time)}</p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={handleSendTest} 
                            disabled={testStatus === 'sending'}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${testStatus === 'success' ? 'bg-emerald-600 text-white' : testStatus === 'error' ? 'bg-rose-600 text-white' : 'bg-sky-600 hover:bg-sky-700 text-white'}`}
                        >
                            {testButtonText}
                        </button>
                        <div className="relative">
                            <label htmlFor="reminder-time" className="px-3 py-1.5 text-xs font-semibold bg-slate-600 hover:bg-slate-700 text-white rounded-md cursor-pointer">
                                Change
                            </label>
                            <input
                                id="reminder-time"
                                type="time"
                                value={notificationSettings?.time || '22:00'}
                                onChange={(e) => onSetTime(e.target.value)}
                                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                            />
                        </div>
                    </div>
                </div>
                {testStatus === 'success' && <p className="text-xs text-emerald-300 text-center">Test notification sent. It should arrive shortly.</p>}
                {testStatus === 'error' && <p className="text-xs text-rose-300 text-center">Failed to send. Your token may be invalid. Try re-enabling notifications.</p>}
            </div>
        );
    }
    
    if (permission === 'denied') {
        return (
             <div className="w-full bg-slate-800/50 rounded-xl p-3 flex flex-col items-center justify-center gap-2 text-sm text-rose-300 text-center">
                <div className="flex items-center gap-2">
                    <XCircleIcon className="w-5 h-5" />
                    <span>Daily reminders are blocked.</span>
                </div>
                <p className="text-xs text-slate-400">You must enable notifications in your browser or system settings to receive reminders.</p>
            </div>
        );
    }

    // Default permission
    return (
        <div className="w-full bg-slate-800/50 rounded-xl p-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <BellIcon className="w-6 h-6 text-amber-400" />
                <div>
                    <p className="font-semibold text-white text-sm">Stay on Track</p>
                    <p className="text-xs text-slate-300">Get a daily check-in reminder.</p>
                </div>
            </div>
            <button
                onClick={onEnable}
                className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md flex-shrink-0"
            >
                Enable
            </button>
        </div>
    );
};

export default React.memo(NotificationControl);