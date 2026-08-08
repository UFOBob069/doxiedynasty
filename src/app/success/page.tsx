import Link from 'next/link';
import { AlertCircle, CheckCircle, Home, Package } from 'lucide-react';
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
    console.error('Unable to verify Stripe Checkout Session:', error);
    return null;
  }
}

function VerificationError() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
      <div className="mx-auto max-w-2xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-orange-100">
            <AlertCircle className="h-10 w-10 text-orange-600" />
          </div>
          <h1 className="mb-4 text-3xl font-bold text-gray-900">We couldn&apos;t verify this order</h1>
          <p className="mb-8 text-gray-600">
            This page only confirms completed Stripe payments. If you believe your payment succeeded,
            contact us and include the Checkout reference from Stripe.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/checkout"
              className="rounded-full bg-orange-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-orange-600"
            >
              Return to checkout
            </Link>
            <Link
              href="/"
              className="rounded-full border border-orange-300 px-6 py-3 font-semibold text-orange-700 transition-colors hover:bg-orange-50"
            >
              Back to home
            </Link>
          </div>
        </div>
      </div>
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
      <div className="mx-auto max-w-2xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>

          <h1 className="mb-4 text-4xl font-bold text-gray-900">Payment confirmed!</h1>
          <p className="mb-8 text-xl text-gray-600">
            Thank you, {order.name}. Stripe has confirmed your Doxie Dynasty order.
          </p>

          <dl className="mb-8 grid gap-4 rounded-lg bg-orange-50 p-6 text-left sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Quantity</dt>
              <dd className="font-semibold text-gray-900">
                {order.quantity} {order.quantity === 1 ? 'deck' : 'decks'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Paid</dt>
              <dd className="font-semibold text-gray-900">{order.total}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="break-all font-semibold text-gray-900">{order.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Ship to</dt>
              <dd className="font-semibold text-gray-900">{order.location || 'U.S. address'}</dd>
            </div>
          </dl>

          <div className="mb-8 rounded-lg border border-orange-100 p-6 text-left">
            <div className="mb-4 flex items-center gap-3">
              <Package className="h-6 w-6 text-orange-600" />
              <h2 className="text-lg font-semibold text-gray-900">What happens next?</h2>
            </div>
            <div className="space-y-2 text-gray-700">
              <p>The Doxie Dynasty team will review the paid order in Stripe and prepare it manually.</p>
              <p>Free U.S. shipping is estimated at {DOXIE_DYNASTY.SHIPPING_DAYS} business days.</p>
              <p>Returns are accepted within {DOXIE_DYNASTY.RETURN_DAYS} days of delivery.</p>
              <p>Order updates will be sent to {order.email}.</p>
            </div>
          </div>

          <p className="mb-8 break-all text-xs text-gray-500">Stripe reference: {order.reference}</p>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-orange-600"
          >
            <Home className="h-5 w-5" />
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
