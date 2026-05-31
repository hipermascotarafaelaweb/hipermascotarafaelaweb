import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import type { CartItem, CustomerInput, Coupon } from '@/types';
import { Resend } from 'resend';

const RATE_LIMIT_REQUESTS = 5;
const RATE_LIMIT_WINDOW_MS = 3600000; // 1 hour
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded?.split(',')[0].trim() || 'unknown';
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT_REQUESTS) {
    return false;
  }

  entry.count++;
  return true;
}

async function sendOrderEmail(
  orderData: {
    id: number;
    customer_name: string;
    customer_phone: string;
    customer_address: string;
    items: Array<{ name: string; qty: number; price: number }>;
    total_amount: number;
    coupon_code: string | null;
    coupon_discount: number;
  }
) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const ownerEmail = process.env.NEXT_PUBLIC_OWNER_EMAIL || 'owner@hipermascota.com';

  if (!resendApiKey) {
    console.log('Resend API key not configured, skipping email notification');
    return;
  }

  try {
    const resend = new Resend(resendApiKey);

    const itemsList = orderData.items
      .map((item) => `${item.qty}x ${item.name} - $${item.price}`)
      .join('\n');

    const emailContent = `
Nuevo Pedido #${orderData.id}

Cliente: ${orderData.customer_name}
Teléfono: ${orderData.customer_phone}
Dirección: ${orderData.customer_address}

Productos:
${itemsList}

Subtotal: $${(orderData.total_amount + orderData.coupon_discount).toFixed(2)}
${orderData.coupon_code ? `Descuento (${orderData.coupon_code}): -$${orderData.coupon_discount.toFixed(2)}` : ''}
Total: $${orderData.total_amount.toFixed(2)}

Envío: Gratis
Estado: Pendiente
    `.trim();

    await resend.emails.send({
      from: 'pedidos@hipermascota.com',
      to: ownerEmail,
      subject: `Nuevo Pedido #${orderData.id} - Hipermascota Rafaela`,
      text: emailContent,
    });
  } catch (error) {
    console.error('Failed to send order email:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Demasiados pedidos. Esperá un poco antes de hacer otro pedido.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { items, customer, coupon, finalTotal, couponDiscount } = body;

    if (!items || !customer || finalTotal === undefined) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    const supabase = await createClient();

    // Create the order
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_name: `${customer.first_name} ${customer.last_name}`,
        customer_dni: customer.dni,
        customer_phone: customer.phone,
        customer_address: customer.address,
        items: items.map((i: CartItem) => ({
          product_id: i.product.id,
          name: i.product.name,
          qty: i.quantity,
          price: i.product.price,
        })),
        total_amount: finalTotal,
        coupon_code: coupon?.code || null,
        coupon_discount: couponDiscount || 0,
        status: 'Pendiente',
      })
      .select()
      .single();

    if (orderError || !orderData) {
      console.error('Order creation error:', orderError);
      return NextResponse.json({ error: 'Error al crear el pedido' }, { status: 500 });
    }

    // Save customer
    await supabase.from('customers').upsert(
      {
        dni: customer.dni,
        first_name: customer.first_name,
        last_name: customer.last_name,
        phone: customer.phone,
        address: customer.address,
      },
      { onConflict: 'dni', ignoreDuplicates: true }
    );

    // Increment coupon usage
    if (coupon?.id) {
      await supabase
        .from('coupons')
        .update({ uses_count: coupon.uses_count + 1 })
        .eq('id', coupon.id);
    }

    // Send email notification (best-effort, doesn't block response)
    sendOrderEmail(orderData);

    return NextResponse.json(
      { orderId: orderData.id, success: true },
      { status: 201 }
    );
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
