import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';
import GuideLinks from '@/components/GuideLinks';
import { GUIDES, GUIDE_DATE } from '@/lib/guides';
import { SITE_URL } from '@/lib/site';
import { PRODUCT } from '@/lib/product-catalog';
import styles from '../guides.module.css';

type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export function generateStaticParams() { return GUIDES.map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = GUIDES.find(item => item.slug === slug);
  if (!guide) notFound();
  const title = `${guide.title} | Doxie Dynasty`;
  return {
    title, description: guide.description, alternates: { canonical: `/guides/${slug}` },
    openGraph: { title, description: guide.description, type: 'article', url: `/guides/${slug}`, publishedTime: GUIDE_DATE, modifiedTime: GUIDE_DATE, images: [{ url: guide.image, alt: guide.imageAlt }] },
    twitter: { card: 'summary_large_image', title, description: guide.description, images: [guide.image] },
  };
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = GUIDES.find(item => item.slug === slug);
  if (!guide) notFound();
  const url = `${SITE_URL}/guides/${slug}`;
  const schema = {
    '@context': 'https://schema.org', '@graph': [
      { '@type': 'Article', '@id': `${url}#article`, headline: guide.title, description: guide.description, image: [`${SITE_URL}${guide.image}`], datePublished: GUIDE_DATE, dateModified: GUIDE_DATE, mainEntityOfPage: url, author: { '@type': 'Organization', name: 'Doxie Dynasty', url: SITE_URL }, publisher: { '@type': 'Organization', name: 'Doxie Dynasty', url: SITE_URL } },
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Guides', item: `${SITE_URL}/guides` },
        { '@type': 'ListItem', position: 3, name: guide.title, item: url },
      ] },
    ],
  };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
    <nav className={styles.breadcrumbs} aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><Link href="/guides">Guides</Link><span aria-hidden="true">/</span><span aria-current="page">{guide.category === 'GAME NIGHT' ? 'Game night' : 'Gift ideas'}</span></nav>
    <article>
      <header>
        <p className={styles.kicker}>{guide.category}</p><h1>{guide.title}</h1>
        <p className={styles.intro}>{guide.intro}</p>
        <p className={styles.byline}>By <Link className={styles.textLink} href="/">Doxie Dynasty</Link> | <time dateTime={GUIDE_DATE}>October 2, 2026</time><br />From the maker of Doxie Dynasty. This guide features our own game.</p>
      </header>
      <details className={styles.mobileContents}><summary>In this guide</summary><nav aria-label="On this page (mobile)">{guide.sections.map(section => <a key={section.id} href={`#${section.id}`}>{section.title}</a>)}</nav></details>
      <div className={styles.columns}>
        <div className={styles.article}>
          {guide.sections.map(section => <section id={section.id} key={section.id} aria-labelledby={`${section.id}-title`}>
            <h2 id={`${section.id}-title`}>{section.title}</h2>
            {section.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
            {section.checklist && <ul>{section.checklist.map(item => <li key={item}>{item}</li>)}</ul>}
            {section.link && <p><Link className={styles.textLink} href={section.link.href}>{section.link.label}</Link></p>}
          </section>)}
          <section aria-labelledby="questions"><h2 id="questions">A few common questions</h2>
            {guide.questions.map(item => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}
          </section>
        </div>
        <aside className={styles.aside} aria-label="Guide contents and game">
          <h2>In this guide</h2><nav aria-label="On this page">{guide.sections.map(section => <a key={section.id} href={`#${section.id}`}>{section.title}</a>)}</nav>
          <figure><Image src={guide.image} alt={guide.imageAlt} width={400} height={500} sizes="270px" /><figcaption>{guide.imageAlt}.</figcaption></figure>
          <h2>Doxie Dynasty</h2><p>90 cards. 2-6 players.<br />A typical game: 20-30 minutes.</p>
          <a className={`button button-gold ${styles.purchase}`} href={PRODUCT.amazonUrl} target="_blank" rel="noopener noreferrer">Buy on Amazon <ArrowUpRight size={17} aria-hidden="true" /></a>
          <Link className={styles.textLink} href="/product">Product details &amp; direct orders</Link><br />
          <Link className={styles.textLink} href="/gameplay">How to play &amp; rules PDF</Link>
        </aside>
      </div>
    </article>
    <section className={styles.related} aria-labelledby="related-title"><h2 id="related-title">Keep exploring</h2><GuideLinks exclude={slug} /></section>
  </>;
}
