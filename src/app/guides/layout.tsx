import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { PRODUCT } from '@/lib/product-catalog';
import styles from './guides.module.css';

export default function GuidesLayout({ children }: { children: React.ReactNode }) {
  return <div className={styles.page}>
    <a className={styles.skip} href="#guide-content">Skip to guide</a>
    <header className="site-header home-header">
      <Link className="brand" href="/" aria-label="Doxie Dynasty home"><span className="brand-lockup"><Image src="/cards/box-side.webp" alt="Doxie Dynasty Card Game" width={420} height={190} priority /></span></Link>
      <nav aria-label="Main navigation"><Link href="/product">The game</Link><Link href="/guides">Gift guides</Link><Link href="/gameplay">How to play</Link></nav>
      <a className="nav-cta" href={PRODUCT.amazonUrl} target="_blank" rel="noopener noreferrer">Buy on Amazon <ArrowUpRight size={17} aria-hidden="true" /></a>
    </header>
    <main className={styles.main} id="guide-content">{children}</main>
    <footer className={styles.footer}>
      <Link href="/">Doxie Dynasty</Link><Link href="/guides">Gift guides</Link><Link href="/product">Product details</Link><Link href="/gameplay">How to play</Link><a href={PRODUCT.rulesPdfUrl} download>Rules PDF</a><a href={`mailto:${PRODUCT.supportEmail}`}>Contact</a>
    </footer>
  </div>;
}
