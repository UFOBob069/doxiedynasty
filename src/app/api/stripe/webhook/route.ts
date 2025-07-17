import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '../../../../lib/stripe';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');
  console.log('Webhook received with signature:', signature ? 'Present' : 'Missing');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe is not initialized' }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // You can add your event handling logic here
  console.log('Webhook event received:', event.type);

  return NextResponse.json({ received: true });
} 