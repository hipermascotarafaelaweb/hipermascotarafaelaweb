import { createClient } from '@/utils/supabase/server';
import { requireAdmin } from '@/utils/supabase/requireAdmin';

interface ProductRow {
  id: number;
  name: string;
  stock: number;
  low_stock_threshold: number | null;
}
interface VelocityRow {
  product_id: number;
  sold_30d: number;
}

/**
 * Alertas de bajo stock con reposición sugerida (velocidad de venta de 30 días
 * menos stock actual). Solo admin. Requiere la migración 0004_inventory.sql.
 */
export async function GET() {
  try {
    const supabase = await createClient();

    const guard = await requireAdmin(supabase);
    if (!guard.ok) {
      return Response.json({ success: false, error: guard.error }, { status: guard.status });
    }

    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, stock, low_stock_threshold');
    if (error) throw error;

    const { data: velocity } = await supabase
      .from('product_sales_velocity')
      .select('product_id, sold_30d');

    const soldByProduct = new Map<number, number>(
      ((velocity as VelocityRow[]) || []).map((v) => [v.product_id, Number(v.sold_30d) || 0])
    );

    const alerts = ((products as ProductRow[]) || [])
      .map((p) => {
        const threshold = p.low_stock_threshold ?? 5;
        const sold30d = soldByProduct.get(p.id) ?? 0;
        return {
          id: p.id,
          name: p.name,
          stock: p.stock,
          threshold,
          sold30d,
          // Reponer al menos para cubrir la venta proyectada del próximo período.
          suggested: Math.max(0, sold30d - p.stock),
        };
      })
      .filter((p) => p.stock <= p.threshold)
      .sort((a, b) => b.sold30d - a.sold30d);

    return Response.json({ success: true, alerts });
  } catch (error) {
    console.error('inventory alerts error:', error);
    return Response.json(
      { success: false, error: 'Failed to load inventory alerts' },
      { status: 500 }
    );
  }
}
