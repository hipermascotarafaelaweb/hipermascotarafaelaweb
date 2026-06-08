import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isRateLimited } from '@/utils/rateLimit';

/**
 * Alta de una suscripción recurrente ("Plan Manada"). Usa service-role (igual
 * que checkout) para insertar saltándose RLS, con validación explícita.
 * Requiere la migración 0003_subscriptions.sql aplicada.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dni, product_id, qty = 1, every_days } = body ?? {};

    const dniClean = typeof dni === 'string' ? dni.replace(/\D/g, '') : '';
    if (!/^\d{7,9}$/.test(dniClean)) {
      return NextResponse.json({ error: 'DNI inválido' }, { status: 400 });
    }

    const productId = Number(product_id);
    if (!Number.isInteger(productId) || productId <= 0) {
      return NextResponse.json({ error: 'Producto inválido' }, { status: 400 });
    }

    const quantity = Number(qty);
    if (!Number.isInteger(quantity) || quantity < 1) {
      return NextResponse.json({ error: 'Cantidad inválida' }, { status: 400 });
    }

    const days = Number(every_days);
    if (!Number.isInteger(days) || days < 7 || days > 120) {
      return NextResponse.json(
        { error: 'Frecuencia inválida (7 a 120 días)' },
        { status: 400 }
      );
    }

    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0].trim() || 'unknown';
    if (await isRateLimited(`subs:${dniClean}:${ip}`, { limit: 5, windowMs: 60_000 })) {
      return NextResponse.json(
        { error: 'Demasiadas solicitudes. Intentá más tarde.' },
        { status: 429 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      { auth: { persistSession: false, autoRefreshToken: false } }
    );

    const nextAt = new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);

    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        customer_dni: dniClean,
        product_id: productId,
        qty: quantity,
        every_days: days,
        next_at: nextAt,
        active: true,
      })
      .select('id, next_at')
      .single();

    if (error || !data) {
      console.error('subscriptions insert error:', error);
      return NextResponse.json({ error: 'No se pudo crear la suscripción' }, { status: 500 });
    }

    return NextResponse.json({ success: true, subscription: data }, { status: 201 });
  } catch (error) {
    console.error('subscriptions error:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
