import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '../../../../lib/stripe';
import { db } from '../../../../firebase';
import { doc, setDoc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: any) {
  const userId = session.metadata?.userId;
  if (!userId) return;

  const userRef = doc(db, 'userSubscriptions', userId);
  await setDoc(userRef, {
    stripeCustomerId: session.customer,
    status: 'trialing',
    updatedAt: new Date(),
  }, { merge: true });
}

async function handleSubscriptionCreated(subscription: any) {
  const userId = subscription.metadata?.userId;
  if (!userId) return;

  const userRef = doc(db, 'userSubscriptions', userId);
  await setDoc(userRef, {
    stripeSubscriptionId: subscription.id,
    status: subscription.status,
    currentPeriodStart: new Date(subscription.current_period_start * 1000),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
    trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
    planType: subscription.metadata?.planType,
    updatedAt: new Date(),
  }, { merge: true });
}

async function handleSubscriptionUpdated(subscription: any) {
  const userId = subscription.metadata?.userId;
  if (!userId) return;

  const userRef = doc(db, 'userSubscriptions', userId);
  await setDoc(userRef, {
    status: subscription.status,
    currentPeriodStart: new Date(subscription.current_period_start * 1000),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
    trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
    updatedAt: new Date(),
  }, { merge: true });
}

async function handleSubscriptionDeleted(subscription: any) {
  const userId = subscription.metadata?.userId;
  if (!userId) return;

  const userRef = doc(db, 'userSubscriptions', userId);
  await setDoc(userRef, {
    status: 'canceled',
    updatedAt: new Date(),
  }, { merge: true });
}

async function handlePaymentSucceeded(invoice: any) {
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
  const userId = subscription.metadata?.userId;
  if (!userId) return;

  const userRef = doc(db, 'userSubscriptions', userId);
  await setDoc(userRef, {
    status: subscription.status,
    updatedAt: new Date(),
  }, { merge: true });
}

async function handlePaymentFailed(invoice: any) {
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
  const userId = subscription.metadata?.userId;
  if (!userId) return;

  const userRef = doc(db, 'userSubscriptions', userId);
  await setDoc(userRef, {
    status: subscription.status,
    updatedAt: new Date(),
  }, { merge: true });
} 