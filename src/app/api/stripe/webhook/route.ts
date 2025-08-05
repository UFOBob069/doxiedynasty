import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/firebase';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
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
            firebaseCustomerId: session.metadata?.firebaseCustomerId,
          });

          try {
            // Save order to Firebase
            const orderData = {
              stripeSessionId: session.id,
              customerEmail: session.customer_email,
              customerName: session.metadata?.customerName,
              giftNote: session.metadata?.giftNote || null,
              amount: session.amount_total,
              currency: session.currency,
              status: 'paid',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            };

            const orderDoc = await addDoc(collection(db, 'orders'), orderData);

            // Update customer record if we have a Firebase customer ID
            if (session.metadata?.firebaseCustomerId) {
              const customerRef = doc(db, 'customers', session.metadata.firebaseCustomerId);
              await updateDoc(customerRef, {
                status: 'paid',
                stripeSessionId: session.id,
                orderId: orderDoc.id,
                updatedAt: serverTimestamp(),
              });
            }

            console.log('Order saved to Firebase:', orderDoc.id);

            // Here you would typically:
            // 1. Send confirmation email to customer
            // 2. Send order details to fulfillment team
            // 3. Update inventory

            // Example: Send confirmation email
            // await sendOrderConfirmationEmail(session.customer_email!, {
            //   orderId: orderDoc.id,
            //   customerName: session.metadata?.customerName,
            //   amount: session.amount_total,
            // });
          } catch (firebaseError) {
            console.error('Error saving order to Firebase:', firebaseError);
            // Don't fail the webhook, but log the error
          }
        }
        break;

      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment succeeded:', paymentIntent.id);
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        console.log('Payment failed:', failedPayment.id);
        
        // Update customer status if we have the Firebase customer ID
        if (failedPayment.metadata?.firebaseCustomerId) {
          try {
            const customerRef = doc(db, 'customers', failedPayment.metadata.firebaseCustomerId);
            await updateDoc(customerRef, {
              status: 'payment_failed',
              updatedAt: serverTimestamp(),
            });
          } catch (firebaseError) {
            console.error('Error updating customer status:', firebaseError);
          }
        }
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