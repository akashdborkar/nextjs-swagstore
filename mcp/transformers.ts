import type { CleanProduct, CleanCartItem, CleanCart } from './types'

const MAX_DESCRIPTION_LENGTH = 150

function shortenDescription(desc: unknown): string {
  if (typeof desc !== 'string' || !desc) return ''
  return desc.length > MAX_DESCRIPTION_LENGTH
    ? `${desc.slice(0, MAX_DESCRIPTION_LENGTH)}...`
    : desc
}

export function transformProduct(raw: any): CleanProduct {
  return {
    id: raw?.id ?? '',
    name: raw?.name ?? '',
    price: typeof raw?.price === 'number' ? raw.price : 0,
    description: shortenDescription(raw?.description),
    ...(typeof raw?.stock === 'number' && { stock: raw.stock }),
  }
}

export function transformCart(raw: any): CleanCart {
  const items: CleanCartItem[] = Array.isArray(raw?.items)
    ? raw.items.map((item: any): CleanCartItem => ({
        id: item?.product?.id ?? '',
        name: item?.product?.name ?? '',
        price: typeof item?.price === 'number' ? item.price : 0,
        description: shortenDescription(item?.product?.description),
        quantity: typeof item?.quantity === 'number' ? item.quantity : 0,
      }))
    : []

  return {
    items,
    subtotal: typeof raw?.subtotal === 'number' ? raw.subtotal : 0,
    totalItems: typeof raw?.totalItems === 'number' ? raw.totalItems : 0,
  }
}
