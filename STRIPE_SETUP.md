# Stripe Setup for Doxie Dynasty Card Game

This guide will help you set up Stripe payments for the Doxie Dynasty card game eCommerce website.

## Prerequisites

1. A Stripe account (sign up at [stripe.com](https://stripe.com))
2. Node.js and npm installed
3. The Doxie Dynasty project cloned and dependencies installed

## Step 1: Get Your Stripe API Keys

1. Log into your Stripe Dashboard
2. Go to **Developers** → **API keys**
3. Copy your **Publishable key** and **Secret key**
4. Make sure you're using **Test keys** for development

## Step 2: Create the Product in Stripe

1. In your Stripe Dashboard, go to **Products**
2. Click **Add product**
3. Fill in the details:
   - **Name**: Doxie Dynasty Card Game
   - **Description**: Build your ultimate pack of wiener dogs in this fast-paced, family-friendly card game
   - **Images**: Upload card game images
   - **Pricing**: Set to $24.99 USD (one-time payment)
4. Save the product and note the **Product ID** (starts with `prod_`)

## Step 3: Create the Price

1. In your product, click **Add pricing**
2. Set the price to **$24.99 USD**
3. Choose **One-time payment**
4. Save and note the **Price ID** (starts with `price_`)

## Step 4: Set Up Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here

# Doxie Dynasty Product IDs
STRIPE_DOXIE_DYNASTY_PRODUCT_ID=prod_your_product_id_here
STRIPE_DOXIE_DYNASTY_PRICE_ID=price_your_price_id_here

# Webhook Secret (we'll set this up next)
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

## Step 5: Set Up Webhooks

1. In your Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Set the endpoint URL to: `https://your-domain.com/api/stripe/webhook`
   - For local development: `http://localhost:3000/api/stripe/webhook`
4. Select these events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Click **Add endpoint**
6. Copy the **Webhook signing secret** and add it to your `.env.local` file

## Step 6: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000`

3. Fill out the checkout form and click "Yes! Ship Me My Game"

4. You should be redirected to Stripe Checkout

5. Use these test card numbers:
   - **Success**: `4242 4242 4242 4242`
   - **Decline**: `4000 0000 0000 0002`
   - **Expiry**: Any future date
   - **CVC**: Any 3 digits

## Step 7: Handle Orders

The webhook will automatically handle successful orders. You can extend the webhook handler in `src/app/api/stripe/webhook/route.ts` to:

- Save orders to your database
- Send confirmation emails
- Update inventory
- Notify your fulfillment team

## Step 8: Go Live

When you're ready to accept real payments:

1. Switch to **Live mode** in your Stripe Dashboard
2. Update your environment variables with live keys
3. Update your webhook endpoint URL to your production domain
4. Test with a small real payment

## Important Notes

- **Security**: Never commit your `.env.local` file to version control
- **Testing**: Always test thoroughly with test keys before going live
- **Compliance**: Ensure you comply with PCI DSS requirements
- **Refunds**: Set up refund policies and procedures
- **Customer Support**: Be ready to handle payment-related customer inquiries

## Troubleshooting

### Common Issues

1. **"Stripe is not configured" error**
   - Check that your environment variables are set correctly
   - Restart your development server after changing environment variables

2. **Webhook signature verification failed**
   - Ensure your webhook secret is correct
   - Check that the webhook URL is accessible

3. **Product not found error**
   - Verify your product and price IDs are correct
   - Ensure the product is active in your Stripe Dashboard

### Getting Help

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com)
- [Next.js Documentation](https://nextjs.org/docs)

## Production Deployment

For production deployment:

1. Use a hosting platform like Vercel, Netlify, or AWS
2. Set environment variables in your hosting platform
3. Update webhook endpoints to your production domain
4. Test the complete payment flow
5. Monitor webhook events and order processing

---

**Happy selling! 🐕💳** 