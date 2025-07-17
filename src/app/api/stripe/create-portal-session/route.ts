import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '../../../../lib/stripe';
import { db } from '../../../../firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();
    console.log('Portal session request for userId:', userId);
    
    if (!userId) {
      console.log('Error: No userId provided');
      return NextResponse.json({ error: 'User ID is required' },{ status: 400 });
    }
    
    if (!stripe) {
      console.log('Error: Stripe is not initialized');
      return NextResponse.json({ error: 'Stripe is not initialized' },{ status: 500 });
    }
    
    // Get usersStripe customer ID from Firestore
    const userRef = doc(db, 'userSubscriptions', userId);
    console.log('Fetching user subscription for userId:', userId);
    
    const userDoc = await getDoc(userRef);
    console.log('User document exists:', userDoc.exists());
    
    if (!userDoc.exists()) {
      console.log('Error: User subscription not found for userId:', userId);
      return NextResponse.json({ error: 'User subscription not found' },{ status: 404 });
    }
    
    const userData = userDoc.data();
    console.log('User data:', userData);
    
    const stripeCustomerId = userData.stripeCustomerId;
    console.log('Stripe customer ID:', stripeCustomerId);
    
    if (!stripeCustomerId) {
      console.log('Error: No Stripe customer ID found for userId:', userId);
      return NextResponse.json({ error: 'No Stripe customer ID found' },{ status: 400 });
    }
    
    // Create portal session
    console.log('Creating portal session for customer:', stripeCustomerId);
    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${request.nextUrl.origin}/dashboard`,
    });
    
    console.log('Portal session created successfully:', session.url);
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating portal session:', error);
    return NextResponse.json({ error: 'Failed to create portal session' },{ status: 500 });
  }
} 