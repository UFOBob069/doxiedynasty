'use client';

import { Suspense, useState } from 'react';
import { ArrowLeft, CheckCircle, Gift, Shield, Truck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { DOXIE_DYNASTY } from '@/lib/doxie-product';

function CommerceHeader() {
  return (
    <header className="commerce-header">
      <Link href="/" className="commerce-brand" aria-label="Doxie Dynasty home">
        <Image
          src="/cards/box-side.webp"
          alt="Doxie Dynasty Card Game"
          width={420}
          height={190}
          priority
        />
      </Link>
      <Link href="/" className="commerce-back">
        <ArrowLeft aria-hidden="true" />
        Back to the game
      </Link>
    </header>
  );
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [giftNote, setGiftNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async (event: React.FormEvent) => {
    event.preventDefault();
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

  const formatPrice = (priceInCents: number) => `$${(priceInCents / 100).toFixed(2)}`;

  return (
    <div className="commerce-shell">
      <CommerceHeader />
      <main className="commerce-main">
        <section className="commerce-intro">
          <p className="eyebrow">YOUR DYNASTY AWAITS</p>
          <h1>One more step to the crown.</h1>
          <p>
            Tell us who is ordering, then choose your quantity and U.S. shipping
            details in secure checkout.
          </p>
        </section>

        {searchParams.get('canceled') === '1' && (
          <div className="commerce-alert" role="status">
            Checkout was canceled and no charge was made. Your order is still waiting below.
          </div>
        )}

        <div className="checkout-layout">
          <aside className="checkout-summary-card" aria-labelledby="order-summary-title">
            <div className="checkout-product-image">
              <Image
                src="/box-product-mockup.webp"
                alt="Doxie Dynasty card game box"
                fill
                priority
                sizes="(max-width: 850px) 90vw, 480px"
              />
            </div>
            <p className="eyebrow">ORDER SUMMARY</p>
            <div className="checkout-product-line">
              <div>
                <h2 id="order-summary-title">Doxie Dynasty</h2>
                <p>Card game · 90 cards</p>
              </div>
              <div className="checkout-product-price">
                <strong>{formatPrice(DOXIE_DYNASTY.CURRENT_PRICE)}</strong>
                <span>per deck</span>
              </div>
            </div>
            <div className="checkout-perks">
              <span><Truck aria-hidden="true" /> Free U.S. shipping</span>
              <span><CheckCircle aria-hidden="true" /> 30-day returns</span>
              <span><Gift aria-hidden="true" /> Choose 1–10 decks</span>
            </div>
          </aside>

          <section className="checkout-form-card" aria-labelledby="customer-details-title">
            <p className="eyebrow">CUSTOMER DETAILS</p>
            <h2 id="customer-details-title">Where should we send your crown?</h2>
            <p className="checkout-form-intro">
              We will prefill your details and take you to the final secure checkout step.
            </p>

            <form onSubmit={handleCheckout} className="checkout-form">
              <label className="checkout-field" htmlFor="customer-name">
                <span>Full name</span>
                <input
                  id="customer-name"
                  type="text"
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  placeholder="Your full name"
                  maxLength={DOXIE_DYNASTY.MAX_CUSTOMER_NAME_LENGTH}
                  autoComplete="name"
                  required
                />
              </label>

              <label className="checkout-field" htmlFor="customer-email">
                <span>Email address</span>
                <input
                  id="customer-email"
                  type="email"
                  value={customerEmail}
                  onChange={(event) => setCustomerEmail(event.target.value)}
                  placeholder="you@example.com"
                  maxLength={DOXIE_DYNASTY.MAX_CUSTOMER_EMAIL_LENGTH}
                  autoComplete="email"
                  required
                />
                <small>We will send order updates to this address.</small>
              </label>

              <label className="checkout-field" htmlFor="gift-note">
                <span>Gift note <em>optional</em></span>
                <textarea
                  id="gift-note"
                  value={giftNote}
                  onChange={(event) => setGiftNote(event.target.value)}
                  placeholder="Add a message for the lucky top dog"
                  rows={3}
                  maxLength={DOXIE_DYNASTY.MAX_GIFT_NOTE_LENGTH}
                />
                <small>Up to {DOXIE_DYNASTY.MAX_GIFT_NOTE_LENGTH} characters.</small>
              </label>

              <button type="submit" disabled={isLoading} className="commerce-primary-button">
                {isLoading ? (
                  <>
                    <span className="commerce-spinner" aria-hidden="true" />
                    Preparing checkout…
                  </>
                ) : (
                  <>Continue to checkout <span aria-hidden="true">→</span></>
                )}
              </button>

              <div className="commerce-security">
                <Shield aria-hidden="true" />
                Secure hosted checkout
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="commerce-shell" />}>
      <CheckoutContent />
    </Suspense>
  );
}
