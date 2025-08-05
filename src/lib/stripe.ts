import Stripe from 'stripe';

// Server-side Stripe instance
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-06-30.basil',
    })
  : null;

// Server-side environment variable check
if (typeof window === 'undefined' && !process.env.STRIPE_SECRET_KEY) {
  console.warn('Stripe secret key not found in environment variables.');
}

// Client-side Stripe instance
export const getStripe = async () => {
  if (typeof window !== 'undefined') {
    try {
      const { loadStripe } = await import('@stripe/stripe-js');
      const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
      
      console.log('Stripe publishable key check:', {
        hasKey: !!publishableKey,
        keyPrefix: publishableKey ? publishableKey.substring(0, 7) : 'none',
        isLive: publishableKey?.startsWith('pk_live_'),
        isTest: publishableKey?.startsWith('pk_test_')
      });
      
      if (!publishableKey) {
        console.warn('Stripe publishable key not found in environment variables.');
        return null;
      }
      
      const stripe = await loadStripe(publishableKey);
      console.log('Stripe loaded successfully:', !!stripe);
      return stripe;
    } catch (error) {
      console.error('Error loading Stripe:', error);
      return null;
    }
  }
  return null;
};

// Doxie Dynasty card game pricing configuration
export const DOXIE_DYNASTY_PRICING = {
  ORIGINAL_PRICE: 3499, // $34.99 in cents
  CURRENT_PRICE: 2499, // $24.99 in cents
  FREE_SHIPPING: true,
  SHIPPING_DAYS: '5-7',
};

// Stripe product and price IDs for Doxie Dynasty card game
export const STRIPE_CONFIG = {
  PRODUCT_ID: process.env.STRIPE_DOXIE_DYNASTY_PRODUCT_ID || 'prod_xxx', // Replace with your Doxie Dynasty product ID
  PRICE_ID: process.env.STRIPE_DOXIE_DYNASTY_PRICE_ID || 'price_xxx', // Replace with your Doxie Dynasty price ID
};

// Order interface for Doxie Dynasty
export interface DoxieDynastyOrder {
  id: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  amount: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered';
  createdAt: Date;
  updatedAt: Date;
} 