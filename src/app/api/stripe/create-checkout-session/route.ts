import { NextRequest, NextResponse } from 'next/server';
import { stripe, STRIPE_CONFIG } from '../../../../lib/stripe';
import { db } from '../../../../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const { userId, email, planType, couponCode } = await request.json();

    if (!userId || !email || !planType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get the appropriate price ID based on plan type
    const priceId = planType === 'yearly' 
      ? STRIPE_CONFIG.YEARLY_PRICE_ID 
      : STRIPE_CONFIG.MONTHLY_PRICE_ID;

    // Check if user already has a Stripe customer ID
    const userRef = doc(db, 'userSubscriptions', userId);
    const userDoc = await getDoc(userRef);
    let stripeCustomerId = userDoc.exists() ? userDoc.data()?.stripeCustomerId : null;

    // Create Stripe customer if doesn't exist
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: {
          userId,
        },
      });
      stripeCustomerId = customer.id;
    }

    // Prepare checkout session parameters
    const sessionParams: any = {
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${request.nextUrl.origin}/dashboard?success=true`,
      cancel_url: `${request.nextUrl.origin}/signup?canceled=true`,
      subscription_data: {
        trial_period_days: 30,
        metadata: {
          userId,
          planType,
        },
      },
      metadata: {
        userId,
        planType,
      },
    };

    // Add coupon if provided
    if (couponCode) {
      sessionParams.discounts = [
        {
          coupon: couponCode,
        },
      ];
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create(sessionParams);

    // Save initial subscription record
    await setDoc(userRef, {
      userId,
      stripeCustomerId,
      status: 'incomplete',
      planType,
      couponCode: couponCode || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }, { merge: true });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
} 