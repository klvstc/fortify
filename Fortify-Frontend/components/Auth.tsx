import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { GrandmasterIcon } from '../constants';

const getFriendlyAuthError = (err: any): string => {
  if (!err.code) {
    return err.message || 'An unexpected error occurred. Please try again.';
  }

  switch (err.code) {
    // Group common login failures for a clearer, more secure message.
    // Firebase often returns 'auth/invalid-credential' for both wrong password and user-not-found
    // to prevent email enumeration. This combined message is more user-friendly.
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'The password you entered is incorrect, or no account exists with that email. Please check your credentials and try again.';
    
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/email-already-in-use':
      return 'An account already exists with this email address.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters long.';
    case 'auth/too-many-requests':
      return 'Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection and try again.';
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
        return 'The sign-in process was cancelled.';
    default:
      // Keep the default for truly unexpected errors.
      return 'An unexpected error occurred. Please try again.';
  }
};

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup, sendPasswordReset } = useAuth();

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password);
      }
    } catch (err: any) {
      setError(getFriendlyAuthError(err));
    }

    setLoading(false);
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await sendPasswordReset(email);
      setMessage('Password reset link sent to your email. If you don\'t see it in your inbox, please check your spam folder.');
    } catch (err: any) {
      setError(getFriendlyAuthError(err));
    }
    setLoading(false);
  };
  
  const resetFormState = () => {
    setError('');
    setMessage('');
    setEmail('');
    setPassword('');
  };
  
  const toggleForm = (loginState: boolean) => {
    setIsLogin(loginState);
    setIsForgotPassword(false);
    resetFormState();
  };

  const showForgotPassword = () => {
    setIsForgotPassword(true);
    resetFormState();
  };
  
  const showLogin = () => {
    setIsForgotPassword(false);
    resetFormState();
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
      <div className="w-full max-w-sm">
        <GrandmasterIcon className="w-20 h-20 text-amber-400/80 mb-6 mx-auto" />
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Welcome to Fortify</h1>
        <p className="text-slate-400 mb-6">
            {isForgotPassword ? 'Reset your password.' : isLogin ? 'Sign in to continue your journey.' : 'Create an account to begin.'}
        </p>
        
        <div className="glass-panel rounded-xl p-8">
            {isForgotPassword ? (
                <form onSubmit={handlePasswordReset} className="space-y-4">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full p-3 bg-black/20 rounded-lg text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        required
                    />
                    {error && <p className="text-rose-400 text-sm">{error}</p>}
                    {message && <p className="text-emerald-400 text-sm">{message}</p>}
                    <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-bold rounded-lg hover:opacity-90 disabled:bg-slate-600 disabled:opacity-50 transition-all">
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                    <button type="button" onClick={showLogin} className="text-sm text-slate-400 hover:text-white pt-2">
                        Back to Login
                    </button>
                </form>
            ) : (
                <>
                    <div className="flex justify-center bg-black/20 rounded-full p-1 mb-6">
                        <button onClick={() => toggleForm(true)} className={`w-1/2 py-2 rounded-full font-semibold transition-colors duration-300 relative ${isLogin ? 'text-white' : 'text-slate-300'}`}>
                            {isLogin && <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full -z-10" />}
                            <span className="relative">Login</span>
                        </button>
                        <button onClick={() => toggleForm(false)} className={`w-1/2 py-2 rounded-full font-semibold transition-colors duration-300 relative ${!isLogin ? 'text-white' : 'text-slate-300'}`}>
                             {!isLogin && <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full -z-10" />}
                            <span className="relative">Sign Up</span>
                        </button>
                    </div>
                    
                    <form onSubmit={handleAuthSubmit} className="space-y-4">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            className="w-full p-3 bg-black/20 rounded-lg text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                            required
                        />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className="w-full p-3 bg-black/20 rounded-lg text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                            required
                        />
                        {error && <p className="text-rose-400 text-sm">{error}</p>}
                        
                        {isLogin && (
                            <div className="text-right">
                                <button type="button" onClick={showForgotPassword} className="text-sm text-slate-400 hover:text-white">
                                    Forgot Password?
                                </button>
                            </div>
                        )}
                        
                        <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-bold rounded-lg hover:opacity-90 disabled:bg-slate-600 disabled:opacity-50 transition-all">
                            {loading ? 'Loading...' : isLogin ? 'Login' : 'Sign Up'}
                        </button>
                    </form>
                </>
            )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(Auth);