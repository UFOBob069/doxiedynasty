import assert from 'node:assert/strict';
import test from 'node:test';

const base = process.env.TEST_BASE_URL || 'http://localhost:3013';
const canonical = 'https://www.doxiedynasty.com';

async function get(path, type, userAgent) {
  const response = await fetch(new URL(path, base), {
    headers: userAgent ? { 'User-Agent': userAgent } : {},
  });
  assert.equal(response.status, 200, `${path} should be publicly accessible`);
  assert.ok(response.headers.get('content-type')?.includes(type), `${path}: wrong content type`);
  return response.text();
}

function productMarkup(html) {
  const scripts = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  const product = scripts.map(match => JSON.parse(match[1])).find(item => item['@type'] === 'Product');
  assert.ok(product, 'Server-rendered Product JSON-LD is required');
  return product;
}

test('HTML and JSON share one accurate product and direct offer', async () => {
  const json = JSON.parse(await get('/product.json', 'application/ld+json'));
  for (const path of ['/', '/product']) {
    const html = await get(path, 'text/html');
    assert.deepEqual(productMarkup(html), json);
    assert.match(html, /24\.99/);
    assert.match(html, /Buy on Amazon/);
    assert.ok(html.includes('https://www.amazon.com/dp/B0H1NL53PX'));
    assert.ok(html.includes('href="/product'));
  }
  assert.equal(json.offers.price, '24.99');
  assert.equal(json.offers.priceCurrency, 'USD');
  assert.equal(json.offers.url, `${canonical}/checkout`);
  assert.equal(json.offers.shippingDetails.shippingRate.value, 0);
  assert.equal(json.offers.shippingDetails.shippingDestination.addressCountry, 'US');
  assert.equal(json.offers.hasMerchantReturnPolicy.merchantReturnDays, 30);
  assert.ok(!('sku' in json), 'Do not publish the old unverified 84-card SKU');
  assert.ok(!('aggregateRating' in json) && !('review' in json), 'Do not invent reviews');
  assert.ok(!('availability' in json.offers), 'Do not invent real-time inventory');
  const count = json.additionalProperty.find(property => property.name === 'Playing cards');
  assert.match(count.value, /^90: 66 regular Doxies, 6 Wilds, 12 Quirks, 6 Actions$/);
});

test('discovery feed has current required fields and does not enable checkout', async () => {
  const text = await get('/feeds/products.jsonl', 'application/x-ndjson');
  const records = text.trim().split('\n').map(line => JSON.parse(line));
  assert.equal(records.length, 1);
  const product = records[0];
  for (const key of ['item_id', 'title', 'description', 'url', 'brand', 'seller_name', 'image_url', 'availability', 'price']) {
    assert.equal(typeof product[key], 'string', `Required discovery field: ${key}`);
    assert.ok(product[key].length > 0);
  }
  assert.equal(product.item_id, 'doxie-dynasty-90');
  assert.equal(product.url, `${canonical}/product`);
  assert.equal(product.price, '24.99 USD');
  assert.equal(product.availability, 'unknown');
  assert.equal(product.is_eligible_search, true);
  assert.equal(product.is_eligible_checkout, false);
  assert.ok(!('gtin' in product) && !('mpn' in product));
  await get(new URL(product.image_url).pathname, 'image/');
  const rejected = await fetch(new URL('/feeds/products.jsonl', base), { method: 'POST' });
  assert.equal(rejected.status, 405, 'Discovery endpoint must not accept writes');
});

test('plain-text summary links public resources and distinguishes purchase channels', async () => {
  const summary = await get('/llms.txt', 'text/plain');
  assert.match(summary, /90-card/);
  assert.match(summary, /24\.99 USD/);
  assert.match(summary, /Native agent checkout is not enabled/);
  assert.match(summary, /Real-time inventory is not published/);
  assert.match(summary, /Amazon displays its own current price/);
  for (const [, url] of summary.matchAll(/\]\((https:\/\/[^)]+)\)/g)) {
    const target = new URL(url);
    if (target.origin === canonical) {
      const response = await fetch(new URL(target.pathname, base));
      assert.equal(response.status, 200, `Broken resource: ${url}`);
    }
  }
});

test('crawler access, sitemap, canonical URLs and payment privacy', async () => {
  const robots = await get('/robots.txt', 'text/plain');
  for (const agent of ['*', 'OAI-SearchBot', 'ChatGPT-User']) {
    const group = robots.split('\n\n').find(block => block.includes(`User-Agent: ${agent}\n`));
    assert.ok(group, `Missing crawler rule: ${agent}`);
    assert.ok(group.includes('Allow: /\n'));
    assert.ok(group.includes('Disallow: /api/'));
    assert.ok(group.includes('Disallow: /success'));
  }
  const sitemap = await get('/sitemap.xml', 'application/xml');
  assert.ok(sitemap.includes(`<loc>${canonical}/product</loc>`));
  assert.ok(sitemap.includes(`<loc>${canonical}/gameplay</loc>`));
  assert.ok(!sitemap.includes('/checkout') && !sitemap.includes('/success'));
  for (const agent of ['OAI-SearchBot/1.3', 'ChatGPT-User/1.0']) {
    const html = await get('/product', 'text/html', agent);
    assert.match(html, /rel="canonical" href="https:\/\/www\.doxiedynasty\.com\/product"/);
    assert.match(html, /Inside the deck/);
    assert.ok(!html.includes('content="noindex'));
  }
  const checkout = await get('/checkout', 'text/html');
  assert.match(checkout, /content="noindex, nofollow"/);
});
