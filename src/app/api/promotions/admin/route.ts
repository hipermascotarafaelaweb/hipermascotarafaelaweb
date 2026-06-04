import { createClient } from '@/utils/supabase/server';
import { requireAdmin } from '@/utils/supabase/requireAdmin';

export async function GET() {
  try {
    const supabase = await createClient();

    const guard = await requireAdmin(supabase);
    if (!guard.ok) {
      return Response.json({ success: false, error: guard.error }, { status: guard.status });
    }

    const { data: promotions, error } = await supabase
      .from('promotions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const { data: promotionProducts } = await supabase
      .from('promotion_products')
      .select('promotion_id, product_id');

    const { data: promotionCategories } = await supabase
      .from('promotion_categories')
      .select('promotion_id, category_id');

    const enriched = (promotions || []).map(p => ({
      ...p,
      product_ids: (promotionProducts || [])
        .filter(pp => pp.promotion_id === p.id)
        .map(pp => pp.product_id),
      category_ids: (promotionCategories || [])
        .filter(pc => pc.promotion_id === p.id)
        .map(pc => pc.category_id),
    }));

    return Response.json({ success: true, promotions: enriched });
  } catch (error) {
    console.error('Error fetching promotions:', error);
    return Response.json(
      { success: false, error: 'Failed to fetch promotions' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const guard = await requireAdmin(supabase);
    if (!guard.ok) {
      return Response.json({ success: false, error: guard.error }, { status: guard.status });
    }

    const body = await request.json();

    const {
      title,
      description,
      discount_type,
      discount_percent,
      discount_fixed,
      image_url,
      badge_label,
      display_priority,
      is_active,
      valid_from,
      valid_until,
    } = body;

    // Validación básica
    if (!title || !title.trim()) {
      return Response.json(
        { success: false, error: 'El título es requerido' },
        { status: 400 }
      );
    }

    if (!discount_type || (discount_type === 'percent' && !discount_percent) || (discount_type === 'fixed' && !discount_fixed)) {
      return Response.json(
        { success: false, error: 'Especifica un descuento válido' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('promotions')
      .insert([
        {
          title,
          description,
          discount_type,
          discount_percent: discount_type === 'percent' ? discount_percent : null,
          discount_fixed: discount_type === 'fixed' ? discount_fixed : null,
          image_url,
          badge_label,
          display_priority,
          is_active,
          valid_from: valid_from && valid_from.trim() ? valid_from : new Date().toISOString(),
          valid_until: valid_until && valid_until.trim() ? valid_until : null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw new Error(error.message || 'Error al insertar promoción');
    }

    return Response.json({ success: true, promotion: data }, { status: 201 });
  } catch (error) {
    console.error('Error creating promotion:', error);
    let message = 'Failed to create promotion';
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'object' && error !== null && 'message' in error) {
      message = String((error as { message: unknown }).message);
    }
    return Response.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();

    const guard = await requireAdmin(supabase);
    if (!guard.ok) {
      return Response.json({ success: false, error: guard.error }, { status: guard.status });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    const updateData: Record<string, unknown> = { ...updates };
    if (updates.discount_type === 'percent') {
      updateData.discount_fixed = null;
    } else if (updates.discount_type === 'fixed') {
      updateData.discount_percent = null;
    }

    const { data, error } = await supabase
      .from('promotions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return Response.json({ success: true, promotion: data });
  } catch (error) {
    console.error('Error updating promotion:', error);
    const message = error instanceof Error ? error.message : 'Failed to update promotion';
    return Response.json(
      { success: false, error: message },
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

    const { id } = await request.json();

    const { error } = await supabase.from('promotions').delete().eq('id', id);

    if (error) throw error;

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting promotion:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete promotion';
    return Response.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
