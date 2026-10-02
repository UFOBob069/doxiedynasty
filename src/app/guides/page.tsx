import type { Metadata } from 'next';
import Link from 'next/link';
import GuideLinks from '@/components/GuideLinks';
import { GUIDES } from '@/lib/guides';
import { SITE_URL } from '@/lib/site';
import styles from './guides.module.css';

const title = 'Dachshund Gift Guides & Game-Night Ideas | Doxie Dynasty';
const description = 'Find a thoughtful gift for a dachshund lover, plan a personalized present, or host a Doxie Dynasty game night. Practical guides from Doxie Dynasty.';
export const metadata: Metadata = {
  title, description, alternates: { canonical: '/guides' },
  openGraph: { title, description, url: '/guides', type: 'website', images: ['/box-product-mockup.webp'] },
  twitter: { card: 'summary_large_image', title, description, images: ['/box-product-mockup.webp'] },
};

export default function GuidesPage() {
  const schema = {
    '@context': 'https://schema.org', '@type': 'CollectionPage', name: title, description, url: `${SITE_URL}/guides`,
    mainEntity: { '@type': 'ItemList', itemListElement: GUIDES.map((guide, index) => ({ '@type': 'ListItem', position: index + 1, name: guide.title, url: `${SITE_URL}/guides/${guide.slug}` })) },
  };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
    <nav className={styles.breadcrumbs} aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><span aria-current="page">Guides</span></nav>
    <p className={styles.kicker}>FROM DOXIE DYNASTY</p>
    <h1>Dachshund gifts &amp; game-night ideas</h1>
    <p className={styles.intro}>For the friend with a camera roll full of doxies, the hard-to-buy-for dog lover, and the host gathering everyone around the table. Find a gift that fits the person and an occasion to enjoy it.</p>
    <p className={styles.note}>These guides are published by Doxie Dynasty, the maker of the card game featured here. They are gift-planning ideas, not independent product rankings.</p>
    <GuideLinks headingLevel={2} />
    <p>Already have the game? <Link className={styles.textLink} href="/gameplay">Read the full rules and download the PDF</Link>.</p>
  </>;
}
