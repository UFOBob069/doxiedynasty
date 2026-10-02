import { DOXIE_DYNASTY } from './doxie-product';
import { SITE_URL } from './site';
import { GUIDES } from './guides';

export const PRODUCT = {
  id: 'doxie-dynasty-90',
  brand: 'Doxie Dynasty',
  url: `${SITE_URL}/product`,
  amazonUrl: 'https://www.amazon.com/dp/B0H1NL53PX',
  checkoutUrl: `${SITE_URL}/checkout`,
  rulesUrl: `${SITE_URL}/gameplay`,
  rulesPdfUrl: `${SITE_URL}/downloads/doxie-dynasty-full-rules.pdf`,
  supportEmail: 'david.eagan@gmail.com',
  description: 'Doxie Dynasty is a physical, 90-card dachshund-themed set-collection game for 2-6 players. A typical game takes 20-30 minutes. Play Doxies face up, make matching sets, and use Quirks, Actions, and Wild Doxies to build the highest-scoring Dynasty.',
  images: [`${SITE_URL}/box-product-mockup.webp`, `${SITE_URL}/cards/box-front.webp`],
  // Owner-confirmed 2026-09-23. Update all three values when direct-order stock changes.
  availability: {
    label: 'In stock',
    schemaValue: 'https://schema.org/InStock',
    feedValue: 'in_stock',
  },
  price: (DOXIE_DYNASTY.CURRENT_PRICE / 100).toFixed(2),
  currency: 'USD',
} as const;

export const PRODUCT_FACTS = [
  ['Game type', 'Physical set-collection card game'],
  ['Theme', 'Dachshunds / doxies'],
  ['Players', '2-6'],
  ['Typical play time', '20-30 minutes'],
  ['Playing cards', '90: 66 regular Doxies, 6 Wilds, 12 Quirks, 6 Actions'],
  ['Starting hand', '7 cards per player'],
  ['Goal', 'Build the highest-scoring face-up Dynasty'],
] as const;

export const PRODUCT_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  '@id': `${SITE_URL}/#doxie-dynasty-card-game`,
  name: DOXIE_DYNASTY.NAME,
  url: PRODUCT.url,
  description: PRODUCT.description,
  image: PRODUCT.images,
  category: 'Card Games',
  brand: { '@type': 'Brand', name: PRODUCT.brand },
  sameAs: PRODUCT.amazonUrl,
  additionalProperty: PRODUCT_FACTS.map(([name, value]) => ({
    '@type': 'PropertyValue', name, value,
  })),
  subjectOf: {
    '@type': 'CreativeWork',
    name: 'Doxie Dynasty full gameplay rules',
    url: PRODUCT.rulesUrl,
  },
  offers: {
    '@type': 'Offer',
    '@id': `${SITE_URL}/#direct-offer`,
    url: PRODUCT.checkoutUrl,
    price: PRODUCT.price,
    priceCurrency: PRODUCT.currency,
    availability: PRODUCT.availability.schemaValue,
    itemCondition: 'https://schema.org/NewCondition',
    eligibleRegion: { '@type': 'Country', name: 'US' },
    shippingDetails: {
      '@type': 'OfferShippingDetails',
      shippingRate: { '@type': 'MonetaryAmount', value: 0, currency: PRODUCT.currency },
      shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'US' },
    },
    hasMerchantReturnPolicy: {
      '@type': 'MerchantReturnPolicy',
      applicableCountry: 'US',
      returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
      merchantReturnDays: DOXIE_DYNASTY.RETURN_DAYS,
      merchantReturnLink: `${PRODUCT.url}#shipping-returns`,
    },
    seller: {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: PRODUCT.brand,
      url: SITE_URL,
      email: PRODUCT.supportEmail,
    },
  },
};

// Discovery only: publishing this feed is not merchant approval or checkout enrollment.
export const DISCOVERY_PRODUCT = {
  item_id: PRODUCT.id,
  title: DOXIE_DYNASTY.NAME,
  description: PRODUCT.description,
  url: PRODUCT.url,
  brand: PRODUCT.brand,
  seller_name: PRODUCT.brand,
  image_url: PRODUCT.images[0],
  availability: PRODUCT.availability.feedValue,
  price: `${PRODUCT.price} ${PRODUCT.currency}`,
  is_eligible_search: true,
  is_eligible_checkout: false,
};

export function productSummary() {
  return `# ${DOXIE_DYNASTY.NAME}

> Official product facts, purchase links, and gameplay resources.

${PRODUCT.description}

## Product facts
${PRODUCT_FACTS.map(([name, value]) => `- ${name}: ${value}`).join('\n')}

## Buying
- [Buy on Amazon](${PRODUCT.amazonUrl}): primary purchase link. Amazon displays its own current price, availability, shipping, and returns.
- [Direct checkout](${PRODUCT.checkoutUrl}): published site price ${PRODUCT.price} ${PRODUCT.currency} per deck; ${DOXIE_DYNASTY.MIN_QUANTITY}-${DOXIE_DYNASTY.MAX_QUANTITY} decks per order. Browser-based Stripe checkout, not an agent checkout API.
- Direct orders: free U.S. shipping only; estimated delivery ${DOXIE_DYNASTY.SHIPPING_DAYS} business days. Returns accepted within ${DOXIE_DYNASTY.RETURN_DAYS} days of delivery.
- Direct-order availability: ${PRODUCT.availability.label}. Stock status is maintained manually, not connected to real-time inventory. The site's price, stock status, and policies are not Amazon's offer.
- Native agent checkout is not enabled. A product feed is not a purchase authorization.

## Official pages
- [Product details and purchase information](${PRODUCT.url})
- [Dachshund gift guides and game-night ideas](${SITE_URL}/guides)
- [Shipping and returns](${PRODUCT.url}#shipping-returns)
- [Full gameplay rules](${PRODUCT.rulesUrl})
- [All 90 card names](${PRODUCT.rulesUrl}#checklist)
- [Download the full rules PDF](${PRODUCT.rulesPdfUrl})
- [Product data (Schema.org JSON-LD)](${SITE_URL}/product.json)
- [Discovery product feed (JSONL)](${SITE_URL}/feeds/products.jsonl)

## Plain-text and structured references
- [Complete text reference](${SITE_URL}/llms-full.txt): product facts, full rules, all card names, FAQs, and complete gift guides.
- [Full rules as plain text](${SITE_URL}/gameplay.txt): the same rules and card explanations as the visible gameplay page.
- [All 90 card names as JSON](${SITE_URL}/cards.json): names grouped by regular Doxie, Wild, Quirk, and Action; not a full trait catalog.
- [XML sitemap](${SITE_URL}/sitemap.xml)

## Gift guides
These guides are written by Doxie Dynasty, the maker of the game, not an independent review publication. The game is a fixed deck, not a custom-name or custom-portrait product.
${GUIDES.map(guide => `- [${guide.title}](${SITE_URL}/guides/${guide.slug}): ${guide.description}`).join('\n')}

## Support
Email: ${PRODUCT.supportEmail}

This site does not publish a verified aggregate review rating. No GTIN or manufacturer part number is asserted here.
`;
}
