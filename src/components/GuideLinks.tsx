import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { GUIDES } from '@/lib/guides';
import styles from '@/app/guides/guides.module.css';

export default function GuideLinks({ exclude, headingLevel = 3 }: { exclude?: string; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  return <div className={styles.list}>
    {GUIDES.filter(guide => guide.slug !== exclude).map(guide => (
      <Link className={styles.guideRow} href={`/guides/${guide.slug}`} key={guide.slug}>
        <Image src={guide.image} alt={guide.imageAlt} width={150} height={160} sizes="(max-width: 620px) 76px, 150px" />
        <div><Heading>{guide.title}</Heading><p>{guide.description}</p></div>
        <ArrowRight size={24} aria-hidden="true" />
      </Link>
    ))}
  </div>;
}
