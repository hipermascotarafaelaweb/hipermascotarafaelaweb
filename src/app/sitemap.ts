import type { MetadataRoute } from 'next';

const BASE = 'https://hipermascotarafaelaweb.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/productos`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/contacto`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/privacidad`, changeFrequency: 'yearly', priority: 0.2 },
  ];
}
