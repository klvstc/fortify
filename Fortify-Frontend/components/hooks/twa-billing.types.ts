import { type PlayBillingState } from '../../types';

// Injected by the native Android wrapper
export interface AndroidBillingInterface {
  purchase: (sku: string) => void;
  restorePurchases: () => void;
}

declare global {
  interface Window {
    AndroidBilling?: AndroidBillingInterface;
  }
  // For TWA Digital Goods API
  const getDigitalGoodsService: any;
}

// Sent from native wrapper via postMessage
export type PurchaseUpdateData = 
  | { status: 'success'; sku: string; purchaseToken: string } 
  | { status: 'failed'; error: string } 
  | { status: 'canceled' }
  | { status: 'not_found' }; // for restores

// For Digital Goods API fallback
export interface PlayBillingPaymentResponse extends PaymentResponse {
    details: {
        purchaseToken: string;
    }
}

export interface ItemDetails {
    itemId: string;
    title: string;
    description: string;
    price: {
      currency: string;
      value: string;
    };
}

export const SKUS = ['fortify_subscription', 'fortify_subscription_yearly'];
