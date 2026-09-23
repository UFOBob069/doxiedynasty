# Agent discovery and commerce readiness

Reviewed September 21, 2026. Platform: Next.js 16 / React 19 on Vercel; browser-based Stripe Checkout, with manual fulfillment. This is not a Shopify storefront.

## Implemented

- `/product`: server-rendered product facts, direct-site pricing and terms, rules, support, and purchase links. Amazon remains the primary CTA.
- `/product.json`: public, read-only Schema.org Product/Offer JSON-LD, also embedded on the homepage and product page.
- `/llms.txt`: factual text summary linking official resources; an optional convenience, not a ranking guarantee.
- `/feeds/products.jsonl`: one-record discovery feed using OpenAI's documented fields. It has not been submitted or approved. Native checkout is explicitly disabled.
- Robots allows public discovery while excluding `/api/` and `/success`. Checkout and confirmation pages retain noindex metadata. Robots is not an access-control mechanism.
- Product page in the sitemap; explicit canonical URL; product images and rules PDF available without login.
- Checkout form has named, labeled inputs and an inline accessible error message instead of a browser alert. Payment processing is unchanged.

## Data maintenance

Price and existing commerce terms live in `src/lib/doxie-product.ts`. Shared discovery data and markup live in `src/lib/product-catalog.ts`. Change these sources and redeploy; do not separately edit generated feeds.

- The configured site price is $24.99 USD, with free U.S. shipping, estimated 5-7 business days, and returns within 30 days of delivery, as documented in STRIPE_SETUP.md. These are not Amazon's prices or policies.
- The owner confirmed direct-order decks are in stock on 2026-09-23. Shared product data now publishes `InStock` in structured data and `in_stock` in the discovery feed, with matching visible copy. Stock is maintained manually in `src/lib/product-catalog.ts`; update its availability values and regression tests when stock changes. There is no real-time inventory connection or reservation system for agent purchase flows.
- The legacy `DOXIE-DYNASTY-84` schema SKU was removed. The feed's `doxie-dynasty-90` is an internal feed ID, not an asserted manufacturer SKU, MPN, or GTIN.
- No aggregate rating, review count, UPC, GTIN, or invented return-fee policy is published.

## Not yet complete

1. Confirm production Stripe uses live keys and the correct active USD 2499-cent Price. Existing setup notes still describe sandbox mode. An empty production checkout request returned the expected validation error, which confirms configuration exists but does not prove live payments. No payment or customer session was created for this audit.
2. Keep the owner-confirmed stock status current; confirm actual SKU/GTIN if assigned, return shipping costs/conditions, and owner-approved privacy and sales terms. Do not add legal terms or inventory promises by assumption.
3. Apply for OpenAI merchant access, or assess Shopify's Agentic plan without migrating this website. Registration, identity checks, account approvals, and channel configuration are not automatic consequences of publishing a feed.
4. Submit/sync a discovery feed only after approval and the above data checks. Keep prices and inventory current. Native ACP/UCP checkout, authenticated order APIs, consent, inventory reservation, idempotency, payment reconciliation, and order lifecycle handling are a separate integration project.
5. Validate ownership and indexing in Google Search Console / Bing Webmaster Tools. Account access is required; no submission was made here. Hosting/WAF bot policies also need account-level verification; requests with crawler user-agent strings alone do not prove all real crawler IPs can access the site.
6. Seek genuine reviews and editorial coverage. No fake ratings, paid positive reviews, or manufactured forum recommendations.

## Verification

Start the app on port 3013, then run `npm run test:agent-readiness`. Use `TEST_BASE_URL` to test a different server or the live domain. The tests only read public routes, except a POST to the read-only discovery feed to verify a 405 response. They do not create Stripe sessions or buy anything.

## Official references

- https://developers.openai.com/commerce/guides/get-started
- https://developers.openai.com/commerce/specs/file-upload/products
- https://developers.openai.com/api/docs/bots
- https://help.shopify.com/en/manual/online-sales-channels/agentic-storefronts/agentic-plan-setup
- https://developers.google.com/search/docs/fundamentals/ai-optimization-guide

Google explicitly says llms.txt does not improve or harm its search rankings. Merchant enrollment and checkout enablement are distinct from search discovery. Do not advertise this site as certified, automatically listed in ChatGPT, or natively agent-buyable.
