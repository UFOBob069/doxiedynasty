import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature || !stripe) {
    return NextResponse.json(
      { error: 'Missing signature or Stripe not configured' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Handle successful Doxie Dynasty card game purchase
        if (session.mode === 'payment') {
          console.log('Doxie Dynasty order completed:', {
            sessionId: session.id,
            customerEmail: session.customer_email,
            amount: session.amount_total,
            customerName: session.metadata?.customerName,
            giftNote: session.metadata?.giftNote,
          });

          // Here you would typically:
          // 1. Save order to your database
          // 2. Send confirmation email to customer
          // 3. Send order details to fulfillment team
          // 4. Update inventory
          
          // Example: Send confirmation email
          // await sendOrderConfirmationEmail(session.customer_email!, {
          //   orderId: session.id,
          //   customerName: session.metadata?.customerName,
          //   amount: session.amount_total,
          //   shippingAddress: session.shipping_details,
          // });
        }
        break;

      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment succeeded:', paymentIntent.id);
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        console.log('Payment failed:', failedPayment.id);
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