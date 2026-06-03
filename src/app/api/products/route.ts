import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('name');

    if (error) throw error;

    return Response.json({
      success: true,
      products: products || [],
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return Response.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
