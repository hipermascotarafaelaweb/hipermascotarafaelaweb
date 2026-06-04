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
  address: string;
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
  name: string;
  description: string | null;
  discount_percent: number | null;
  discount_amount: number | null;
  valid_from: string;
  valid_until: string | null;
  active: boolean;
  created_at: string;
}
