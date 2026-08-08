import { NextRequest, NextResponse } from 'next/server';
import { DOXIE_DYNASTY } from '@/lib/doxie-product';
import { getAppOrigin, stripe, STRIPE_CONFIG } from '@/lib/stripe';

export const runtime = 'nodejs';

type CheckoutRequest = {
  customerName: string;
  customerEmail: string;
  giftNote: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseCheckoutRequest(value: unknown): CheckoutRequest | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const body = value as Record<string, unknown>;
  const customerName = typeof body.customerName === 'string' ? body.customerName.trim() : '';
  const customerEmail = typeof body.customerEmail === 'string' ? body.customerEmail.trim() : '';
  const giftNote = typeof body.giftNote === 'string' ? body.giftNote.trim() : '';

  if (
    !customerName ||
    customerName.length > DOXIE_DYNASTY.MAX_CUSTOMER_NAME_LENGTH ||
    !customerEmail ||
    customerEmail.length > DOXIE_DYNASTY.MAX_CUSTOMER_EMAIL_LENGTH ||
    !EMAIL_PATTERN.test(customerEmail) ||
    giftNote.length > DOXIE_DYNASTY.MAX_GIFT_NOTE_LENGTH
  ) {
    return null;
  }

  return { customerName, customerEmail, giftNote };
}

export async function POST(request: NextRequest) {
  if (!stripe || !STRIPE_CONFIG.PRICE_ID) {
    return NextResponse.json(
      { error: 'Direct checkout is not configured yet.' },
      { status: 503 },
    );
  }

  const appOrigin = getAppOrigin();

  if (!appOrigin) {
    return NextResponse.json(
      { error: 'Direct checkout URL is not configured yet.' },
      { status: 503 },
    );
  }

  let requestBody: unknown;

  try {
    requestBody = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid checkout request.' }, { status: 400 });
  }

  const checkoutRequest = parseCheckoutRequest(requestBody);

  if (!checkoutRequest) {
    return NextResponse.json(
      { error: 'Please provide a valid name, email, and gift note.' },
      { status: 400 },
    );
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: STRIPE_CONFIG.PRICE_ID,
          quantity: DOXIE_DYNASTY.MIN_QUANTITY,
          adjustable_quantity: {
            enabled: true,
            minimum: DOXIE_DYNASTY.MIN_QUANTITY,
            maximum: DOXIE_DYNASTY.MAX_QUANTITY,
          },
        },
      ],
      mode: 'payment',
      success_url: `${appOrigin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appOrigin}/checkout?canceled=1`,
      customer_creation: 'always',
      customer_email: checkoutRequest.customerEmail,
      metadata: {
        customerName: checkoutRequest.customerName,
        giftNote: checkoutRequest.giftNote,
        product: DOXIE_DYNASTY.NAME,
        fulfillment: 'manual_stripe_dashboard',
      },
      shipping_address_collection: {
        allowed_countries: ['US'],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 0,
              currency: 'usd',
            },
            display_name: 'Free U.S. Shipping',
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
      billing_address_collection: 'auto',
      custom_text: {
        shipping_address: {
          message: 'Free shipping is available to U.S. addresses only. Estimated delivery is 5–7 business days.',
        },
        submit: {
          message: 'Returns are accepted within 30 days of delivery.',
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating Stripe Checkout Session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session.' },
      { status: 500 },
    );
  }
}
