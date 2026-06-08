import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isRateLimited } from '@/utils/rateLimit';

/**
 * Consulta de puntos de fidelización por DNI. Requiere la migración
 * 0005_loyalty_and_filters.sql aplicada.
 */
export async function POST(request: NextRequest) {
  try {
    const { dni } = (await request.json()) ?? {};
    const dniClean = typeof dni === 'string' ? dni.replace(/\D/g, '') : '';
    if (!/^\d{7,9}$/.test(dniClean)) {
      return NextResponse.json({ error: 'DNI inválido' }, { status: 400 });
    }

    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0].trim() || 'unknown';
    if (await isRateLimited(`loyalty:${dniClean}:${ip}`, { limit: 8, windowMs: 60_000 })) {
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

    const { data, error } = await supabase
      .from('loyalty_points')
      .select('points')
      .eq('customer_dni', dniClean)
      .single();

    // Sin fila => 0 puntos (no es error para el cliente).
    if (error && (error as { code?: string }).code !== 'PGRST116') {
      console.error('loyalty error:', error);
      return NextResponse.json({ error: 'Error al consultar puntos' }, { status: 500 });
    }

    return NextResponse.json({ success: true, points: data?.points ?? 0 });
  } catch (error) {
    console.error('loyalty error:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
