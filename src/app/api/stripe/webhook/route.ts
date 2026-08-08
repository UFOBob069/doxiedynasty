import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  const signature = request.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret || !stripe) {
    return NextResponse.json({ error: 'Stripe webhook is not configured' }, { status: 503 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      await request.text(),
      signature,
      webhookSecret,
    );
  } catch (error) {
    console.error('Stripe webhook verification failed:', error);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    // Stripe Dashboard is the source of truth for the initial manual
    // fulfillment workflow. This verified webhook provides an auditable signal,
    // but intentionally does not create an external order or trigger shipping.
    console.info('Doxie Dynasty Checkout Session received for manual review', {
      sessionId: session.id,
      paymentStatus: session.payment_status,
      amount: session.amount_total,
      currency: session.currency,
      livemode: session.livemode,
    });
  }

  return NextResponse.json({ received: true });
}
