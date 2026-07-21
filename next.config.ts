import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    // Optimización: dispositivos específicos para evitar transformaciones innecesarias
    deviceSizes: [640, 960, 1280],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    // Formato: priorizar WebP (40% más pequeño)
    formats: ['image/webp', 'image/avif'],
    // Cache: 1 año para imágenes optimizadas
    minimumCacheTTL: 31536000,
    dangerouslyAllowSVG: true,
  },
};

export default nextConfig;
