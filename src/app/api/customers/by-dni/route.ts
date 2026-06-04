import { createClient } from '@supabase/supabase-js';
import type { Customer } from '@/types';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );
}

export async function POST(req: Request) {
  try {
    const { dni } = await req.json();

    if (!dni || typeof dni !== 'string') {
      return Response.json({ error: 'DNI requerido' }, { status: 400 });
    }

    const dniClean = dni.replace(/\D/g, '');
    if (!/^\d{7,9}$/.test(dniClean)) {
      return Response.json({ error: 'DNI inválido' }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('dni', dniClean)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return Response.json({ customer: null }, { status: 200 });
      }
      throw error;
    }

    return Response.json({ customer: data as Customer }, { status: 200 });
  } catch (err) {
    console.error('Error fetching customer:', err);
    return Response.json(
      { error: 'Error al buscar cliente' },
      { status: 500 }
    );
  }
}
