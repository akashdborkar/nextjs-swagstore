import type { ApiErrorResponse } from './types'

export function handleApiError(error: any): ApiErrorResponse {
  const httpStatus = typeof error?.status === 'number' ? error.status : null

  if (httpStatus !== null) {
    if (httpStatus === 400) {
      const detail = error?.message ? `: ${error.message}` : ''
      return { status: 'error', message: `Bad request${detail}` }
    }
    if (httpStatus === 401 || httpStatus === 403) {
      return { status: 'error', message: 'Unauthorized: check your CART_TOKEN.' }
    }
    if (httpStatus === 404) {
      return { status: 'error', message: 'Resource not found.' }
    }
    if (httpStatus >= 500) {
      return { status: 'error', message: 'The store API is temporarily unavailable. Try again later.' }
    }
    return { status: 'error', message: error?.message ?? `Request failed with status ${httpStatus}.` }
  }

  // Network-level failures: fetch throws a TypeError on DNS/connection errors
  if (error instanceof TypeError || error?.name === 'TypeError' || error?.code === 'ECONNREFUSED') {
    return { status: 'error', message: 'Could not reach the store API. Check SWAG_STORE_API_URL.' }
  }

  if (error?.message && typeof error.message === 'string') {
    return { status: 'error', message: error.message }
  }

  return { status: 'error', message: 'An unexpected error occurred.' }
}
