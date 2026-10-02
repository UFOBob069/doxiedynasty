import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';
import { GUIDES, GUIDE_DATE } from '@/lib/guides';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/guides`, lastModified: new Date(GUIDE_DATE), changeFrequency: 'monthly', priority: 0.7 },
    ...GUIDES.map(guide => ({ url: `${SITE_URL}/guides/${guide.slug}`, lastModified: new Date(GUIDE_DATE), changeFrequency: 'monthly' as const, priority: 0.7, images: [`${SITE_URL}${guide.image}`] })),
    {
      url: `${SITE_URL}/product`,
      lastModified: new Date('2026-09-23'),
      changeFrequency: 'monthly',
      priority: 0.9,
      images: [`${SITE_URL}/box-product-mockup.webp`],
    },
    {
      url: `${SITE_URL}/gameplay`,
      lastModified: new Date('2026-09-19'),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: SITE_URL,
      lastModified: new Date('2026-10-02'),
      changeFrequency: 'monthly',
      priority: 1,
      images: [
        `${SITE_URL}/hero-game-night.webp`,
        `${SITE_URL}/box-product-mockup.webp`,
      ],
    },
  ];
}
