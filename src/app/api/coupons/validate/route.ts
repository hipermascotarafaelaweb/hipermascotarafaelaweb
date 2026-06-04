import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Código requerido' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('id, code, discount_percent, max_uses, uses_count, valid_from, valid_until, active, created_at')
      .eq('code', code.toUpperCase())
      .eq('active', true)
      .single();

    if (error || !coupon) {
      return NextResponse.json({ error: 'Código inválido.' }, { status: 404 });
    }

    if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
      return NextResponse.json({ error: 'Cupón expirado.' }, { status: 400 });
    }

    if (coupon.max_uses && coupon.uses_count >= coupon.max_uses) {
      return NextResponse.json({ error: 'Cupón agotado.' }, { status: 400 });
    }

    // Solo exponemos lo que el carrito necesita. No filtramos uses_count /
    // max_uses / id: la validación de cupo y expiración ya se hizo arriba.
    return NextResponse.json({
      success: true,
      coupon: {
        code: coupon.code,
        discount_percent: coupon.discount_percent,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Error al validar cupón' }, { status: 500 });
  }
}
