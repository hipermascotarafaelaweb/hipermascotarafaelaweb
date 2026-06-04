import Link from 'next/link';
import { Promotion } from '@/types';
import { formatDiscount } from '@/utils/promotions';

interface PromotionsSectionProps {
  promotions: Promotion[];
}

export default function PromotionsSection({ promotions }: PromotionsSectionProps) {
  if (!promotions || promotions.length === 0) {
    return null;
  }

  return (
    <section className="bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">
          Promociones
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {promotions.slice(0, 6).map((promotion) => (
            <Link
              key={promotion.id}
              href="/productos"
              className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="aspect-video bg-gradient-to-br from-brand-50 to-brand-100 relative flex items-center justify-center min-h-40">
                {promotion.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={promotion.image_url}
                    alt={promotion.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="text-center px-4">
                    <p className="text-sm text-brand-600 font-semibold mb-2">
                      {promotion.badge_label}
                    </p>
                  </div>
                )}

                {/* Discount Badge */}
                <div className="absolute top-3 right-3 bg-brand-500 text-white px-3 py-1 rounded-full font-bold text-sm">
                  {formatDiscount(promotion)}
                </div>
              </div>

              <div className="p-4 bg-white">
                <h3 className="font-bold text-gray-900 mb-2 group-hover:text-brand-600 transition-colors line-clamp-2">
                  {promotion.title}
                </h3>
                {promotion.description && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {promotion.description}
                  </p>
                )}
                <p className="text-sm font-semibold text-brand-600">
                  Ver promoción →
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
