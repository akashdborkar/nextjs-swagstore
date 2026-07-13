// Raw shapes returned by the Next.js Swag Store API

export interface RawProduct {
  id: string
  name: string
  price: number
  description: string
  slug: string
  category: string
  currency: string
  featured: boolean
  images: string[]
  tags: string[]
  createdAt: string
}

export interface RawStock {
  productId: string
  stock: number
  inStock: boolean
  lowStock: boolean
}

export interface RawCartItem {
  addedAt: string
  lineTotal: number
  price: number
  quantity: number
  totalPrice: number
  product: RawProduct
}

export interface RawCart {
  createdAt: string
  currency: string
  items: RawCartItem[]
  subtotal: number
  token: string
  totalItems: number
  updatedAt: string
}

export interface RawProductResponse {
  success: boolean
  data?: RawProduct
  error?: { code: string; message: string }
}

export interface RawProductsResponse {
  success?: boolean
  data?: RawProduct[]
  meta?: Record<string, unknown>
}

export interface RawStockResponse {
  success: boolean
  data?: RawStock
}

// Stripped output types — only what the AI context window needs

export interface CleanProduct {
  id: string
  name: string
  price: number
  description: string
  stock?: number
  image?: string
  inStock?: boolean
}

export interface CleanCartItem {
  id: string
  name: string
  price: number
  description: string
  quantity: number
}

export interface CleanCart {
  items: CleanCartItem[]
  subtotal: number
  totalItems: number
}

export interface ApiErrorResponse {
  status: 'error'
  message: string
}
