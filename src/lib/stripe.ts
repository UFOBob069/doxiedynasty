import 'server-only';

import Stripe from 'stripe';

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-06-30.basil',
    })
  : null;

if (typeof window === 'undefined' && !process.env.STRIPE_SECRET_KEY) {
  console.warn('Stripe secret key not found in environment variables.');
}

export const STRIPE_CONFIG = {
  PRICE_ID: process.env.STRIPE_DOXIE_DYNASTY_PRICE_ID || '',
};

export function getAppOrigin() {
  const value = process.env.APP_URL?.trim();

  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return null;
    }

    return url.origin;
  } catch {
    return null;
  }
}
