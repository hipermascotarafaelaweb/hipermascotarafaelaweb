export interface Category {
  id: number;
  name: string;
  slug: string;
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  category_id: number | null;
  image_url: string | null;
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

export interface Order {
  id: number;
  customer_phone: string | null;
  items: OrderItem[];
  total_amount: number;
  status: 'Pendiente' | 'Entregado' | 'Cancelado';
  created_at: string;
}
