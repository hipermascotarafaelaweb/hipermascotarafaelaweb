import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { isPromotionActive, applyPromotionDiscount } from '@/utils/promotions';
import type { Promotion } from '@/types';

interface CartItem {
  product_id: number;
  name: string;
  qty: number;
  price: number;
}

const RATE_LIMIT_REQUESTS = 5;
const RATE_LIMIT_WINDOW_MS = 3600000;
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

  if (rateLimitMap.size > 500) {
    const firstKey = rateLimitMap.keys().next().value;
    if (firstKey !== undefined) {
      rateLimitMap.delete(firstKey);
    }
  }

  return true;
}

function asInt(value: unknown): number {
  const num = typeof value === 'number' ? value : parseInt(String(value), 10);
  if (!Number.isInteger(num) || num < 0) {
    throw new Error('Invalid integer value');
  }
  return num;
}

function getSupabase(useServiceRole: boolean = true) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = useServiceRole
    ? process.env.SUPABASE_SERVICE_ROLE_KEY
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Missing Supabase configuration');
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function sendOrderEmail(orderData: {
  id: number;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  items: CartItem[];
  total_amount: number;
  coupon_code: string | null;
  coupon_discount: number;
}) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const ownerEmail = process.env.NEXT_PUBLIC_OWNER_EMAIL || 'owner@hipermascota.com';

  if (!resendApiKey) {
    console.log('Resend API key not configured, skipping email');
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
    console.error('Email error:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Demasiados pedidos. Esperá un poco.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { items, customer, couponCode } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Carrito vacío' }, { status: 400 });
    }

    if (!customer || typeof customer !== 'object') {
      return NextResponse.json({ error: 'Datos del cliente inválidos' }, { status: 400 });
    }

    if (!/^\d{7,9}$/.test(customer.dni)) {
      return NextResponse.json({ error: 'DNI inválido' }, { status: 400 });
    }

    if (
      !customer.first_name ||
      !customer.last_name ||
      !customer.phone ||
      !customer.street ||
      !customer.city ||
      !customer.province ||
      !customer.postal_code
    ) {
      return NextResponse.json(
        { error: 'Datos del cliente incompletos' },
        { status: 400 }
      );
    }

    const fullAddress = `${customer.street}, ${customer.city}, ${customer.province} ${customer.postal_code}`;

    const supabase = getSupabase();

    const productIds = items.map((i: { product_id: unknown }) => asInt(i.product_id));

    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price, sale_price')
      .in('id', productIds);

    if (productsError || !products) {
      return NextResponse.json(
        { error: 'Error al validar productos' },
        { status: 500 }
      );
    }

    const productMap = new Map(products.map((p) => [p.id, p]));

    // Promociones activas vinculadas a estos productos, para aplicar el
    // descuento server-side y que el total cobrado coincida con el carrito.
    const promoByProduct = new Map<number, Promotion>();
    const { data: promoLinks } = await supabase
      .from('promotion_products')
      .select('product_id, promotion_id')
      .in('product_id', productIds);

    if (promoLinks && promoLinks.length > 0) {
      const promoIds = [...new Set(promoLinks.map((l) => l.promotion_id))];
      const { data: promos } = await supabase
        .from('promotions')
        .select('*')
        .in('id', promoIds);
      const promosById = new Map(
        ((promos as Promotion[]) || []).map((p) => [p.id, p])
      );
      for (const link of promoLinks) {
        const promo = promosById.get(link.promotion_id);
        if (promo && isPromotionActive(promo)) {
          promoByProduct.set(link.product_id, promo);
        }
      }
    }

    let subtotal = 0;
    const orderItems: CartItem[] = [];

    for (const item of items) {
      const productId = asInt(item.product_id);
      const qty = asInt(item.qty);
      const product = productMap.get(productId);

      if (!product) {
        return NextResponse.json(
          { error: `Producto ${productId} no encontrado` },
          { status: 400 }
        );
      }

      const base = product.sale_price ?? product.price;
      const promo = promoByProduct.get(productId);
      const price = promo
        ? Math.min(base, Math.round(applyPromotionDiscount(product.price, promo)))
        : base;
      subtotal += price * qty;

      orderItems.push({
        product_id: productId,
        name: product.name,
        qty,
        price,
      });
    }

    let couponDiscount = 0;

    if (couponCode && typeof couponCode === 'string') {
      const { data: coupon, error: couponError } = await supabase
        .from('coupons')
        .select('id, discount_percent, max_uses, uses_count')
        .eq('code', couponCode)
        .eq('active', true)
        .single();

      if (couponError || !coupon) {
        return NextResponse.json({ error: 'Cupón inválido' }, { status: 400 });
      }

      const { error: incError } = await supabase.rpc(
        'increment_coupon_use',
        { coupon_id: coupon.id }
      );

      if (incError) {
        return NextResponse.json({ error: 'Cupón agotado' }, { status: 400 });
      }

      couponDiscount = Math.round((subtotal * coupon.discount_percent) / 100);
    }

    const totalAmount = subtotal - couponDiscount;

    if (totalAmount <= 0) {
      return NextResponse.json(
        { error: 'Total inválido' },
        { status: 400 }
      );
    }

    const { data: order, error: orderError } = await supabase.rpc(
      'create_order_with_stock',
      {
        customer_name: `${customer.first_name} ${customer.last_name}`,
        customer_dni: customer.dni,
        customer_phone: customer.phone,
        customer_address: fullAddress,
        items: orderItems,
        total_amount: totalAmount,
        coupon_code: couponCode || null,
        coupon_discount: couponDiscount,
        status: 'Pendiente',
      }
    );

    if (orderError || !order) {
      console.error('Order RPC error:', orderError);
      return NextResponse.json(
        { error: 'Error al crear pedido' },
        { status: 500 }
      );
    }

    const customerFullName = `${customer.first_name} ${customer.last_name}`;
    const orderId = order.id ?? 0;

    await supabase.from('customers').upsert(
      {
        dni: customer.dni,
        first_name: customer.first_name,
        last_name: customer.last_name,
        phone: customer.phone,
        address: fullAddress,
      },
      { onConflict: 'dni' }
    );

    await sendOrderEmail({
      id: orderId,
      customer_name: customerFullName,
      customer_phone: customer.phone,
      customer_address: customer.address,
      items: orderItems,
      total_amount: totalAmount,
      coupon_code: couponCode || null,
      coupon_discount: couponDiscount,
    });

    return NextResponse.json(
      {
        success: true,
        order: {
          id: orderId,
          subtotal,
          couponDiscount,
          total: totalAmount,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Error del servidor' },
      { status: 500 }
    );
  }
}
