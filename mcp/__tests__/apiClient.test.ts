import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { MockedFunction } from 'vitest'

// Mock config so the module-level Zod validation never runs during tests
vi.mock('../config', () => ({
  config: {
    SWAG_STORE_API_URL: 'https://test-api.example.com/api',
    CART_TOKEN: 'test-cart-token',
  },
}))

import { SwagStoreApiClient } from '../apiClient'

const BASE = 'https://test-api.example.com/api'
const CART_TOKEN = 'test-cart-token'

// ── helpers ────────────────────────────────────────────────────────────────────

function mockFetch(body: unknown, ok = true, status = 200) {
  const mock = vi.fn().mockResolvedValue({
    ok,
    status,
    statusText: ok ? 'OK' : 'Error',
    json: vi.fn().mockResolvedValue(body),
  })
  vi.stubGlobal('fetch', mock)
  return mock
}

function mockFetchSequential(...bodies: { body: unknown; ok?: boolean; status?: number }[]) {
  const mock = vi.fn()
  bodies.forEach(({ body, ok = true, status = 200 }) => {
    mock.mockResolvedValueOnce({
      ok,
      status,
      statusText: ok ? 'OK' : 'Error',
      json: vi.fn().mockResolvedValue(body),
    })
  })
  vi.stubGlobal('fetch', mock)
  return mock
}

function captureCall(mock: MockedFunction<typeof fetch>) {
  const [url, init] = mock.mock.calls[0] as [string, RequestInit]
  const headers = init?.headers as Record<string, string> | undefined
  const body = init?.body ? JSON.parse(init.body as string) : undefined
  return { url, init, headers: headers ?? {}, body }
}

// Minimal realistic API payloads
const RAW_PRODUCT = {
  id: 'tshirt_001',
  name: 'Classic Swag T-Shirt',
  price: 29.99,
  description: 'Great shirt.',
  slug: 'classic-swag-t-shirt',
  category: 'apparel',
  currency: 'USD',
  featured: true,
  images: ['https://cdn.example.com/img/front.jpg', 'https://cdn.example.com/img/back.jpg'],
  tags: ['bestseller'],
  createdAt: '2024-01-15T10:00:00.000Z',
}

const RAW_CART = {
  createdAt: '2024-03-01T09:00:00.000Z',
  updatedAt: '2024-03-01T09:45:00.000Z',
  currency: 'USD',
  token: 'cart_tok_abc123',
  subtotal: 29.99,
  totalItems: 1,
  items: [
    {
      addedAt: '2024-03-01T09:00:00.000Z',
      lineTotal: 29.99,
      price: 29.99,
      quantity: 1,
      totalPrice: 29.99,
      product: RAW_PRODUCT,
    },
  ],
}

// ── tests ──────────────────────────────────────────────────────────────────────

