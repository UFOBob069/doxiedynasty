import assert from 'node:assert/strict';
import test from 'node:test';

const base = process.env.TEST_BASE_URL || 'http://localhost:3015';
const canonical = 'https://www.doxiedynasty.com';
const slugs = ['dachshund-gift-guide', 'personalized-dachshund-gifts', 'dog-lover-game-night'];

async function html(path) {
  const response = await fetch(new URL(path, base));
  assert.equal(response.status, 200, path);
  return response.text();
}

test('guides are linked from the homepage and hub, and present in the sitemap', async () => {
  const home = await html('/');
  const hub = await html('/guides');
  const sitemap = await html('/sitemap.xml');
  assert.ok(home.includes('href="/guides"'));
  assert.ok(hub.includes(`rel="canonical" href="${canonical}/guides"`));
  for (const slug of slugs) {
    assert.ok(home.includes(`href="/guides/${slug}"`));
    assert.ok(hub.includes(`href="/guides/${slug}"`));
    assert.ok(sitemap.includes(`<loc>${canonical}/guides/${slug}</loc>`));
  }
});

test('each guide has unique metadata, matching article schema, and working local links', async () => {
  const titles = new Set();
  const descriptions = new Set();
  for (const slug of slugs) {
    const path = `/guides/${slug}`;
    const page = await html(path);
    assert.equal([...page.matchAll(/<h1(?:\s[^>]*)?>/g)].length, 1);
    const title = page.match(/<title>(.*?)<\/title>/)?.[1];
    const description = page.match(/<meta name="description" content="([^"]+)"/)?.[1];
    assert.ok(title && description);
    titles.add(title);
    descriptions.add(description);
    assert.ok(page.includes(`rel="canonical" href="${canonical}${path}"`));
    assert.ok(page.includes(`property="og:url" content="${canonical}${path}"`));
    assert.ok(!page.includes('content="noindex'));
    const schemas = [...page.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(match => JSON.parse(match[1]));
    const graph = schemas.flatMap(schema => schema['@graph'] || [schema]);
    const article = graph.find(schema => schema['@type'] === 'Article');
    assert.ok(article);
    assert.equal(article.mainEntityOfPage, `${canonical}${path}`);
    assert.equal(article.datePublished, '2026-10-02');
    assert.equal(article.author.name, 'Doxie Dynasty');
    assert.ok(page.includes('This guide features our own game.'));
    assert.equal(graph.find(schema => schema['@type'] === 'BreadcrumbList').itemListElement.at(-1).item, `${canonical}${path}`);
    assert.ok(!graph.some(schema => ['Product', 'Review', 'AggregateRating'].includes(schema['@type'])), 'Editorial pages must not pretend to be independent reviews or product offers');
    assert.ok(page.includes('https://www.amazon.com/dp/B0H1NL53PX'));
    for (const link of new Set([...page.matchAll(/href="(\/(?!\/)[^"]*)"/g)].map(match => match[1]))) {
      const target = new URL(link, base);
      const response = await fetch(target);
      assert.equal(response.status, 200, `${path}: broken link ${link}`);
      if (target.hash) {
        const targetHtml = await response.text();
        assert.ok(targetHtml.includes(`id="${target.hash.slice(1)}"`), `Missing anchor ${link}`);
      }
    }
    for (const [, anchor] of page.matchAll(/href="#([^"]+)"/g)) assert.ok(page.includes(`id="${anchor}"`));
    for (const image of article.image) assert.equal((await fetch(new URL(new URL(image).pathname, base))).status, 200);
  }
  assert.equal(titles.size, slugs.length);
  assert.equal(descriptions.size, slugs.length);
});

test('unknown guide URLs return a genuine 404', async () => {
  assert.equal((await fetch(new URL('/guides/not-a-published-guide', base))).status, 404);
});
