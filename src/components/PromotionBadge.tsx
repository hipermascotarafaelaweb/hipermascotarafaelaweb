import { Promotion } from '@/types';
import { formatDiscount } from '@/utils/promotions';

interface PromotionBadgeProps {
  promotion: Promotion;
  className?: string;
}

export default function PromotionBadge({ promotion, className = '' }: PromotionBadgeProps) {
  const discount = formatDiscount(promotion);

  return (
    <div className={`inline-block px-2.5 py-1 bg-brand-700 text-white text-xs font-bold rounded-md shadow-sm ${className}`}>
      {discount || promotion.badge_label}
    </div>
  );
}
