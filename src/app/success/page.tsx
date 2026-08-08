import Image from 'next/image';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, CheckCircle, Home, Package } from 'lucide-react';
import { DOXIE_DYNASTY } from '@/lib/doxie-product';
import { stripe, STRIPE_CONFIG } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

type SuccessPageProps = {
  searchParams: Promise<{ session_id?: string | string[] }>;
};

type OrderConfirmation = {
  email: string;
  location: string;
  name: string;
  quantity: number;
  reference: string;
  total: string;
};

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

function formatTotal(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

async function getOrderConfirmation(sessionId: string): Promise<OrderConfirmation | null> {
  if (!stripe || !STRIPE_CONFIG.PRICE_ID || !sessionId.startsWith('cs_') || sessionId.length > 255) {
    return null;
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items'],
    });

    if (session.status !== 'complete' || session.payment_status !== 'paid') {
      return null;
    }

    const lineItems = session.line_items?.data ?? [];
    const productItems = lineItems.filter((item) => item.price?.id === STRIPE_CONFIG.PRICE_ID);
    const quantity = productItems.reduce((total, item) => total + (item.quantity ?? 0), 0);
    const shipping = session.collected_information?.shipping_details;
    const email = session.customer_details?.email ?? session.customer_email;

    if (
      productItems.length !== 1 ||
      quantity < DOXIE_DYNASTY.MIN_QUANTITY ||
      quantity > DOXIE_DYNASTY.MAX_QUANTITY ||
      !shipping ||
      shipping.address.country !== 'US' ||
      !email ||
      session.amount_total === null ||
      !session.currency
    ) {
      return null;
    }

    const location = [shipping.address.city, shipping.address.state]
      .filter(Boolean)
      .join(', ');

    return {
      email,
      location,
      name: shipping.name,
      quantity,
      reference: session.id,
      total: formatTotal(session.amount_total, session.currency),
    };
  } catch (error) {
    console.error('Unable to verify Checkout Session:', error);
    return null;
  }
}

function VerificationError() {
  return (
    <div className="commerce-shell">
      <CommerceHeader />
      <main className="confirmation-main">
        <section className="confirmation-card confirmation-error">
          <div className="confirmation-icon confirmation-icon-error">
            <AlertCircle aria-hidden="true" />
          </div>
          <p className="eyebrow">ORDER CHECK</p>
          <h1>We could not verify this order.</h1>
          <p className="confirmation-lede">
            This page only confirms completed payments. If you believe your order went through,
            contact us and include the checkout reference from your receipt.
          </p>
          <div className="confirmation-actions">
            <Link href="/checkout" className="commerce-primary-link">
              Return to checkout
            </Link>
            <Link href="/" className="commerce-secondary-link">
              Back to the game
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams;
  const sessionId = typeof params.session_id === 'string' ? params.session_id : '';
  const order = await getOrderConfirmation(sessionId);

  if (!order) {
    return <VerificationError />;
  }

  return (
    <div className="commerce-shell">
      <CommerceHeader />
      <main className="confirmation-main">
        <section className="confirmation-card">
          <div className="confirmation-celebration">
            <div className="confirmation-icon">
              <CheckCircle aria-hidden="true" />
            </div>
            <span className="confirmation-crown" aria-hidden="true">♛</span>
            <p className="eyebrow">PAYMENT CONFIRMED</p>
            <h1>You are officially top dog.</h1>
            <p className="confirmation-lede">
              Thank you, {order.name}. Your Doxie Dynasty order is in the pack.
            </p>
          </div>

          <div className="confirmation-grid">
            <div className="confirmation-product">
              <div className="confirmation-product-image">
                <Image
                  src="/box-product-mockup.webp"
                  alt="Doxie Dynasty card game box"
                  fill
                  priority
                  sizes="(max-width: 700px) 82vw, 340px"
                />
              </div>
              <div>
                <span>Doxie Dynasty</span>
                <strong>{order.quantity} {order.quantity === 1 ? 'deck' : 'decks'}</strong>
              </div>
            </div>

            <dl className="confirmation-details">
              <div>
                <dt>Paid</dt>
                <dd>{order.total}</dd>
              </div>
              <div>
                <dt>Ship to</dt>
                <dd>{order.location || 'U.S. address'}</dd>
              </div>
              <div>
                <dt>Order updates</dt>
                <dd>{order.email}</dd>
              </div>
            </dl>
          </div>

          <div className="confirmation-next">
            <Package aria-hidden="true" />
            <div>
              <h2>What happens next?</h2>
              <p>We will review your paid order and prepare it for shipment.</p>
              <p>Free U.S. shipping is estimated at {DOXIE_DYNASTY.SHIPPING_DAYS} business days.</p>
              <p>Returns are accepted within {DOXIE_DYNASTY.RETURN_DAYS} days of delivery.</p>
            </div>
          </div>

          <p className="confirmation-reference">Checkout reference: {order.reference}</p>

          <Link href="/" className="commerce-primary-link confirmation-home-link">
            <Home aria-hidden="true" />
            Back to the game
          </Link>
        </section>
      </main>
    </div>
  );
}
