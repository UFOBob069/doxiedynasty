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

// Doxie Dynasty card game pricing configuration
export const DOXIE_DYNASTY_PRICING = {
  ORIGINAL_PRICE: 3499, // $34.99 in cents
  CURRENT_PRICE: 2499, // $24.99 in cents
  FREE_SHIPPING: true,
  SHIPPING_DAYS: '5-7',
};

// Stripe product and price IDs for Doxie Dynasty card game
export const STRIPE_CONFIG = {
  PRICE_ID: process.env.STRIPE_DOXIE_DYNASTY_PRICE_ID || '',
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
