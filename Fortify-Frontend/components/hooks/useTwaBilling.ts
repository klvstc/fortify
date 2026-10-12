import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { type PlayBillingState, type AppState } from '../../types';
import { type ItemDetails, SKUS, type PlayBillingPaymentResponse } from './twa-billing.types';

// This is a mock of the global firebase object provided by the Firebase SDK scripts.
declare const firebase: any;

const getBillingErrorText = (e: any, context: 'fetch' | 'purchase' | 'restore'): string => {
    // Log the raw error for debugging purposes in development
    console.error(`Billing error in context '${context}':`, e);

    // Specific JS/Browser Errors
    if (e.name === 'AbortError' || e.message?.toLowerCase().includes('cancelled')) {
        return 'The purchase process was cancelled by the user.';
    }
    if (e.name === 'NotSupportedError') {
        return "In-app payments are not supported on this device or browser. Please ensure you are using the app installed from the Google Play Store and have an active Google account.";
    }

    // Firebase Functions HttpsError
    if (e.code?.startsWith('functions/')) {
        const code = e.code.replace('functions/', '');
        // The backend messages are user-friendly, but we can add context.
        switch (code) {
            case 'unauthenticated':
                return `Authentication error: ${e.message} Please try logging out and back in.`;
            case 'invalid-argument':
                return `Invalid data was sent from the app. If this persists, please contact support. Details: ${e.message}`;
            case 'not-found':
                return e.message; // The backend message is already very detailed for restores.
            case 'failed-precondition':
                return `Purchase precondition failed: ${e.message}`;
            case 'internal':
                return `An internal server error occurred while verifying your purchase. Please try again in a few moments. Details: ${e.message}`;
            case 'unknown':
                 return `An unknown server error occurred. Please check your internet connection and try again. Details: ${e.message}`;
            default:
                return `An unexpected server error occurred (${code}). Please try again. Details: ${e.message}`;
        }
    }

    // Generic JS Errors with some detail
    if (e.message) {
        if (e.message.toLowerCase().includes('network request failed')) {
            return 'A network error occurred. Please check your internet connection and try again.';
        }
        // For other JS errors, just return the message directly as it's often descriptive.
        return e.message;
    }

    // Fallback for when there's no useful error info
    switch (context) {
        case 'fetch':
            const debugInfo = e ? `(Debug: ${JSON.stringify(e)})` : '';
            return `Could not load subscription plans. This can happen if there's a connection issue with the Google Play Store, or if billing is not set up correctly for this app. Please check your internet connection and try again. ${debugInfo}`;
        case 'purchase':
            return 'Your purchase could not be completed. No charge was made. Please try again.';
        case 'restore':
            return 'Could not restore purchases. Please check your connection and try again.';
        default:
            return 'An unexpected error occurred. Please try again later.';
    }
};

