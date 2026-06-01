import type { MetadataRoute } from 'next';
import { SITE } from '@/config/site';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE.url, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE.url}/productos`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE.url}/historial`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE.url}/contacto`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE.url}/privacidad`, changeFrequency: 'yearly', priority: 0.2 },
  ];
}
