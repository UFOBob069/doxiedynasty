import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, BookOpen, Download } from 'lucide-react';
import { DOXIE_DYNASTY } from '@/lib/doxie-product';
import { PRODUCT, PRODUCT_FACTS, PRODUCT_JSON_LD } from '@/lib/product-catalog';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Doxie Dynasty Card Game | Product Details, Rules & Buying',
  description: PRODUCT.description,
  alternates: { canonical: '/product', types: { 'application/ld+json': '/product.json' } },
  openGraph: {
    title: DOXIE_DYNASTY.NAME,
    description: PRODUCT.description,
    url: '/product',
    images: [{ url: PRODUCT.images[0], alt: 'Doxie Dynasty card game box' }],
  },
};

export default function ProductPage() {
  return (
    <div className={styles.page}>
      <a className={styles.skip} href="#product-details">Skip to product details</a>
      <header className="site-header home-header">
        <Link className="brand" href="/" aria-label="Doxie Dynasty home">
          <span className="brand-lockup"><Image src="/cards/box-side.webp" alt="Doxie Dynasty Card Game" width={420} height={190} priority /></span>
        </Link>
        <nav aria-label="Main navigation">
          <Link href="/">The game</Link>
          <Link href="/gameplay">How to play</Link>
          <a href={`mailto:${PRODUCT.supportEmail}`}>Contact</a>
        </nav>
        <a className="nav-cta" href={PRODUCT.amazonUrl} target="_blank" rel="noopener noreferrer">Buy on Amazon <ArrowUpRight size={17} aria-hidden="true" /></a>
      </header>

      <main className={styles.main} id="product-details">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(PRODUCT_JSON_LD).replace(/</g, '\\u003c') }} />
        <p className={styles.kicker}>THE GAME AT A GLANCE</p>
        <h1>{DOXIE_DYNASTY.NAME}</h1>
        <p className={styles.lede}>{PRODUCT.description}</p>

        <div className={styles.details}>
          <figure className={styles.photo}>
            <Image src="/box-product-mockup.webp" alt="Doxie Dynasty physical card game box" width={800} height={800} sizes="(max-width: 700px) 90vw, 380px" priority />
            <figcaption className={styles.note}>Older packaging pictured. The full rules also cover the 84-card edition without Wilds.</figcaption>
          </figure>
          <div>
            <h2>Inside the deck</h2>
            <dl className={styles.facts}>
              {PRODUCT_FACTS.map(([name, value]) => <div key={name}><dt>{name}</dt><dd>{value}</dd></div>)}
            </dl>
            <p><Link href="/gameplay#checklist">See every card name</Link>, or explore the <Link href="/gameplay">complete rules</Link>.</p>
          </div>
        </div>

        <section className={styles.section} id="buy" aria-labelledby="buy-title">
          <h2 id="buy-title">Bring home Doxie Dynasty</h2>
          <p>A game-night choice for dachshund lovers, dog owners, and friends who enjoy collecting sets and playful competition.</p>
          <div className={styles.actions}>
            <a className="button button-gold" href={PRODUCT.amazonUrl} target="_blank" rel="noopener noreferrer">Buy on Amazon <ArrowUpRight size={18} aria-hidden="true" /></a>
            <Link className={styles.secondary} href="/checkout"><span>{`Buy direct: $${PRODUCT.price} ${PRODUCT.currency} per deck`}</span> <ArrowUpRight size={18} aria-hidden="true" /></Link>
          </div>
          <p className={styles.note}>Direct orders: {PRODUCT.availability.label}. Amazon shows its own current price, availability, shipping, and return terms. Direct orders use Stripe checkout, with {DOXIE_DYNASTY.MIN_QUANTITY}-{DOXIE_DYNASTY.MAX_QUANTITY} decks per order. Confirm the final total at checkout.</p>
        </section>

        <section className={styles.section} aria-labelledby="rules-title">
          <h2 id="rules-title">Learn to play</h2>
          <p>Deal 7 cards each. Draw 1, play Doxies face up and use special cards, then discard 1. Make sets of exactly 3 sharing a fur type, color, or pattern. Finish the turn that empties the draw deck, then count points. Only played cards score.</p>
          <div className={styles.actions}>
            <Link href="/gameplay"><BookOpen size={19} aria-hidden="true" /> Read the full rules</Link>
            <a href={PRODUCT.rulesPdfUrl} download><Download size={19} aria-hidden="true" /> Download rules PDF</a>
          </div>
          <p className={styles.note}>The full guide covers the 90-card deck and explains how to use an older 84-card deck without Wilds.</p>
        </section>

        <section className={styles.section} id="shipping-returns" aria-labelledby="shipping-title">
          <h2 id="shipping-title">Direct-order shipping &amp; returns</h2>
          <dl className={styles.facts}>
            <div><dt>Price</dt><dd>${PRODUCT.price} {PRODUCT.currency} per deck</dd></div>
            <div><dt>Availability</dt><dd>{PRODUCT.availability.label}</dd></div>
            <div><dt>Shipping</dt><dd>Free to U.S. addresses only</dd></div>
            <div><dt>Estimated delivery</dt><dd>{DOXIE_DYNASTY.SHIPPING_DAYS} business days</dd></div>
            <div><dt>Returns</dt><dd>Accepted within {DOXIE_DYNASTY.RETURN_DAYS} days of delivery</dd></div>
          </dl>
          <p>For return instructions or help with a direct order, email <a href={`mailto:${PRODUCT.supportEmail}`}>{PRODUCT.supportEmail}</a>. For Amazon orders, use the order support and return options on Amazon.</p>
        </section>
      </main>

      <footer className={styles.footer}>
        <Link href="/">Doxie Dynasty</Link>
        <Link href="/gameplay">How to play</Link>
        <a href={PRODUCT.rulesPdfUrl} download>Rules PDF</a>
        <a href="/product.json">Product data</a>
        <a href={`mailto:${PRODUCT.supportEmail}`}>Contact</a>
      </footer>
    </div>
  );
}
