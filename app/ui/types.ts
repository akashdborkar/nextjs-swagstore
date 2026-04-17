export interface Category {
    slug: string;
    name: string;
    productCount: number;
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

export interface StockData {
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