describe('SwagStoreApiClient', () => {
  let client: SwagStoreApiClient

  beforeEach(() => {
    vi.unstubAllGlobals()
    client = new SwagStoreApiClient()
  })

  // ── fetchProducts ────────────────────────────────────────────────────────────

  describe('fetchProducts', () => {
    it('calls the correct URL with no query string when no params are given', async () => {
      const mock = mockFetch({ data: [RAW_PRODUCT] })

      await client.fetchProducts()

      const { url } = captureCall(mock)
      expect(url).toBe(`${BASE}/products`)
    })

    it('builds the full query string when all params are provided', async () => {
      const mock = mockFetch({ data: [RAW_PRODUCT] })

      await client.fetchProducts({ page: 2, limit: 20, category: 'mugs', search: 'blue', featured: 'true' })

      const { url } = captureCall(mock)
      const parsed = new URL(url)
      expect(parsed.searchParams.get('page')).toBe('2')
      expect(parsed.searchParams.get('limit')).toBe('20')
      expect(parsed.searchParams.get('category')).toBe('mugs')
      expect(parsed.searchParams.get('search')).toBe('blue')
      expect(parsed.searchParams.get('featured')).toBe('true')
    })

    it('only appends params that are provided', async () => {
      const mock = mockFetch({ data: [] })

      await client.fetchProducts({ category: 'bottles' })

      const { url } = captureCall(mock)
      const parsed = new URL(url)
      expect(parsed.searchParams.get('category')).toBe('bottles')
      expect(parsed.searchParams.get('page')).toBeNull()
      expect(parsed.searchParams.get('search')).toBeNull()
    })

    it('returns stripped CleanProduct array', async () => {
      mockFetch({ data: [RAW_PRODUCT] })

      const result = await client.fetchProducts()

      expect(result).toEqual([
        { id: 'tshirt_001', name: 'Classic Swag T-Shirt', price: 29.99, description: 'Great shirt.' },
      ])
      expect((result as any[])[0]).not.toHaveProperty('images')
      expect((result as any[])[0]).not.toHaveProperty('tags')
    })

    it('returns an empty array when data is missing from the response', async () => {
      mockFetch({ success: true })

      const result = await client.fetchProducts()

      expect(result).toEqual([])
    })

    it('returns ApiErrorResponse on HTTP 500', async () => {
      mockFetch({ message: 'Internal error' }, false, 500)

      const result = await client.fetchProducts()

      expect(result).toEqual({ status: 'error', message: expect.stringMatching(/unavailable/i) })
    })

    it('returns ApiErrorResponse on network TypeError', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))

      const result = await client.fetchProducts()

      expect(result).toEqual({ status: 'error', message: expect.stringMatching(/reach the store API/i) })
    })
  })

  // ── fetchProductDetails ──────────────────────────────────────────────────────

  describe('fetchProductDetails', () => {
    const RAW_STOCK = { productId: 'tshirt_001', stock: 12, inStock: true, lowStock: false }

    it('calls the correct URL with the product ID', async () => {
      const mock = mockFetchSequential(
        { body: { success: true, data: RAW_PRODUCT } },
        { body: { success: true, data: RAW_STOCK } },
      )

      await client.fetchProductDetails('tshirt_001')

      expect(mock.mock.calls[0][0]).toBe(`${BASE}/products/tshirt_001`)
    })

    it('returns a CleanProduct with image and stock availability', async () => {
      mockFetchSequential(
        { body: { success: true, data: RAW_PRODUCT } },
        { body: { success: true, data: RAW_STOCK } },
      )

      const result = await client.fetchProductDetails('tshirt_001')

      expect(result).toEqual({
        id: 'tshirt_001',
        name: 'Classic Swag T-Shirt',
        price: 29.99,
        description: 'Great shirt.',
        image: 'https://cdn.example.com/img/front.jpg',
        stock: 12,
        inStock: true,
      })
    })

    it('returns product without stock fields when the stock check fails', async () => {
      mockFetchSequential(
        { body: { success: true, data: RAW_PRODUCT } },
        { body: { success: false }, ok: false, status: 500 },
      )

      const result = await client.fetchProductDetails('tshirt_001')

      expect(result).toMatchObject({ id: 'tshirt_001', image: 'https://cdn.example.com/img/front.jpg' })
      expect(result).not.toHaveProperty('inStock')
    })

    it('returns ApiErrorResponse when API signals success=false', async () => {
      mockFetch({ success: false, error: { code: 'NOT_FOUND', message: 'Product not found' } })

      const result = await client.fetchProductDetails('does-not-exist')

      expect(result).toHaveProperty('status', 'error')
    })

    it('returns ApiErrorResponse on HTTP 404', async () => {
      mockFetch({ message: 'Not found' }, false, 404)

      const result = await client.fetchProductDetails('ghost')

      expect(result).toEqual({ status: 'error', message: 'Resource not found.' })
    })
  })

  // ── checkStock ───────────────────────────────────────────────────────────────

  describe('checkStock', () => {
    it('calls /products/:id/stock', async () => {
      const mock = mockFetch({ success: true, data: { productId: 'tshirt_001', stock: 12, inStock: true, lowStock: false } })

      await client.checkStock('tshirt_001')

      const { url } = captureCall(mock)
      expect(url).toBe(`${BASE}/products/tshirt_001/stock`)
    })

    it('returns id, stock, and inStock only', async () => {
      mockFetch({ success: true, data: { productId: 'tshirt_001', stock: 12, inStock: true, lowStock: false } })

      const result = await client.checkStock('tshirt_001')

      expect(result).toEqual({ id: 'tshirt_001', stock: 12, inStock: true })
      expect(result).not.toHaveProperty('lowStock')
    })

    it('returns ApiErrorResponse when stock data is absent', async () => {
      mockFetch({ success: false })

      const result = await client.checkStock('tshirt_001')

      expect(result).toHaveProperty('status', 'error')
    })
  })

  // ── fetchCart ────────────────────────────────────────────────────────────────

  describe('fetchCart', () => {
    it('calls GET /cart', async () => {
      const mock = mockFetch(RAW_CART)

      await client.fetchCart()

      const { url, init } = captureCall(mock)
      expect(url).toBe(`${BASE}/cart`)
      expect(init.method).toBe('GET')
    })

    it('sends the x-cart-token header', async () => {
      const mock = mockFetch(RAW_CART)

      await client.fetchCart()

      const { headers } = captureCall(mock)
      expect(headers['x-cart-token']).toBe(CART_TOKEN)
    })

    it('returns a stripped CleanCart', async () => {
      mockFetch(RAW_CART)

      const result = await client.fetchCart()

      expect(result).toEqual({
        subtotal: 29.99,
        totalItems: 1,
        items: [
          expect.objectContaining({ id: 'tshirt_001', quantity: 1, price: 29.99 }),
        ],
      })
      expect((result as any)).not.toHaveProperty('token')
      expect((result as any)).not.toHaveProperty('createdAt')
    })

    it('returns ApiErrorResponse on HTTP 401', async () => {
      mockFetch({}, false, 401)

      const result = await client.fetchCart()

      expect(result).toEqual({ status: 'error', message: 'Unauthorized: check your CART_TOKEN.' })
    })
  })

  // ── addToCart ────────────────────────────────────────────────────────────────

  describe('addToCart', () => {
    it('sends POST to /cart with productId and quantity in body', async () => {
      const mock = mockFetch(RAW_CART)

      await client.addToCart('tshirt_001', 2)

      const { url, init, body } = captureCall(mock)
      expect(url).toBe(`${BASE}/cart`)
      expect(init.method).toBe('POST')
      expect(body).toEqual({ productId: 'tshirt_001', quantity: 2 })
    })

    it('sends the x-cart-token header', async () => {
      const mock = mockFetch(RAW_CART)

      await client.addToCart('tshirt_001', 1)

      const { headers } = captureCall(mock)
      expect(headers['x-cart-token']).toBe(CART_TOKEN)
    })

    it('returns the updated CleanCart', async () => {
      mockFetch(RAW_CART)

      const result = await client.addToCart('tshirt_001', 1)

      expect(result).toHaveProperty('subtotal', 29.99)
      expect((result as any).items).toHaveLength(1)
    })

    it('returns ApiErrorResponse on HTTP 400', async () => {
      mockFetch({ message: 'quantity must be positive' }, false, 400)

      const result = await client.addToCart('tshirt_001', -1)

      expect(result).toEqual({
        status: 'error',
        message: 'Bad request: quantity must be positive',
      })
    })
  })

  // ── updateCart ───────────────────────────────────────────────────────────────

  describe('updateCart', () => {
    it('sends PATCH to /cart/:productId with quantity when quantity > 0', async () => {
      const mock = mockFetch(RAW_CART)

      await client.updateCart('tshirt_001', 3)

      const { url, init, body } = captureCall(mock)
      expect(url).toBe(`${BASE}/cart/tshirt_001`)
      expect(init.method).toBe('PATCH')
      expect(body).toEqual({ quantity: 3 })
    })

    it('sends DELETE to /cart/:productId when quantity is 0', async () => {
      const mock = mockFetch(RAW_CART)

      await client.updateCart('tshirt_001', 0)

      const { url, init } = captureCall(mock)
      expect(url).toBe(`${BASE}/cart/tshirt_001`)
      expect(init.method).toBe('DELETE')
    })

    it('sends the x-cart-token header on PATCH', async () => {
      const mock = mockFetch(RAW_CART)

      await client.updateCart('tshirt_001', 2)

      const { headers } = captureCall(mock)
      expect(headers['x-cart-token']).toBe(CART_TOKEN)
    })

    it('sends the x-cart-token header on DELETE', async () => {
      const mock = mockFetch(RAW_CART)

      await client.updateCart('tshirt_001', 0)

      const { headers } = captureCall(mock)
      expect(headers['x-cart-token']).toBe(CART_TOKEN)
    })

    it('returns ApiErrorResponse on network failure', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))

      const result = await client.updateCart('tshirt_001', 1)

      expect(result).toHaveProperty('status', 'error')
    })
  })
})