export const useTwaBilling = () => {
    const { appState, setAppState } = useAuth();
    const { playBilling: playBillingState } = appState;

    const [plans, setPlans] = useState<ItemDetails[]>([]);
    const [isPurchaseLoading, setIsPurchaseLoading] = useState(false);
    const [isRestoreLoading, setIsRestoreLoading] = useState(false);
    const [isFetchingPlans, setIsFetchingPlans] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [billingUnavailable, setBillingUnavailable] = useState(false);
    const hasAttemptedAutoRestore = useRef(false);
    const operationInProgress = useRef<'purchase' | 'restore' | null>(null); // Ref for stable listener context

    const isSubscribed = playBillingState?.hasActiveSubscription ?? false;

    const verifyAndCompletePurchase = useCallback(async (sku: string, token: string) => {
        const verifyPurchase = firebase.functions().httpsCallable('verifyPlayPurchase');
        const verificationResult = await verifyPurchase({ productId: sku, token: token });

        if (verificationResult.data.success) {
            const newPlayBillingState: PlayBillingState = {
                hasActiveSubscription: true,
                subscriptionExpiryDate: verificationResult.data.subscriptionEndDate,
                subscriptionId: sku,
                lastPurchaseToken: token,
            };
            setAppState({ playBilling: newPlayBillingState });
            setError(null);
        } else {
            throw new Error(verificationResult.data.reason || 'Purchase verification failed. Please restore purchases or contact support.');
        }
    }, [setAppState]);

    const runRestoreSequence = useCallback(async () => {
        if (typeof getDigitalGoodsService === 'undefined') {
          throw new Error("Billing service is not available on this device. Please use the app from the Play Store.");
        }
        const service = await getDigitalGoodsService("https://play.google.com/billing");
        if (!service) {
            throw new Error("Billing service is not available. Please ensure you're using the latest version of the app from the Play Store.");
        }
        
        const allPurchases = await service.listPurchases();
        
        if (!allPurchases || allPurchases.length === 0) {
            throw new Error("No previous purchases found for this Google account.");
        }

        const fortifyPurchases = allPurchases.filter((p: any) => SKUS.includes(p.itemId));

        if (fortifyPurchases.length === 0) {
            throw new Error("No Fortify subscriptions found on this account. If you've subscribed recently, please try again in a few minutes.");
        }

        const purchasesToVerify = fortifyPurchases.map((p: any) => ({
            productId: p.itemId,
            token: p.purchaseToken,
        }));

        const restoreAndVerify = firebase.functions().httpsCallable('restoreAndVerifyPurchases');
        const verificationResult = await restoreAndVerify({ purchases: purchasesToVerify });

        if (verificationResult.data.success) {
            const newPlayBillingState: PlayBillingState = {
              hasActiveSubscription: true,
              subscriptionExpiryDate: verificationResult.data.subscriptionEndDate,
              subscriptionId: verificationResult.data.subscriptionId,
              lastPurchaseToken: verificationResult.data.purchaseToken,
            };
            setAppState({ playBilling: newPlayBillingState });
        } else {
            throw new Error('Failed to find an active subscription among your purchases.');
        }
    }, [setAppState]);

    const handleRestorePurchases = useCallback(async (isSilent = false) => {
        if (!isSilent) {
          setError(null);
          setIsRestoreLoading(true);
          operationInProgress.current = 'restore';
        }

        if (window.AndroidBilling && typeof window.AndroidBilling.restorePurchases === 'function') {
            try {
                window.AndroidBilling.restorePurchases();
                return; // Rely on listener to reset loading state
            } catch (e: any) {
                if (!isSilent) {
                    setError(getBillingErrorText(e, 'restore'));
                    setIsRestoreLoading(false);
                    operationInProgress.current = null;
                }
                return;
            }
        }

        try {
          await runRestoreSequence();
        } catch (e: any) {
          if (!isSilent) {
            setError(getBillingErrorText(e, 'restore'));
          }
          throw e; 
        } finally {
          if (!isSilent) {
            setIsRestoreLoading(false);
            operationInProgress.current = null;
          }
        }
    }, [runRestoreSequence]);

    useEffect(() => {
        if (isSubscribed || plans.length > 0) {
          setIsFetchingPlans(false);
          return;
        }

        let isMounted = true;
        const initBilling = async () => {
          setIsFetchingPlans(true);
          setError(null);

          if (typeof getDigitalGoodsService === 'undefined') {
            await new Promise(resolve => setTimeout(resolve, 1500));
            if (typeof getDigitalGoodsService === 'undefined' && isMounted) {
                setBillingUnavailable(true);
                setIsFetchingPlans(false);
                return;
            }
          }

          try {
            const service = await getDigitalGoodsService("https://play.google.com/billing");
            if (!service) {
              throw new Error("Billing service not supported on this device.");
            }
            
            const details = await service.getDetails(SKUS);
            if (!isMounted) return;

            if (details && details.length > 0) {
              details.sort((a: any, b: any) => (a.itemId.includes('yearly') ? 1 : -1));
              setPlans(details);
            } else {
              throw new Error('Could not find any active subscription plans to display.');
            }
          } catch (e: any) {
            if (isMounted) {
              setError(getBillingErrorText(e, 'fetch'));
              setBillingUnavailable(true);
            }
          } finally {
            if (isMounted) {
              setIsFetchingPlans(false);
            }
          }
        };

        initBilling();

        return () => { isMounted = false; };
    }, [isSubscribed, plans.length]);

    useEffect(() => {
        const autoRestore = async () => {
            if (isSubscribed || hasAttemptedAutoRestore.current || typeof getDigitalGoodsService === 'undefined') {
                return;
            }
            hasAttemptedAutoRestore.current = true;
            try {
                await runRestoreSequence();
            } catch (e) { /* Fail silently */ }
        };
        const timer = setTimeout(autoRestore, 500);
        return () => clearTimeout(timer);
    }, [isSubscribed, runRestoreSequence]);

    const handleSubscribe = async (sku: string) => {
        setError(null);
        setIsPurchaseLoading(true);
        operationInProgress.current = 'purchase';

        if (window.AndroidBilling && typeof window.AndroidBilling.purchase === 'function') {
            try {
                window.AndroidBilling.purchase(sku);
                // The loading state will be reset in the message listener
            } catch (e: any) {
                setError(getBillingErrorText(e, 'purchase'));
                setIsPurchaseLoading(false);
                operationInProgress.current = null;
            }
        } else {
            try {
                const service = await getDigitalGoodsService("https://play.google.com/billing");
                if (!service) throw new Error("Billing service is not available. Please ensure you're using the app from the Play Store.");
                
                const planDetails = plans.find(p => p.itemId === sku);
                if (!planDetails) throw new Error(`Details for SKU ${sku} not found.`);

                const paymentMethods = [{ supportedMethods: "https://play.google.com/billing", data: { sku: planDetails.itemId } }];
                const paymentDetails = { total: { label: `Total`, amount: { currency: planDetails.price.currency, value: planDetails.price.value } } };
                const request = new PaymentRequest(paymentMethods, paymentDetails);
                const paymentResponse = await request.show() as PlayBillingPaymentResponse;
                
                const { purchaseToken } = paymentResponse.details;
                await verifyAndCompletePurchase(sku, purchaseToken);
                await paymentResponse.complete('success');
            } catch (e: any) {
                if (e.name === 'AbortError' || e.message?.toLowerCase().includes('cancelled')) {
                    // Don't show an error if user just cancels. Try a silent restore in case they already bought.
                    try { await handleRestorePurchases(true); } catch (restoreError) {
                        // If silent restore fails, then show original cancel error.
                        setError(getBillingErrorText(e, 'purchase'));
                    }
                } else {
                    setError(getBillingErrorText(e, 'purchase'));
                }
            } finally {
                setIsPurchaseLoading(false);
                operationInProgress.current = null;
            }
        }
    };
    
    useEffect(() => {
        const messageListener = async (event: MessageEvent) => {
            if (event.data?.type === 'PURCHASE_UPDATE_FROM_NATIVE') {
                const data = event.data.data;
                const context = operationInProgress.current || (data.status === 'not_found' ? 'restore' : 'purchase');
                
                setError(null);
                try {
                    switch (data.status) {
                        case 'success':
                            if (data.sku && data.purchaseToken) {
                                await verifyAndCompletePurchase(data.sku, data.purchaseToken);
                            } else {
                                throw new Error("Purchase success message from native host is missing required details.");
                            }
                            break;
                        case 'canceled':
                            setError("Purchase was canceled.");
                            break;
                        case 'failed':
                            throw new Error(data.error || "An unknown purchase error occurred on the device.");
                        case 'not_found':
                             setError("No previous purchases were found to restore.");
                            break;
                    }
                } catch (e: any) {
                    setError(getBillingErrorText(e, context));
                } finally {
                    // Always reset loading states after processing a message
                    setIsPurchaseLoading(false);
                    setIsRestoreLoading(false);
                    operationInProgress.current = null;
                }
            }
        };

        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', messageListener);
        }

        return () => {
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.removeEventListener('message', messageListener);
          }
        };
    }, [verifyAndCompletePurchase]);


    return {
        plans,
        isPurchaseLoading,
        isRestoreLoading,
        isFetchingPlans,
        error,
        billingUnavailable,
        isSubscribed,
        subscriptionEndDate: playBillingState?.subscriptionExpiryDate ?? null,
        handleSubscribe,
        handleRestorePurchases,
    };
};