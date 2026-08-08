'use client';

import { Suspense, useState } from 'react';
import { 
  Heart, 
  Truck, 
  Shield, 
  CheckCircle, 
  Gift,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { DOXIE_DYNASTY } from '@/lib/doxie-product';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [giftNote, setGiftNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedName = customerName.trim();
    const normalizedEmail = customerEmail.trim();
    const normalizedGiftNote = giftNote.trim();

    if (!normalizedName || !normalizedEmail) {
      alert('Please fill in your name and email');
      return;
    }

    if (normalizedGiftNote.length > DOXIE_DYNASTY.MAX_GIFT_NOTE_LENGTH) {
      alert(`Gift notes are limited to ${DOXIE_DYNASTY.MAX_GIFT_NOTE_LENGTH} characters.`);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: normalizedName,
          customerEmail: normalizedEmail,
          giftNote: normalizedGiftNote,
        }),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();
      if (!url) {
        throw new Error('Stripe did not return a checkout URL');
      }
      window.location.assign(url);
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (priceInCents: number) => {
    return `$${(priceInCents / 100).toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-orange-600">
                🐕 Doxie Dynasty
              </Link>
            </div>
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Complete Your Order
            </h1>
            <p className="text-xl text-gray-600">
              You&apos;re just a few steps away from your Doxie Dynasty card game!
            </p>
          </div>

          {searchParams.get('canceled') === '1' && (
            <div className="mb-8 rounded-lg border border-orange-200 bg-orange-50 p-4 text-center text-gray-700">
              Checkout was canceled and you were not charged. Your order is still available below.
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Order Summary */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-gray-900">Doxie Dynasty Card Game</h3>
                    <p className="text-sm text-gray-600">Limited First Print Run</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-orange-600">
                      {formatPrice(DOXIE_DYNASTY.CURRENT_PRICE)}
                    </div>
                    <div className="text-sm text-gray-500 line-through">
                      {formatPrice(DOXIE_DYNASTY.ORIGINAL_PRICE)}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-green-600">
                  <span className="font-semibold">Shipping</span>
                  <span className="font-semibold">FREE</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>Per deck</span>
                  <span className="text-orange-600">
                    {formatPrice(DOXIE_DYNASTY.CURRENT_PRICE)}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Choose 1–10 decks in secure Stripe Checkout.
                </p>
              </div>

              <div className="mt-6 p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <Heart className="w-5 h-5 text-orange-600" />
                  <span>10% of your purchase supports dachshund rescue organizations</span>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  <span>Free U.S. Shipping</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>30-Day Returns</span>
                </div>
              </div>
            </div>

            {/* Checkout Form */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Information</h2>
              
              <form onSubmit={handleCheckout} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Your full name"
                    maxLength={DOXIE_DYNASTY.MAX_CUSTOMER_NAME_LENGTH}
                    autoComplete="name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="your@email.com"
                    maxLength={DOXIE_DYNASTY.MAX_CUSTOMER_EMAIL_LENGTH}
                    autoComplete="email"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    We&apos;ll use this address for manual order updates.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gift Note (Optional)
                  </label>
                  <textarea
                    value={giftNote}
                    onChange={(e) => setGiftNote(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Add a personal message if this is a gift"
                    rows={3}
                    maxLength={DOXIE_DYNASTY.MAX_GIFT_NOTE_LENGTH}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Up to {DOXIE_DYNASTY.MAX_GIFT_NOTE_LENGTH} characters.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white text-xl py-4 rounded-lg font-bold transition-colors shadow-lg hover:shadow-xl"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </div>
                  ) : (
                    'Proceed to Secure Checkout'
                  )}
                </button>

                <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    <span>SSL Secure</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4" />
                    <span>Perfect Gift</span>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50" />}>
      <CheckoutContent />
    </Suspense>
  );
}
