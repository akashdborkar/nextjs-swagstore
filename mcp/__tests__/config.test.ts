import { describe, it, expect, beforeEach } from 'vitest'
import { vi } from 'vitest'

const VALID_URL = 'https://vercel-swag-store-api.vercel.app/api'
const VALID_TOKEN = 'secret-cart-token'

describe('mcp/config', () => {
  beforeEach(() => {
    vi.resetModules()
    delete process.env.SWAG_STORE_API_URL
    delete process.env.CART_TOKEN
    delete process.env.VERCEL_SECRET_TOKEN
  })

  it('exports config when required env vars are valid', async () => {
    process.env.SWAG_STORE_API_URL = VALID_URL
    process.env.CART_TOKEN = VALID_TOKEN

    const { config } = await import('../config')

    expect(config.SWAG_STORE_API_URL).toBe(VALID_URL)
    expect(config.CART_TOKEN).toBe(VALID_TOKEN)
  })

  it('VERCEL_SECRET_TOKEN defaults to empty string when not set', async () => {
    process.env.SWAG_STORE_API_URL = VALID_URL
    process.env.CART_TOKEN = VALID_TOKEN

    const { config } = await import('../config')

    expect(config.VERCEL_SECRET_TOKEN).toBe('')
  })

  it('exports VERCEL_SECRET_TOKEN when provided', async () => {
    process.env.SWAG_STORE_API_URL = VALID_URL
    process.env.CART_TOKEN = VALID_TOKEN
    process.env.VERCEL_SECRET_TOKEN = 'bypass-secret'

    const { config } = await import('../config')

    expect(config.VERCEL_SECRET_TOKEN).toBe('bypass-secret')
  })

  it('throws when SWAG_STORE_API_URL is missing', async () => {
    process.env.CART_TOKEN = VALID_TOKEN

    await expect(import('../config')).rejects.toThrow('[MCP] Invalid configuration')
  })

  it('throws when SWAG_STORE_API_URL is not a valid URL', async () => {
    process.env.SWAG_STORE_API_URL = 'not-a-url'
    process.env.CART_TOKEN = VALID_TOKEN

    await expect(import('../config')).rejects.toThrow('SWAG_STORE_API_URL must be a valid URL')
  })

  it('throws when CART_TOKEN is missing', async () => {
    process.env.SWAG_STORE_API_URL = VALID_URL

    await expect(import('../config')).rejects.toThrow('[MCP] Invalid configuration')
  })

  it('throws when CART_TOKEN is empty', async () => {
    process.env.SWAG_STORE_API_URL = VALID_URL
    process.env.CART_TOKEN = ''

    await expect(import('../config')).rejects.toThrow('CART_TOKEN must not be empty')
  })
})
