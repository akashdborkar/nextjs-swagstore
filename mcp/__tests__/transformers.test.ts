import { describe, it, expect } from 'vitest'
import { transformProduct, transformCart } from '../transformers'

// Realistic bloated product as the API actually returns it
const BLOATED_PRODUCT = {
  id: 'tshirt_001',
  name: 'Classic Swag T-Shirt',
  price: 29.99,
  description:
    'Premium 100% organic cotton construction with screen-printed Swag logo on the front. ' +
    'Reinforced double-stitched collar and sleeves ensure lasting durability. ' +
    'Available in S, M, L, XL, XXL. Machine wash cold, tumble dry low. ' +
    'Model is 6ft wearing size M. Ships in 3-5 business days.',
  slug: 'classic-swag-t-shirt',
  category: 'apparel',
  currency: 'USD',
  featured: true,
  images: [
    'https://cdn.example.com/products/tshirt_001/front.jpg',
    'https://cdn.example.com/products/tshirt_001/back.jpg',
    'https://cdn.example.com/products/tshirt_001/detail.jpg',
  ],
  tags: ['bestseller', 'new-arrival', 'summer-collection', 'organic'],
  createdAt: '2024-01-15T10:00:00.000Z',
  _seo: { title: 'Buy Classic Swag T-Shirt | Swag Store', robots: 'index,follow' },
  _internalId: 'db_prod_00012345',
}

const BLOATED_CART = {
  createdAt: '2024-03-01T09:00:00.000Z',
  updatedAt: '2024-03-01T09:45:00.000Z',
  currency: 'USD',
  token: 'cart_tok_abc123xyz',
  subtotal: 89.97,
  totalItems: 3,
  items: [
    {
      addedAt: '2024-03-01T09:00:00.000Z',
      lineTotal: 59.98,
      price: 29.99,
      quantity: 2,
      totalPrice: 59.98,
      product: { ...BLOATED_PRODUCT },
    },
    {
      addedAt: '2024-03-01T09:10:00.000Z',
      lineTotal: 29.99,
      price: 29.99,
      quantity: 1,
      totalPrice: 29.99,
      product: {
        id: 'mug_002',
        name: 'Swag Coffee Mug',
        price: 14.99,
        description: 'Ceramic mug with the Swag Store logo. Microwave and dishwasher safe. 11oz capacity.',
        slug: 'swag-coffee-mug',
        category: 'drinkware',
        currency: 'USD',
        featured: false,
        images: ['https://cdn.example.com/products/mug_002/main.jpg'],
        tags: ['drinkware', 'gift'],
        createdAt: '2024-01-20T08:00:00.000Z',
      },
    },
  ],
}

describe('transformProduct', () => {
  it('strips all metadata and retains only clean fields', () => {
    const result = transformProduct(BLOATED_PRODUCT)

    expect(result).toEqual({
      id: 'tshirt_001',
      name: 'Classic Swag T-Shirt',
      price: 29.99,
      description: expect.any(String),
    })
    expect(result).not.toHaveProperty('images')
    expect(result).not.toHaveProperty('tags')
    expect(result).not.toHaveProperty('slug')
    expect(result).not.toHaveProperty('category')
    expect(result).not.toHaveProperty('currency')
    expect(result).not.toHaveProperty('featured')
    expect(result).not.toHaveProperty('createdAt')
  })

  it('truncates descriptions longer than 150 characters', () => {
    const result = transformProduct(BLOATED_PRODUCT)

    expect(result.description.length).toBeLessThanOrEqual(153) // 150 + '...'
    expect(result.description.endsWith('...')).toBe(true)
  })

  it('keeps short descriptions unchanged', () => {
    const result = transformProduct({ ...BLOATED_PRODUCT, description: 'Short desc.' })

    expect(result.description).toBe('Short desc.')
    expect(result.description.endsWith('...')).toBe(false)
  })

  it('includes stock when provided on the raw object', () => {
    const result = transformProduct({ ...BLOATED_PRODUCT, stock: 42 })

    expect(result.stock).toBe(42)
  })

  it('omits stock when not present on the raw object', () => {
    const result = transformProduct(BLOATED_PRODUCT)

    expect(result).not.toHaveProperty('stock')
  })

  it('handles missing fields defensively without throwing', () => {
    const result = transformProduct({})

    expect(result.id).toBe('')
    expect(result.name).toBe('')
    expect(result.price).toBe(0)
    expect(result.description).toBe('')
  })

  it('handles null input without throwing', () => {
    const result = transformProduct(null)

    expect(result.id).toBe('')
    expect(result.price).toBe(0)
  })
})

describe('transformCart', () => {
  it('strips cart metadata and retains only clean fields', () => {
    const result = transformCart(BLOATED_CART)

    expect(result).toEqual({
      items: expect.any(Array),
      subtotal: 89.97,
      totalItems: 3,
    })
    expect(result).not.toHaveProperty('createdAt')
    expect(result).not.toHaveProperty('updatedAt')
    expect(result).not.toHaveProperty('token')
    expect(result).not.toHaveProperty('currency')
  })

  it('maps each item to id, name, price, description, quantity only', () => {
    const result = transformCart(BLOATED_CART)
    const firstItem = result.items[0]

    expect(firstItem).toEqual({
      id: 'tshirt_001',
      name: 'Classic Swag T-Shirt',
      price: 29.99,
      description: expect.any(String),
      quantity: 2,
    })
    expect(firstItem).not.toHaveProperty('addedAt')
    expect(firstItem).not.toHaveProperty('lineTotal')
    expect(firstItem).not.toHaveProperty('totalPrice')
    expect(firstItem).not.toHaveProperty('product')
    expect(firstItem).not.toHaveProperty('images')
  })

  it('correctly maps the second cart item', () => {
    const result = transformCart(BLOATED_CART)
    const secondItem = result.items[1]

    expect(secondItem.id).toBe('mug_002')
    expect(secondItem.quantity).toBe(1)
  })

  it('truncates long item descriptions', () => {
    const result = transformCart(BLOATED_CART)
    const firstItem = result.items[0]

    // BLOATED_PRODUCT description is > 150 chars
    expect(firstItem.description.endsWith('...')).toBe(true)
  })

  it('returns an empty items array for a cart with no items', () => {
    const result = transformCart({ ...BLOATED_CART, items: [] })

    expect(result.items).toEqual([])
    expect(result.totalItems).toBe(3)
  })

  it('handles missing items array defensively', () => {
    const result = transformCart({ subtotal: 0, totalItems: 0 })

    expect(result.items).toEqual([])
  })

  it('handles null input without throwing', () => {
    const result = transformCart(null)

    expect(result.items).toEqual([])
    expect(result.subtotal).toBe(0)
    expect(result.totalItems).toBe(0)
  })
})
