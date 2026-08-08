import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
      images: [
        `${SITE_URL}/hero-game-night.webp`,
        `${SITE_URL}/box-product-mockup.webp`,
      ],
    },
  ];
}
