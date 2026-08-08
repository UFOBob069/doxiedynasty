# Stripe setup for Doxie Dynasty

The website supports two Stripe connection methods. Use the Payment Link option
for the fastest launch, or the custom checkout option when you want the built-in
customer and gift-note form.

## Option 1: Stripe Payment Link

1. In Stripe, create a product and a one-time price for Doxie Dynasty.
2. Create a Payment Link for that price.
3. Add the link to the deployment environment:

```env
NEXT_PUBLIC_STRIPE_PAYMENT_LINK=https://buy.stripe.com/your-link
```

When this value is present, every **Buy direct** button opens the hosted Stripe
checkout. No API route or publishable key is required.

## Option 2: Built-in Stripe Checkout

If no Payment Link is configured, the website sends customers to `/checkout`.
That form creates a Stripe Checkout Session through the included API route.

Create a Stripe product with a one-time price, then set:

```env
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_DOXIE_DYNASTY_PRICE_ID=price_your_price_id
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

The webhook secret is optional while testing checkout, but required if you want
verified `checkout.session.completed` events. Configure the webhook endpoint as:

```text
https://your-domain.com/api/stripe/webhook
```

Subscribe it to `checkout.session.completed`.

## Going live

1. Test with Stripe test-mode keys.
2. Confirm the success and cancel redirects.
3. Replace the test secret and price ID with live-mode values.
4. Complete one small live order and confirm it in the Stripe Dashboard.

Never commit Stripe secrets. Store them in Vercel or the production hosting
environment.
