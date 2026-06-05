import { createClient } from '@supabase/supabase-js';
import type { Customer, CustomerInput } from '@/types';
import { isRateLimited } from '@/utils/rateLimit';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

function parseAddress(fullAddress: string | null): Partial<CustomerInput> {
  if (!fullAddress) {
    return { street: '', city: '', province: '', postal_code: '' };
  }

  // Formato esperado: "Calle Número, Ciudad, Provincia CodigoPostal"
  const parts = fullAddress.split(',').map(p => p.trim());

  let street = '';
  let city = '';
  let province = '';
  let postal_code = '';

  if (parts.length >= 1) street = parts[0];
  if (parts.length >= 2) city = parts[1];
  if (parts.length >= 3) {
    // La provincia y código postal están juntos en parts[2]
    const provincePostal = parts[2].match(/^(.+?)\s+(\d+)$/);
    if (provincePostal) {
      province = provincePostal[1];
      postal_code = provincePostal[2];
    } else {
      province = parts[2];
    }
  }

  return { street, city, province, postal_code };
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

    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0].trim() || 'unknown';
    if (await isRateLimited(`bydni:${dniClean}:${ip}`, { limit: 8, windowMs: 60_000 })) {
      return Response.json(
        { error: 'Demasiadas solicitudes. Intentá más tarde.' },
        { status: 429 }
      );
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

    const customer = data as Customer;
    const addressParts = parseAddress(customer.address);

    return Response.json(
      {
        customer: {
          first_name: customer.first_name,
          last_name: customer.last_name,
          dni: customer.dni,
          phone: customer.phone,
          ...addressParts,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('Error fetching customer:', err);
    return Response.json(
      { error: 'Error al buscar cliente' },
      { status: 500 }
    );
  }
}
