export interface Category {
  slug: string;
  name: string;
  productCount: number;
}

export interface PromoProps {
  message: string;
  discountCode?: string;
}

export interface Product {
  category: string;
  createdAt: string;
  currency: string;
  description: string;
  featured: boolean;
  id: string;
  images: string[];
  name: string;
  price: number;
  slug: string;
  tags: string[];
}

export interface Stock {
  productId: string;
  stock: number;
  inStock: boolean;
  lowStock: boolean;
}

export interface CartItem {
  addedAt: string;
  lineTotal: number;
  product: Product;
  price: number;
  quantity: number;
  totalPrice: number;
}

export interface CartModel {
  createdAt: string;
  currency: string;
  items: CartItem[];
  subtotal: number;
  token: string;
  totalItems: number;
  updatedAt: string;
}

export interface Error {
  code: string,
  message: string
};

export interface ProductResponse {
  data?: Product,
  success: boolean,
  error?: Error
}

export interface ProductsResponse {
    success?: boolean;
    data?: Product[];
    meta?: any;
}

export interface StockResponse {
  data?: Stock,
  success: boolean,
}