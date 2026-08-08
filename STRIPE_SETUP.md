# Stripe Checkout setup for Doxie Dynasty

Doxie Dynasty uses custom, Stripe-hosted Checkout Sessions for one-time purchases of the physical card game. Payment Links are not part of the site flow.

Current commerce rules:

- Price: $24.99 USD per deck
- Quantity: adjustable from 1 to 10 decks in Stripe Checkout
- Shipping: free to U.S. addresses only, estimated at 5–7 business days
- Returns: accepted within 30 days of delivery
- Fulfillment: reviewed and handled manually from Stripe Dashboard

## Environment variables

Copy `.env.example` to `.env.local` for local development and set these values in the deployment environment:

```env
APP_URL=http://localhost:3000
STRIPE_SECRET_KEY=
STRIPE_DOXIE_DYNASTY_PRICE_ID=
STRIPE_WEBHOOK_SECRET=
```

`APP_URL` must be the canonical origin for the environment. Use `http://localhost:3000` locally and `https://www.doxiedynasty.com` in production.

All Stripe variables are server-only. Never add `NEXT_PUBLIC_` to a Stripe secret or commit `sk_` or `whsec_` values.

## Sandbox configuration

Use the Doxie Dynasty Stripe sandbox while developing and testing.

1. Create or reuse an active, shippable Product named `Doxie Dynasty Card Game`.
2. Create or reuse its active one-time USD Price with a unit amount of `2499` cents.
3. Put that sandbox Price ID in `STRIPE_DOXIE_DYNASTY_PRICE_ID`.
4. Put the sandbox secret API key in `STRIPE_SECRET_KEY` through the local or deployment secret manager.

The Checkout Session defines the free U.S. shipping option inline so every sandbox checkout uses the approved 5–7-business-day estimate. No tax registration or automatic tax behavior is configured.

Promotion-code entry is enabled in Checkout, but codes work only after coupons and promotion codes are deliberately created in the same Stripe mode. None are required for initial testing.

## Webhook

The verified webhook endpoint is:

```text
https://your-domain.example/api/stripe/webhook
```

Subscribe it only to `checkout.session.completed` while the integration accepts card payments. The handler verifies the raw request body and Stripe signature, then logs a minimal signal for manual review. It intentionally does not create an external order, send email, or trigger shipping.

For local testing with Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Store the signing secret printed by the CLI in local `STRIPE_WEBHOOK_SECRET`. A CLI signing secret is different from the secret for a Dashboard-managed webhook endpoint.

## Manual fulfillment

Stripe Dashboard is the source of truth for the initial workflow.

1. Open the completed Checkout Session or Payment in the sandbox Dashboard.
2. Confirm that payment is paid and review the final quantity, shipping address, customer email, discount, and gift-note metadata.
3. Prepare and ship the order manually using the approved U.S.-only free-shipping process.
4. Send any order or shipping updates manually to the email collected by Checkout.
5. Handle an eligible return or refund according to the 30-day return policy.

Stripe does not track the physical fulfillment status for this implementation. Maintain the manual fulfillment status in the team’s operating process until a durable order system is explicitly added.

## Test checklist

Run all scenarios with sandbox keys and Stripe test payment methods:

1. Complete a one-deck payment with test card `4242 4242 4242 4242`.
2. Repeat with the adjustable quantity set to 10.
3. Confirm Checkout accepts only a U.S. shipping address and displays free 5–7-business-day shipping.
4. Cancel Checkout and confirm the customer returns to `/checkout?canceled=1` without a charge.
5. Test a declined payment and a 3D Secure payment.
6. Confirm `/success` rejects missing, invalid, unpaid, or unrelated Session IDs.
7. Confirm a paid Session displays the actual quantity, total, email, destination, and Stripe reference.
8. Confirm the webhook rejects an invalid signature and accepts the signed `checkout.session.completed` event.
9. Confirm the completed Session contains the gift note and all details required for manual fulfillment.

## Production later

Live mode is not configured by this setup. Before a future live rollout, create separate live-mode Product, Price, and webhook resources, then replace the sandbox values only in the production secret manager. Test and live object IDs and webhook signing secrets are not interchangeable.
