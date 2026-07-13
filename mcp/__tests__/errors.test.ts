import { describe, it, expect } from 'vitest'
import { handleApiError } from '../errors'

describe('handleApiError', () => {
  it('returns status "error" on every code path', () => {
    expect(handleApiError(new Error('anything')).status).toBe('error')
    expect(handleApiError({ status: 404 }).status).toBe('error')
    expect(handleApiError(null).status).toBe('error')
  })

  describe('HTTP status codes', () => {
    it('handles 400 Bad Request with detail message', () => {
      const result = handleApiError({ status: 400, message: 'quantity must be positive' })

      expect(result).toEqual({ status: 'error', message: 'Bad request: quantity must be positive' })
    })

    it('handles 400 Bad Request without detail message', () => {
      const result = handleApiError({ status: 400 })

      expect(result.message).toMatch(/bad request/i)
    })

    it('handles 401 Unauthorized', () => {
      const result = handleApiError({ status: 401 })

      expect(result).toEqual({ status: 'error', message: 'Unauthorized: check your CART_TOKEN.' })
    })

    it('handles 403 Forbidden', () => {
      const result = handleApiError({ status: 403 })

      expect(result).toEqual({ status: 'error', message: 'Unauthorized: check your CART_TOKEN.' })
    })

    it('handles 404 Not Found', () => {
      const result = handleApiError({ status: 404 })

      expect(result).toEqual({ status: 'error', message: 'Resource not found.' })
    })

    it('handles 500 Internal Server Error', () => {
      const result = handleApiError({ status: 500 })

      expect(result).toEqual({
        status: 'error',
        message: 'The store API is temporarily unavailable. Try again later.',
      })
    })

    it('handles any 5xx as server unavailable', () => {
      const result = handleApiError({ status: 503 })

      expect(result.message).toMatch(/unavailable/i)
    })

    it('falls back to message field for unrecognised 4xx codes', () => {
      const result = handleApiError({ status: 409, message: 'Conflict: item already in cart' })

      expect(result).toEqual({ status: 'error', message: 'Conflict: item already in cart' })
    })

    it('falls back to generic text when no message and unrecognised status', () => {
      const result = handleApiError({ status: 422 })

      expect(result.message).toContain('422')
    })
  })

  describe('network errors', () => {
    it('handles native TypeError from fetch (DNS / offline)', () => {
      const result = handleApiError(new TypeError('Failed to fetch'))

      expect(result).toEqual({
        status: 'error',
        message: 'Could not reach the store API. Check SWAG_STORE_API_URL.',
      })
    })

    it('handles ECONNREFUSED error object', () => {
      const result = handleApiError({ code: 'ECONNREFUSED', message: 'connect ECONNREFUSED 127.0.0.1:3000' })

      expect(result.message).toMatch(/reach the store API/i)
    })

    it('handles plain-object TypeError-shaped error', () => {
      const result = handleApiError({ name: 'TypeError', message: 'network failure' })

      expect(result.message).toMatch(/reach the store API/i)
    })
  })

  describe('generic Error objects', () => {
    it('uses the Error message when no HTTP status is present', () => {
      const result = handleApiError(new Error('Something went wrong in the adapter'))

      expect(result).toEqual({ status: 'error', message: 'Something went wrong in the adapter' })
    })

    it('does not rethrow — never crashes the process', () => {
      expect(() => handleApiError(undefined)).not.toThrow()
      expect(() => handleApiError(null)).not.toThrow()
      expect(() => handleApiError(42)).not.toThrow()
      expect(() => handleApiError('a string error')).not.toThrow()
    })
  })

  describe('unknown / edge-case inputs', () => {
    it('returns a fallback message for null', () => {
      const result = handleApiError(null)

      expect(result).toEqual({ status: 'error', message: 'An unexpected error occurred.' })
    })

    it('returns a fallback message for undefined', () => {
      const result = handleApiError(undefined)

      expect(result).toEqual({ status: 'error', message: 'An unexpected error occurred.' })
    })

    it('returns a fallback message for a bare number', () => {
      const result = handleApiError(42)

      expect(result).toEqual({ status: 'error', message: 'An unexpected error occurred.' })
    })
  })
})
