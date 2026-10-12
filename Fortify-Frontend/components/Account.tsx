  import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTwaBilling } from './hooks/useTwaBilling';
import { SKUS } from './hooks/twa-billing.types';
import { WarningIcon } from '../constants';

const playStoreUrl = 'https://play.google.com/store/apps/details?id=app.fortify.twa';

interface AccountProps {
  pitch: string | null;
  isTrialActive: boolean;
  trialDaysLeft: number;
  logout: () => void;
  hasClaimedRatingReward: boolean;
  onVerifyScreenshot: (file: File) => Promise<void>;
  isVerifyingScreenshot: boolean;
  screenshotVerificationResult: { success: boolean; message: string } | null;
}

const TrialExtensionOffer: React.FC<{
    onVerify: (file: File) => void;
    isVerifying: boolean;
    verificationResult: { success: boolean; message: string } | null;
    playStoreUrl: string;
}> = ({ onVerify, isVerifying, verificationResult, playStoreUrl }) => {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!file) {
            setPreview(null);
            return;
        }
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [file]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFile = e.target.files[0];
            if (selectedFile.size > 4 * 1024 * 1024) { // 4MB limit
                alert("File is too large. Please upload an image under 4MB.");
                return;
            }
            setFile(selectedFile);
        }
    };

    const handleSubmit = () => {
        if (file) {
            onVerify(file);
        }
    };

    if (verificationResult?.success) {
        return (
            <div className="glass-panel rounded-2xl p-6 text-center border-2 border-emerald-500/50">
                <h4 className="text-md font-semibold text-white mb-2 text-center">Thank You!</h4>
                <p className="text-emerald-400">Your trial has been extended by 14 days. We appreciate your support!</p>
            </div>
        );
    }

    return (
        <div className="glass-panel rounded-2xl p-6 border-2 border-amber-500/50">
            <h4 className="text-md font-semibold text-white mb-2 text-center">Get 14 Extra Trial Days!</h4>
            <p className="text-sm text-slate-300 text-center mb-4">Support Fortify with a 5-star rating on the Play Store and we'll extend your trial by two weeks.</p>
            
            <a href={playStoreUrl} target="_blank" rel="noopener noreferrer" className="block text-center w-full py-2 mb-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors">
                Rate on Play Store
            </a>
            
            <div className="space-y-4">
                <input type="file" accept="image/png, image/jpeg, image/webp" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} className="w-full py-2 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors">
                    {file ? `Selected: ${file.name}` : '1. Upload Screenshot'}
                </button>

                {preview && <img src={preview} alt="Screenshot preview" className="rounded-lg max-h-48 mx-auto" />}

                <button onClick={handleSubmit} disabled={!file || isVerifying} className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-lg disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors">
                    {isVerifying ? 'Verifying...' : '2. Claim Reward'}
                </button>

                {verificationResult && !verificationResult.success && (
                    <p className="text-rose-400 text-sm text-center">{verificationResult.message}</p>
                )}
            </div>
        </div>
    );
};

