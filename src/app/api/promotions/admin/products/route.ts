import { createClient } from '@/utils/supabase/server';
import { requireAdmin } from '@/utils/supabase/requireAdmin';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const guard = await requireAdmin(supabase);
    if (!guard.ok) {
      return Response.json({ success: false, error: guard.error }, { status: guard.status });
    }

    const { promotion_id, product_ids } = await request.json();

    const records = product_ids.map((product_id: number) => ({
      promotion_id,
      product_id,
    }));

    const { error } = await supabase
      .from('promotion_products')
      .insert(records)
      .select();

    if (error) throw error;

    return Response.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Error linking products:', error);
    return Response.json(
      { success: false, error: 'Failed to link products' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();

    const guard = await requireAdmin(supabase);
    if (!guard.ok) {
      return Response.json({ success: false, error: guard.error }, { status: guard.status });
    }

    const { promotion_id, product_id } = await request.json();

    const { error } = await supabase
      .from('promotion_products')
      .delete()
      .eq('promotion_id', promotion_id)
      .eq('product_id', product_id);

    if (error) throw error;

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error unlinking product:', error);
    return Response.json(
      { success: false, error: 'Failed to unlink product' },
      { status: 500 }
    );
  }
}
