# Stripe Integration Setup Guide

This guide will help you set up Stripe payments for your Agent Money Tracker application.

## 1. Stripe Account Setup

1. **Create a Stripe Account**
   - Go to [stripe.com](https://stripe.com) and create an account
   - Complete your business verification

2. **Get Your API Keys**
   - Go to Stripe Dashboard → Developers → API keys
   - Copy your **Publishable key** and **Secret key**
   - Use test keys for development, live keys for production

## 2. Create Products and Prices in Stripe

1. **Create a Product**
   - Go to Stripe Dashboard → Products
   - Click "Add product"
   - Name: "Agent Money Tracker"
   - Description: "Real estate agent financial tracking tool"
   - Save the product ID (starts with `prod_`)

2. **Create Monthly Price**
   - In your product, click "Add price"
   - Amount: $4.97
   - Billing: Recurring
   - Interval: Monthly
   - Trial period: 30 days
   - Save the price ID (starts with `price_`)

3. **Create Yearly Price**
   - Add another price
   - Amount: $49.00
   - Billing: Recurring
   - Interval: Yearly
   - Trial period: 30 days
   - Save the price ID (starts with `price_`)

## 3. Set Up Webhooks

1. **Create Webhook Endpoint**
   - Go to Stripe Dashboard → Developers → Webhooks
   - Click "Add endpoint"
   - URL: `https://yourdomain.com/api/stripe/webhook`
   - Events to send:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

2. **Get Webhook Secret**
   - After creating the webhook, click on it
   - Copy the "Signing secret" (starts with `whsec_`)

## 4. Environment Variables

Create a `.env.local` file in your project root with:

```env
# Firebase Configuration (you already have these)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Stripe Product and Price IDs
STRIPE_PRODUCT_ID=prod_your_product_id
STRIPE_MONTHLY_PRICE_ID=price_your_monthly_price_id
STRIPE_YEARLY_PRICE_ID=price_your_yearly_price_id

# Mapbox (for address autocomplete)
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
```

## 5. Create Coupon Codes (Optional)

1. **Go to Stripe Dashboard → Products → Coupons**
2. **Create coupons** for promotional offers:
   - Example: "WELCOME20" for 20% off first payment
   - Example: "YEARLY10" for 10% off yearly plans

## 6. Test the Integration

1. **Use Stripe Test Cards**
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - 3D Secure: `4000 0025 0000 3155`

2. **Test the Flow**
   - Sign up with a new account
   - Select a plan
   - Complete checkout with test card
   - Verify subscription status in dashboard

## 7. Production Deployment

1. **Switch to Live Keys**
   - Replace test keys with live keys in production
   - Update webhook URL to production domain
   - Test with real cards (small amounts)

2. **Monitor Webhooks**
   - Check Stripe Dashboard → Developers → Webhooks
   - Ensure all events are being received
   - Monitor for failed webhook deliveries

## 8. Subscription Management

Users can manage their subscriptions by:
- Going to Stripe Customer Portal (billing.stripe.com)
- Contacting support
- Using the subscription management in the dashboard

## 9. Troubleshooting

**Common Issues:**
- Webhook not receiving events: Check URL and secret
- Checkout not working: Verify API keys and price IDs
- Subscription not updating: Check webhook events and Firestore rules

**Debug Steps:**
1. Check browser console for errors
2. Verify environment variables are loaded
3. Check Stripe Dashboard for failed payments
4. Monitor Firestore for subscription updates

## 10. Security Considerations

- Never expose secret keys in client-side code
- Always verify webhook signatures
- Use HTTPS in production
- Implement proper error handling
- Monitor for suspicious activity

## Support

For Stripe-specific issues:
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com)

For application issues:
- Check the application logs
- Verify all environment variables are set correctly 