const Account: React.FC<AccountProps> = ({
  pitch,
  isTrialActive,
  trialDaysLeft,
  logout,
  hasClaimedRatingReward,
  onVerifyScreenshot,
  isVerifyingScreenshot,
  screenshotVerificationResult,
}) => {
  const { user } = useAuth();
  const {
      plans,
      isPurchaseLoading,
      isRestoreLoading,
      isFetchingPlans,
      error,
      billingUnavailable,
      isSubscribed,
      subscriptionEndDate,
      handleSubscribe,
      handleRestorePurchases,
  } = useTwaBilling();

  const isAppLocked = !isTrialActive && !isSubscribed;

  return (
    <div className="w-full flex flex-col gap-6 text-left" style={{ animation: 'fade-in 0.5s ease-out' }}>
      <div className="glass-panel rounded-2xl p-6 text-center">
        <h3 className="text-lg font-semibold text-white">Your Account</h3>
        {user?.email && <p className="text-sm text-slate-400 mt-1">{user.email}</p>}
      </div>

      {isSubscribed ? (
        <div className="glass-panel rounded-2xl p-6">
          <h4 className="text-md font-semibold text-white mb-4 text-center">Subscription Status</h4>
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-400">Fortify Pro Active</p>
            {subscriptionEndDate && (
              <p className="text-slate-300 text-sm mt-1">
                Renews on {new Date(subscriptionEndDate).toLocaleDateString()}
              </p>
            )}
          </div>
          <a
            href={`https://play.google.com/store/account/subscriptions?package=app.fortify.twa`}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center w-full max-w-sm mx-auto mt-4 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors"
          >
            Manage Subscription
          </a>
        </div>
      ) : (
        <>
          {isAppLocked && (
            <div className="glass-panel rounded-2xl p-6 min-h-[6rem] flex items-center justify-center">
              <p className="text-lg text-amber-200/90 italic text-center">
                {pitch || 'Your trial has ended. Subscribe to continue your journey.'}
              </p>
            </div>
          )}

          <div className="glass-panel rounded-2xl p-6">
            <h4 className="text-md font-semibold text-white mb-4 text-center">Trial Status</h4>
            {isTrialActive ? (
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-400">Free Trial Active</p>
                <p className="text-slate-300 text-sm mt-1">
                  You have <span className="font-bold">{trialDaysLeft}</span> {trialDaysLeft === 1 ? 'day' : 'days'} remaining.
                </p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-2xl font-bold text-rose-400">Trial Ended</p>
              </div>
            )}
          </div>

          {!hasClaimedRatingReward && isTrialActive && (
            <TrialExtensionOffer
              playStoreUrl={playStoreUrl}
              onVerify={onVerifyScreenshot}
              isVerifying={isVerifyingScreenshot}
              verificationResult={screenshotVerificationResult}
            />
          )}

          <div className="glass-panel rounded-2xl p-6">
            <h4 className="text-lg font-bold text-white mb-2 text-center">Unlock Fortify Pro</h4>
            <p className="text-sm text-slate-300 text-center mb-6">Gain unlimited access to all features and secure your progress.</p>
            
            {isFetchingPlans || ((isPurchaseLoading || isRestoreLoading) && !error) ? (
                <div className="w-full py-4 bg-slate-700 text-white font-bold rounded-lg text-center animate-pulse">
                    {isPurchaseLoading ? 'Processing...' : isRestoreLoading ? 'Restoring...' : 'Loading Plans...'}
                </div>
            ) : billingUnavailable ? (
                <div className="space-y-4">
                    <div className="text-center text-amber-300 bg-amber-900/50 border border-amber-800 p-4 rounded-lg">
                        <p className="font-semibold">In-App Purchases Unavailable</p>
                        <p className="text-sm text-amber-200/80 mt-1">
                            Could not connect to the Google Play billing service. This may be because you are not using the app from the Play Store, your browser does not support digital payments, or there's a connection issue.
                        </p>
                    </div>
                    <a
                        href={`${playStoreUrl}&sku=fortify_subscription&launch=true`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-center w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-colors"
                    >
                        1. Subscribe on Play Store
                    </a>
                    <button
                        onClick={() => handleRestorePurchases(false)}
                        disabled={isPurchaseLoading || isRestoreLoading}
                        className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isRestoreLoading ? 'Restoring...' : '2. Restore Purchase'}
                    </button>
                    <p className="text-xs text-slate-400 mt-2 text-center">After subscribing, return here and tap 'Restore Purchase' to activate your subscription.</p>
                </div>
            ) : plans.length > 0 ? (
                <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 md:gap-6">
                    {plans.map(plan => {
                        const isBestValue = plan.itemId.includes('yearly');
                        const title = isBestValue ? "Yearly Subscription" : "Monthly Subscription";
                        const description = isBestValue ? "Billed once per year" : "Billed once per month";
                        const formattedPrice = new Intl.NumberFormat(undefined, {
                            style: 'currency',
                            currency: plan.price.currency,
                        }).format(parseFloat(plan.price.value));

                        return (
                            <div key={plan.itemId} className={`glass-panel p-6 rounded-2xl border-2 flex flex-col ${isBestValue ? 'border-amber-500' : 'border-transparent'}`}>
                                {isBestValue && (
                                    <div className="text-center mb-4">
                                        <span className="bg-amber-500 text-black font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">Best Value</span>
                                    </div>
                                )}
                                <h3 className="text-2xl font-bold text-white text-center">{title}</h3>
                                <p className="text-4xl font-bold text-white text-center my-4">{formattedPrice}</p>
                                <p className="text-slate-400 text-center text-sm mb-6 flex-grow">{description}</p>
                                <button
                                    onClick={() => handleSubscribe(plan.itemId)}
                                    disabled={isPurchaseLoading || isRestoreLoading}
                                    className={`w-full py-3 font-bold rounded-lg transition-colors ${
                                        isBestValue
                                        ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:opacity-90 text-black'
                                        : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 text-white'
                                    } disabled:bg-slate-600 disabled:cursor-not-allowed`}
                                >
                                    {isPurchaseLoading ? 'Processing...' : 'Choose Plan'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            ) : (
                 <div className="text-center text-amber-300 bg-amber-900/50 border border-amber-800 p-4 rounded-lg">
                    <p className="font-semibold">Could not load subscription plans.</p>
                 </div>
            )}
            {error && (
              <div className="mt-4 bg-rose-900/50 border border-rose-700 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <WarningIcon className="w-5 h-5 text-rose-300" />
                    <p className="font-semibold text-rose-300">An Error Occurred</p>
                </div>
                <p className="text-sm text-rose-200/80">{error}</p>
              </div>
            )}
          </div>
        </>
      )}

      <div className="glass-panel rounded-2xl p-6">
        <h4 className="text-md font-semibold text-white mb-4 text-center">Account Actions</h4>
        <div className="w-full max-w-sm mx-auto flex flex-col gap-3">
            {!isSubscribed && (
              <button
                onClick={() => handleRestorePurchases(false)}
                disabled={isPurchaseLoading || isRestoreLoading}
                className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRestoreLoading ? 'Restoring...' : 'Restore Purchases'}
              </button>
            )}
            <button
              onClick={logout}
              className="w-full py-3 bg-gradient-to-r from-rose-700 to-red-800 hover:opacity-90 text-white font-semibold rounded-lg transition-colors"
            >
              Logout
            </button>
        </div>
      </div>

      <style>{`
        @keyframes fade-in { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default React.memo(Account);