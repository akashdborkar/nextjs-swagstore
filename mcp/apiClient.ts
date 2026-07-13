import { config } from './config'
import { transformProduct, transformCart } from './transformers'
import { handleApiError } from './errors'
import type {
  CleanProduct,
  CleanCart,
  ApiErrorResponse,
  RawProductsResponse,
  RawProductResponse,
  RawStockResponse,
} from './types'

export interface StockResult {
  id: string
  stock: number
  inStock: boolean
}

export type FetchProductsParams = {
  page?: number
  limit?: number
  category?: string
  search?: string
  featured?: string
}

export class SwagStoreApiClient {
  private readonly baseUrl: string
  private readonly cartToken: string
  private readonly vercelBypassToken: string

  constructor() {
    this.baseUrl = config.SWAG_STORE_API_URL
    this.cartToken = config.CART_TOKEN
    this.vercelBypassToken = config.VERCEL_SECRET_TOKEN ?? ''
  }

  private get defaultHeaders(): Record<string, string> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (this.vercelBypassToken) {
      headers['x-vercel-protection-bypass'] = this.vercelBypassToken
    }
    return headers
  }

  private get cartHeaders(): Record<string, string> {
    return { ...this.defaultHeaders, 'x-cart-token': this.cartToken }
  }

  private async request<T>(url: string, init?: RequestInit): Promise<T> {
    const response = await fetch(url, init)
    if (!response.ok) {
      let message: string
      try {
        const body = await response.json()
        message = body?.message ?? response.statusText
      } catch {
        message = response.statusText
      }
      throw { status: response.status, message }
    }
    return response.json() as Promise<T>
  }

  async fetchProducts(
    params: FetchProductsParams = {}
  ): Promise<CleanProduct[] | ApiErrorResponse> {
    try {
      const query = new URLSearchParams()
      if (params.page != null) query.set('page', String(params.page))
      if (params.limit != null) query.set('limit', String(params.limit))
      if (params.category) query.set('category', params.category)
      if (params.search) query.set('search', params.search)
      if (params.featured) query.set('featured', params.featured)

      const qs = query.toString()
      const url = `${this.baseUrl}/products${qs ? `?${qs}` : ''}`
      const data = await this.request<RawProductsResponse>(url, { headers: this.defaultHeaders })
      return (data.data ?? []).map(transformProduct)
    } catch (error) {
      return handleApiError(error)
    }
  }

  async fetchProductDetails(productId: string): Promise<CleanProduct | ApiErrorResponse> {
    try {
      const url = `${this.baseUrl}/products/${productId}`
      const [productData, stockResult] = await Promise.all([
        this.request<RawProductResponse>(url, { headers: this.defaultHeaders }),
        this.checkStock(productId),
      ])
      if (!productData.success || !productData.data) {
        return handleApiError({ status: 404 })
      }
      const product = transformProduct(productData.data)
      product.image = productData.data.images?.[0]
      if ('stock' in stockResult) {
        product.stock = stockResult.stock
        product.inStock = stockResult.inStock
      }
      return product
    } catch (error) {
      return handleApiError(error)
    }
  }

  async checkStock(productId: string): Promise<StockResult | ApiErrorResponse> {
    try {
      const url = `${this.baseUrl}/products/${productId}/stock`
      const data = await this.request<RawStockResponse>(url, { headers: this.defaultHeaders })
      if (!data.success || !data.data) {
        return handleApiError({ status: 404 })
      }
      return { id: data.data.productId, stock: data.data.stock, inStock: data.data.inStock }
    } catch (error) {
      return handleApiError(error)
    }
  }

  async fetchCart(): Promise<CleanCart | ApiErrorResponse> {
    try {
      const url = `${this.baseUrl}/cart`
      const data = await this.request<any>(url, {
        method: 'GET',
        headers: this.cartHeaders,
      })
      return transformCart(data)
    } catch (error) {
      return handleApiError(error)
    }
  }

  async addToCart(productId: string, quantity: number): Promise<CleanCart | ApiErrorResponse> {
    try {
      const url = `${this.baseUrl}/cart`
      const data = await this.request<any>(url, {
        method: 'POST',
        headers: this.cartHeaders,
        body: JSON.stringify({ productId, quantity }),
      })
      return transformCart(data)
    } catch (error) {
      return handleApiError(error)
    }
  }

  async updateCart(productId: string, quantity: number): Promise<CleanCart | ApiErrorResponse> {
    try {
      const url = `${this.baseUrl}/cart/${productId}`
      const data =
        quantity === 0
          ? await this.request<any>(url, { method: 'DELETE', headers: this.cartHeaders })
          : await this.request<any>(url, {
              method: 'PATCH',
              headers: this.cartHeaders,
              body: JSON.stringify({ quantity }),
            })
      return transformCart(data)
    } catch (error) {
      return handleApiError(error)
    }
  }
}
