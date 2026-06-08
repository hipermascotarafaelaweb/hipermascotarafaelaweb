import { describe, it, expect } from 'vitest';
import { generateWhatsAppLink } from './whatsapp';
import { SITE } from '@/config/site';
import type { CartItem, CustomerInput, Product } from '@/types';

function makeProduct(over: Partial<Product> = {}): Product {
  return {
    id: 1,
    name: 'Alimento Premium',
    description: null,
    price: 1000,
    sale_price: null,
    category_id: null,
    image_url: null,
    images: null,
    pet_type: 'perro',
    stock: 10,
    is_featured: false,
    created_at: '2020-01-01T00:00:00Z',
    ...over,
  };
}

const items: CartItem[] = [{ product: makeProduct(), quantity: 2 }];

describe('generateWhatsAppLink', () => {
  it('apunta al número del negocio', () => {
    const link = generateWhatsAppLink(items, 2000);
    expect(link.startsWith(`https://wa.me/${SITE.phoneNumber}?text=`)).toBe(true);
  });

  it('incluye el producto, cantidad y total', () => {
    const msg = decodeURIComponent(generateWhatsAppLink(items, 2000).split('text=')[1]);
    expect(msg).toContain('2x Alimento Premium');
    expect(msg).toContain('Total: $2.000');
  });

  it('usa el precio efectivo (oferta) por unidad', () => {
    const offerItems: CartItem[] = [
      { product: makeProduct({ price: 1000, sale_price: 800 }), quantity: 1 },
    ];
    const msg = decodeURIComponent(generateWhatsAppLink(offerItems, 800).split('text=')[1]);
    expect(msg).toContain('$800 c/u');
  });

  it('agrega los datos del cliente cuando se pasan', () => {
    const customer: CustomerInput = {
      first_name: 'Juan',
      last_name: 'Pérez',
      dni: '30123456',
      phone: '3492111222',
      street: 'San Martín 100',
      city: 'Rafaela',
      province: 'Santa Fe',
      postal_code: '2300',
    };
    const msg = decodeURIComponent(generateWhatsAppLink(items, 2000, customer).split('text=')[1]);
    expect(msg).toContain('Juan Pérez');
    expect(msg).toContain('DNI: 30123456');
    expect(msg).toContain('San Martín 100');
  });

  it('muestra subtotal y descuento cuando hay cupón', () => {
    const msg = decodeURIComponent(
      generateWhatsAppLink(items, 1800, undefined, 200, 'PROMO10').split('text=')[1]
    );
    expect(msg).toContain('Subtotal: $2.000');
    expect(msg).toContain('Cupón PROMO10: -$200');
    expect(msg).toContain('Total: $1.800');
  });
});
