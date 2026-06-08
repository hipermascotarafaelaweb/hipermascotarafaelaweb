#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

async function debugCheckout() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bhevncdmvbypcgeemoin.supabase.co';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY no configurada');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log('🔍 Debugeando checkout paso a paso...\n');

  try {
    // Simular datos exactos del checkout
    const customer = {
      first_name: 'Geronimo',
      last_name: 'Mendez',
      dni: '41601961',
      phone: '3492680779',
      street: 'Las Violetas 141',
      city: 'Rafaela',
      province: 'Santa Fe',
      postal_code: '2300',
    };

    const fullAddress = `${customer.street}, ${customer.city}, ${customer.province} ${customer.postal_code}`;

    console.log('1️⃣  Intentando upsert del cliente...');
    console.log(`   DNI: ${customer.dni}`);
    console.log(`   Nombre: ${customer.first_name} ${customer.last_name}`);

    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .upsert(
        {
          dni: customer.dni,
          first_name: customer.first_name,
          last_name: customer.last_name,
          phone: customer.phone,
          address: fullAddress,
        },
        { onConflict: 'dni' }
      );

    if (customerError) {
      console.error('❌ Error en upsert del cliente:', customerError);
      return;
    }
    console.log('✅ Cliente upsertado exitosamente\n');

    // Verificar que el cliente existe
    console.log('2️⃣  Verificando que el cliente existe en la tabla...');
    const { data: existingCustomer, error: checkError } = await supabase
      .from('customers')
      .select('dni, first_name, last_name')
      .eq('dni', customer.dni)
      .single();

    if (checkError) {
      console.error('❌ Error al verificar cliente:', checkError);
      return;
    }

    if (!existingCustomer) {
      console.error('❌ Cliente no encontrado después del upsert');
      return;
    }

    console.log(`✅ Cliente encontrado: ${existingCustomer.first_name} ${existingCustomer.last_name}\n`);

    // Obtener un producto
    console.log('3️⃣  Buscando un producto...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price, sale_price')
      .limit(1);

    if (productsError || !products || products.length === 0) {
      console.error('❌ Error al buscar productos:', productsError);
      return;
    }

    const product = products[0];
    console.log(`✅ Producto encontrado: ${product.name} (ID: ${product.id})\n`);

    // Ahora intentar insertar el pedido
    console.log('4️⃣  Insertando pedido en tabla orders...');
    console.log(`   customer_dni: ${customer.dni}`);
    console.log(`   customer_name: ${customer.first_name} ${customer.last_name}`);

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_name: `${customer.first_name} ${customer.last_name}`,
        customer_dni: customer.dni,
        customer_phone: customer.phone,
        customer_address: fullAddress,
        items: [{ product_id: product.id, name: product.name, qty: 1, price: product.price }],
        total_amount: product.price,
        coupon_code: null,
        coupon_discount: 0,
        status: 'Pendiente',
      })
      .select('id')
      .single();

    if (orderError) {
      console.error('❌ Error al insertar orden:', orderError);
      console.error('Detalles completos:', JSON.stringify(orderError, null, 2));
      return;
    }

    console.log(`✅ Orden creada exitosamente: ${order.id}\n`);

    // Limpiar
    console.log('🧹 Limpiando pedido de test...');
    await supabase.from('orders').delete().eq('id', order.id);
    console.log('✅ Pedido de test eliminado\n');

    console.log('✅ ¡TODO FUNCIONA CORRECTAMENTE!');

  } catch (error) {
    console.error('❌ Error inesperado:', error.message);
  }
}

debugCheckout();
