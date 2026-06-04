import { createClient } from '@/utils/supabase/server';
import type { Promotion } from '@/types';
import PromotionsSection from './PromotionsSection';

export default async function PromotionsSectionServer() {
  let promotions: Promotion[] = [];

  try {
    const supabase = await createClient();
    const now = new Date().toISOString();

    const { data } = await supabase
      .from('promotions')
      .select('*')
      .eq('is_active', true)
      .lte('valid_from', now)
      .or(`valid_until.is.null,valid_until.gt.${now}`)
      .order('display_priority', { ascending: true })
      .order('created_at', { ascending: false });

    promotions = (data as Promotion[]) || [];
  } catch (error) {
    console.error('Error fetching promotions:', error);
    return null;
  }

  return <PromotionsSection promotions={promotions} />;
}
