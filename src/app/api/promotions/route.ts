import { createClient } from '@/utils/supabase/server';
import { Promotion, PromotionProduct } from '@/types';

export async function GET() {
  try {
    const supabase = await createClient();

    const now = new Date().toISOString();

    const { data: promotions, error } = await supabase
      .from('promotions')
      .select('*')
      .eq('is_active', true)
      .lte('valid_from', now)
      .or(`valid_until.is.null,valid_until.gt.${now}`)
      .order('display_priority', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw error;

    const { data: promotionProducts } = await supabase
      .from('promotion_products')
      .select('*');

    const { data: promotionCategories } = await supabase
      .from('promotion_categories')
      .select('*');

    const productPromotions = new Map<number, Promotion[]>();

    (promotionProducts || []).forEach((pp: PromotionProduct) => {
      const promotion = (promotions || []).find(p => p.id === pp.promotion_id);
      if (promotion) {
        if (!productPromotions.has(pp.product_id)) {
          productPromotions.set(pp.product_id, []);
        }
        productPromotions.get(pp.product_id)!.push(promotion);
      }
    });

    return Response.json({
      success: true,
      promotions: promotions || [],
      productPromotions: Object.fromEntries(productPromotions),
      promotionCategories: promotionCategories || [],
    });
  } catch (error) {
    console.error('Error fetching promotions:', error);
    return Response.json(
      { success: false, error: 'Failed to fetch promotions' },
      { status: 500 }
    );
  }
}
