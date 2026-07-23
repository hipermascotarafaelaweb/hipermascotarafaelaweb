export interface Category {
  id: number;
  name: string;
  slug: string;
  created_at: string;
}

export type PetType = 'perro' | 'gato' | 'ambos';

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  /** Precio de oferta. Si es válido (mayor a 0 y menor al precio), manda. */
  sale_price: number | null;
  category_id: number | null;
  image_url: string | null;
  /** Fotos adicionales para la galería del detalle. */
  images: string[] | null;
  /** Para qué mascota es el producto. 'ambos' aparece en ambos filtros. */
  pet_type: PetType;
  stock: number;
  is_featured: boolean;
  created_at: string;
  category?: Category;
  /** Filtros avanzados (opcionales; migración 0005). El catálogo los muestra
   *  solo si hay productos que los tengan poblados. */
  size?: string | null;        // chico | mediano | grande
  life_stage?: string | null;  // cachorro | adulto | senior
  diet?: string | null;        // sin_granos | hipoalergenico | estandar
  /** Escalones de precio por cantidad (opcional). Solo llega con datos si el usuario está logueado. */
  price_tiers?: PriceTier[];
}

export interface PriceTier {
  id: number;
  product_id: number;
  min_qty: number;
  price: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  product_id: number;
  name: string;
  qty: number;
  price: number;
}

export interface Customer {
  id: number;
  dni: string;
  first_name: string;
  last_name: string;
  phone: string;
  address: string | null;
  created_at: string;
}

/** Datos que el cliente completa en el carrito antes de enviar el pedido. */
export interface CustomerInput {
  first_name: string;
  last_name: string;
  dni: string;
  phone: string;
  street: string;
  city: string;
  province: string;
  postal_code: string;
}

export interface Order {
  id: number;
  customer_name: string | null;
  customer_dni: string | null;
  customer_phone: string | null;
  customer_address: string | null;
  items: OrderItem[];
  total_amount: number;
  coupon_code: string | null;
  coupon_discount: number;
  status: 'Pendiente' | 'Entregado' | 'Cancelado';
  created_at: string;
}

export interface Coupon {
  id: number;
  code: string;
  discount_percent: number;
  max_uses: number | null;
  uses_count: number;
  valid_from: string;
  valid_until: string | null;
  active: boolean;
  created_at: string;
}

export interface Promotion {
  id: number;
  title: string;
  description: string | null;
  discount_percent: number | null;
  discount_fixed: number | null;
  discount_type: string | null;
  image_url: string | null;
  badge_label: string | null;
  display_priority: number | null;
  is_active: boolean;
  valid_from: string;
  valid_until: string | null;
  created_at: string;
}

export interface PromotionWithProducts extends Promotion {
  product_ids: number[];
  category_ids: number[];
}

export interface PromotionProduct {
  id: number;
  promotion_id: number;
  product_id: number;
  created_at: string;
}

export interface PromotionCategory {
  id: number;
  promotion_id: number;
  category_id: number;
  created_at: string;
}
