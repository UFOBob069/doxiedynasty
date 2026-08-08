# Doxie Dynasty Card Game

The Doxie Dynasty storefront is a responsive Next.js site for a physical, dog-themed card game. Customers can buy directly through a custom Stripe-hosted Checkout Session or follow the separate Amazon link.

## Storefront behavior

- Direct price: $24.99 USD per deck
- Adjustable Stripe Checkout quantity: 1–10 decks
- Free U.S.-only shipping with a 5–7-business-day estimate
- 30-day return policy
- Optional promotion-code entry
- Verified Checkout success page backed by the Stripe Session
- Signed webhook signal for an initial manual Stripe Dashboard fulfillment workflow

Payment Links are not used. All direct-purchase links lead to `/checkout`, which creates a hosted Checkout Session through the server-side API route.

## Tech stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Stripe Node SDK
- Lucide React

## Local development

1. Install dependencies:

```bash
npm install
```

2. Copy the environment template:

```bash
cp .env.example .env.local
```

3. Configure server-only sandbox values in `.env.local`:

```env
APP_URL=http://localhost:3000
STRIPE_SECRET_KEY=
STRIPE_DOXIE_DYNASTY_PRICE_ID=
STRIPE_WEBHOOK_SECRET=
```

4. Start the site:

```bash
npm run dev
```

5. In another terminal, forward signed Stripe sandbox events:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Use the signing secret from that CLI session only in `.env.local`. Never commit secret keys or webhook signing secrets.

## Stripe flow

1. The customer enters a name, email, and optional bounded gift note on `/checkout`.
2. The server validates the request and creates a Stripe-hosted Checkout Session using the configured Price ID.
3. Stripe collects payment, the final quantity, and a U.S. shipping address.
4. A signed `checkout.session.completed` event reaches the webhook.
5. The success page retrieves the Session server-side and confirms that it is paid, contains the configured Price, and has a U.S. shipping address.
6. The team reviews the paid Session in Stripe Dashboard and fulfills it manually.

See [STRIPE_SETUP.md](./STRIPE_SETUP.md) for the complete sandbox, webhook, test, and fulfillment checklist.

## Commands

```bash
npm run lint
npm run build
npm audit
```

## Deployment

Vercel is the recommended host. Add the environment variables through Vercel’s secret/environment settings and set `APP_URL` to the canonical origin for that deployment. Sandbox and live Stripe objects are separate; this repository does not contain live credentials or live resource IDs.
