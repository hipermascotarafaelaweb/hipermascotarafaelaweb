import { createClient } from '@/utils/supabase/server';
import PromotionsSection from './PromotionsSection';

export default async function PromotionsSectionServer() {
  try {
    const supabase = await createClient();
    const now = new Date().toISOString();

    const { data: promotions } = await supabase
      .from('promotions')
      .select('*')
      .eq('is_active', true)
      .lte('valid_from', now)
      .or(`valid_until.is.null,valid_until.gt.${now}`)
      .order('display_priority', { ascending: true })
      .order('created_at', { ascending: false });

    return <PromotionsSection promotions={promotions || []} />;
  } catch (error) {
    console.error('Error fetching promotions:', error);
    return null;
  }
}
