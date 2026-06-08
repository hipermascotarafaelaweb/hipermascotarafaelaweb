// Fixtures que imitan las filas que devuelve Supabase (PostgREST) para el
// catálogo. Se sirven tal cual desde el mock; el cliente supabase-js solo
// hace fetch y devuelve `data`, así que con estos arrays alcanza para
// ejercitar el catálogo y el carrito end-to-end sin tocar la base real.

export const categories = [
  { id: 1, name: 'Alimentos', slug: 'alimentos', created_at: '2024-01-01T00:00:00Z' },
  { id: 2, name: 'Juguetes', slug: 'juguetes', created_at: '2024-01-01T00:00:00Z' },
];

export const products = [
  {
    id: 1,
    name: 'Alimento Premium Perro 15kg',
    description: 'Balanceado premium para razas grandes',
    price: 20000,
    sale_price: null,
    category_id: 1,
    image_url: null,
    images: null,
    pet_type: 'perro',
    stock: 25,
    is_featured: true,
    created_at: '2024-03-01T00:00:00Z',
    category: { id: 1, name: 'Alimentos', slug: 'alimentos', created_at: '2024-01-01T00:00:00Z' },
  },
  {
    id: 2,
    name: 'Pelota Mordillo Gato',
    description: 'Juguete resistente para gatos',
    price: 5000,
    sale_price: 3500,
    category_id: 2,
    image_url: null,
    images: null,
    pet_type: 'gato',
    stock: 10,
    is_featured: false,
    created_at: '2024-03-02T00:00:00Z',
    category: { id: 2, name: 'Juguetes', slug: 'juguetes', created_at: '2024-01-01T00:00:00Z' },
  },
  {
    id: 3,
    name: 'Hueso de Juguete Perro',
    description: 'Para morder sin culpa',
    price: 8000,
    sale_price: null,
    category_id: 2,
    image_url: null,
    images: null,
    pet_type: 'perro',
    stock: 0,
    is_featured: false,
    created_at: '2024-03-03T00:00:00Z',
    category: { id: 2, name: 'Juguetes', slug: 'juguetes', created_at: '2024-01-01T00:00:00Z' },
  },
];

// Promoción activa (10% off) vinculada al producto 1.
export const promotions = [
  {
    id: 1,
    title: 'Promo Razas Grandes',
    description: '10% en alimento premium',
    discount_percent: 10,
    discount_fixed: null,
    discount_type: 'percent',
    image_url: null,
    badge_label: '-10%',
    display_priority: 1,
    is_active: true,
    valid_from: '2024-01-01T00:00:00Z',
    valid_until: null,
    created_at: '2024-01-01T00:00:00Z',
  },
];

export const promotion_products = [
  { id: 1, promotion_id: 1, product_id: 1, created_at: '2024-01-01T00:00:00Z' },
];

export const promotion_categories = [];

export const tables = {
  products,
  categories,
  promotions,
  promotion_products,
  promotion_categories,
};
