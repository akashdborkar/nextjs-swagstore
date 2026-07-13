import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { SwagStoreApiClient } from './apiClient'
import type { ApiErrorResponse } from './types'

function isApiError(result: unknown): result is ApiErrorResponse {
  return (
    typeof result === 'object' &&
    result !== null &&
    'status' in result &&
    (result as ApiErrorResponse).status === 'error'
  )
}

function toToolResult(data: unknown) {
  const text = JSON.stringify(data)
  if (isApiError(data)) {
    return { content: [{ type: 'text' as const, text }], isError: true }
  }
  return { content: [{ type: 'text' as const, text }] }
}

export function createMcpServer(): McpServer {
  const client = new SwagStoreApiClient()
  const server = new McpServer(
    { name: 'nextjs-swag-store-mcp', version: '1.0.0' },
    { capabilities: { tools: {} } }
  )

  server.registerTool(
    'list_products',
    {
      description:
        'Retrieves a paginated list of products. Supports filtering by category, search term, and featured status.',
      inputSchema: {
        page: z.number().min(1).optional().default(1),
        limit: z.number().min(1).max(100).optional().default(10),
        category: z.enum(['bottles', 'cups', 'mugs', 'desk', 'stationery']).optional(),
        search: z.string().optional(),
        featured: z.enum(['true', 'false']).optional(),
      },
    },
    async (args) => toToolResult(await client.fetchProducts(args))
  )

  server.registerTool(
    'get_product_details',
    {
      description: 'Retrieves detailed information for a single product using its ID or slug.',
      inputSchema: {
        productId: z.string().describe('The unique ID or slug of the product'),
      },
    },
    async ({ productId }) => toToolResult(await client.fetchProductDetails(productId))
  )

  server.registerTool(
    'check_stock_availability',
    {
      description: 'Checks the current inventory level for a specific product prior to cart operations.',
      inputSchema: {
        productId: z.string().describe('The unique ID or slug of the product'),
      },
    },
    async ({ productId }) => toToolResult(await client.checkStock(productId))
  )

  server.registerTool(
    'list_cheap_products',
    {
      description: 'Retrieves products sorted by the lowest price first.',
      inputSchema: {
        limit: z.number().min(1).max(50).optional().default(5),
      },
    },
    async ({ limit }) => {
      // The API has no sort parameter — fetch a wide pool and sort client-side
      const result = await client.fetchProducts({ limit: 100 })
      if (isApiError(result)) return toToolResult(result)
      const cheapest = [...result].sort((a, b) => a.price - b.price).slice(0, limit)
      return toToolResult(cheapest)
    }
  )

  server.registerTool(
    'get_cart',
    {
      description:
        "Retrieves the current contents of the AI's shopping cart using the environment CART_TOKEN.",
    },
    async () => toToolResult(await client.fetchCart())
  )

  server.registerTool(
    'add_to_cart',
    {
      description: 'Adds a specified quantity of a product to the cart.',
      inputSchema: {
        productId: z.string().describe('The unique ID or slug of the product'),
        quantity: z.number().min(1).default(1),
      },
    },
    async ({ productId, quantity }) => toToolResult(await client.addToCart(productId, quantity))
  )

  server.registerTool(
    'update_cart_quantity',
    {
      description:
        'Updates the quantity of an existing item in the cart. Setting the quantity to 0 removes the item entirely.',
      inputSchema: {
        productId: z.string().describe('The unique ID or slug of the product currently in the cart'),
        quantity: z
          .number()
          .min(0)
          .describe('The new desired quantity. 0 removes the item.'),
      },
    },
    async ({ productId, quantity }) => toToolResult(await client.updateCart(productId, quantity))
  )

  return server
}

// Singleton for the stdio transport entrypoint (mcp/index.ts)
export const server = createMcpServer()
