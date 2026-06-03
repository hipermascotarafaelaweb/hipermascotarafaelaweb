import { Promotion } from '@/types';

export function isPromotionActive(promotion: Promotion): boolean {
  const now = new Date();
  const validFrom = new Date(promotion.valid_from);
  const validUntil = promotion.valid_until ? new Date(promotion.valid_until) : null;

  return (
    promotion.is_active &&
    validFrom <= now &&
    (!validUntil || validUntil > now)
  );
}

export function applyPromotionDiscount(price: number, promotion: Promotion): number {
  if (promotion.discount_type === 'percent' && promotion.discount_percent) {
    return Math.round(price * (1 - promotion.discount_percent / 100) * 100) / 100;
  }
  if (promotion.discount_type === 'fixed' && promotion.discount_fixed) {
    return Math.max(0, price - promotion.discount_fixed);
  }
  return price;
}

export function getDiscountAmount(price: number, promotion: Promotion): number {
  if (promotion.discount_type === 'percent' && promotion.discount_percent) {
    return Math.round((price * promotion.discount_percent) / 100 * 100) / 100;
  }
  if (promotion.discount_type === 'fixed' && promotion.discount_fixed) {
    return Math.min(price, promotion.discount_fixed);
  }
  return 0;
}

export function formatDiscount(promotion: Promotion): string {
  if (promotion.discount_type === 'percent' && promotion.discount_percent) {
    return `-${promotion.discount_percent}%`;
  }
  if (promotion.discount_type === 'fixed' && promotion.discount_fixed) {
    return `$${promotion.discount_fixed.toFixed(0)}`;
  }
  return '';
}
