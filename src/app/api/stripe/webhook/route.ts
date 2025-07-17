import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '../../../../lib/stripe';
import { db } from '../../../../firebase';
import { doc, setDoc } from 'firebase/firestore';
import Stripe from 'stripe';

type WebhookInvoice = Stripe.Invoice & { subscription?: string };

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  console.log('Webhook received with signature:', signature ? 'Present :Missing');

  let event;

  try {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('Stripe webhook secret not found');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }
    
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    
    console.log('Webhook event received:', event.type);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    console.log('Processing webhook event type:', event.type);
    
    switch (event.type) {
      case 'checkout.session.completed':
        console.log('Handling checkout.session.completed');
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      
      case 'customer.subscription.created':
        console.log('Handling customer.subscription.created');
        await handleSubscriptionCreated(event.data.object);
        break;
      
      case 'customer.subscription.updated':
        console.log('Handling customer.subscription.updated');
        await handleSubscriptionUpdated(event.data.object);
        break;
      
      case 'customer.subscription.deleted':
        console.log('Handling customer.subscription.deleted');
        await handleSubscriptionDeleted(event.data.object);
        break;
      
      case 'invoice.payment_succeeded':
        console.log('Handling invoice.payment_succeeded');
        await handlePaymentSucceeded(event.data.object);
        break;
      
      case 'invoice.payment_failed':
        console.log('Handling invoice.payment_failed');
        await handlePaymentFailed(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    console.log('Webhook processed successfully');
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Error processing webhook:', err);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('Checkout session completed webhook received:', {
    sessionId: session.id,
    userId: session.metadata?.userId,
    customerId: session.customer,
    successUrl: session.success_url,
    cancelUrl: session.cancel_url
  });

  const userId = session.metadata?.userId;
  if (!userId) return;

  const userRef = doc(db, 'userSubscriptions', userId);
  await setDoc(userRef, {
    stripeCustomerId: session.customer,
    status: 'trialing',
    updatedAt: new Date(),
  }, { merge: true });

  console.log('Updated user subscription for userId:', userId);
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  if (!userId) return;

  const item = subscription.items.data[0];
  const userRef = doc(db, 'userSubscriptions', userId);
  await setDoc(userRef, {
    stripeSubscriptionId: subscription.id,
    status: subscription.status,
    currentPeriodStart: item.current_period_start ? new Date(item.current_period_start * 1000) : null,
    currentPeriodEnd: item.current_period_end ? new Date(item.current_period_end * 1000) : null,
    trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
    trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
    planType: subscription.metadata?.planType as 'monthly' | 'yearly' | undefined,
    updatedAt: new Date(),
  }, { merge: true });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  if (!userId) return;

  const item = subscription.items.data[0];
  const userRef = doc(db, 'userSubscriptions', userId);
  await setDoc(userRef, {
    status: subscription.status,
    currentPeriodStart: item.current_period_start ? new Date(item.current_period_start * 1000) : null,
    currentPeriodEnd: item.current_period_end ? new Date(item.current_period_end * 1000) : null,
    trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
    trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
    updatedAt: new Date(),
  }, { merge: true });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  if (!userId) return;

  const userRef = doc(db, 'userSubscriptions', userId);
  await setDoc(userRef, {
    status: 'canceled',
    updatedAt: new Date(),
  }, { merge: true });
}

async function handlePaymentSucceeded(invoice: WebhookInvoice) {
  const subscriptionId = invoice.subscription;
  if (!subscriptionId) return;
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const userId = subscription.metadata?.userId;
  if (!userId) return;

  const userRef = doc(db, 'userSubscriptions', userId);
  await setDoc(userRef, {
    status: subscription.status,
    updatedAt: new Date(),
  }, { merge: true });
}

async function handlePaymentFailed(invoice: WebhookInvoice) {
  const subscriptionId = invoice.subscription;
  if (!subscriptionId) return;
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const userId = subscription.metadata?.userId;
  if (!userId) return;

  const userRef = doc(db, 'userSubscriptions', userId);
  await setDoc(userRef, {
    status: subscription.status,
    updatedAt: new Date(),
  }, { merge: true });
} 