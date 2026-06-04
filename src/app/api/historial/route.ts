import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const rateLimitMap = new Map<string, number[]>();

function getRateLimitKey(dni: string, ip: string): string {
  return `${dni}:${ip}`;
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const times = rateLimitMap.get(key) || [];

  const recentRequests = times.filter((t) => now - t < 60000);

  if (recentRequests.length >= 5) {
    return true;
  }

  recentRequests.push(now);
  rateLimitMap.set(key, recentRequests);

  if (rateLimitMap.size > 500) {
    const oldestKey = rateLimitMap.keys().next().value;
    if (oldestKey !== undefined) {
      rateLimitMap.delete(oldestKey);
    }
  }

  return false;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dni, phone } = body;

    if (!dni || typeof dni !== 'string') {
      return NextResponse.json(
        { error: 'DNI requerido' },
        { status: 400 }
      );
    }

    if (!/^\d{7,9}$/.test(dni)) {
      return NextResponse.json(
        { error: 'DNI inválido' },
        { status: 400 }
      );
    }

    if (!phone || typeof phone !== 'string' || phone.trim().length < 10) {
      return NextResponse.json(
        { error: 'Teléfono requerido y válido' },
        { status: 400 }
      );
    }

    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0].trim() || 'unknown';
    const key = getRateLimitKey(dni, ip);

    if (isRateLimited(key)) {
      return NextResponse.json(
        { error: 'Demasiadas solicitudes. Intenta más tarde.' },
        { status: 429 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Verificar que DNI + teléfono coincidan en al menos un pedido
    // (segundo factor de autenticación)
    const { data: verified, error: verifyError } = await supabase
      .from('orders')
      .select('id')
      .eq('customer_dni', dni)
      .eq('customer_phone', phone)
      .limit(1);

    if (verifyError || !verified || verified.length === 0) {
      return NextResponse.json(
        { error: 'DNI o teléfono no coinciden con nuestros registros' },
        { status: 401 }
      );
    }

    const { data: orders, error } = await supabase
      .from('orders')
      .select('id, customer_dni, created_at, total_amount, status')
      .eq('customer_dni', dni)
      .eq('customer_phone', phone)
      .eq('status', 'Entregado')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      return NextResponse.json(
        { error: 'Error al buscar pedidos' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      orders: orders || [],
    });
  } catch (error) {
    console.error('historial error:', error);
    return NextResponse.json(
      { error: 'Error al procesar solicitud' },
      { status: 500 }
    );
  }
}
