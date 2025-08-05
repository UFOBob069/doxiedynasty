import { NextRequest, NextResponse } from 'next/server';
import { stripe, STRIPE_CONFIG } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const { customerName, customerEmail, giftNote } = await request.json();

    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 500 }
      );
    }

    // Create checkout session for Doxie Dynasty card game
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: STRIPE_CONFIG.PRICE_ID,
          quantity: 1,
          adjustable_quantity: {
            enabled: true,
            minimum: 1,
            maximum: 10,
          },
        },
      ],
      mode: 'payment',
      success_url: `${request.nextUrl.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/`,
      customer_email: customerEmail,
      metadata: {
        customerName,
        giftNote: giftNote || '',
        product: 'Doxie Dynasty Card Game',
      },
      shipping_address_collection: {
        allowed_countries: ['US', 'CA'], // Add more countries as needed
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 0, // Free shipping
              currency: 'usd',
            },
            display_name: 'Free Shipping',
            delivery_estimate: {
              minimum: {
                unit: 'business_day',
                value: 5,
              },
              maximum: {
                unit: 'business_day',
                value: 7,
              },
            },
          },
        },
      ],
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      phone_number_collection: {
        enabled: true,
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
} 