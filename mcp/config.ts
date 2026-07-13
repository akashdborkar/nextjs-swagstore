import { z } from 'zod'

const schema = z.object({
  SWAG_STORE_API_URL: z.string().url('SWAG_STORE_API_URL must be a valid URL'),
  CART_TOKEN: z.string().min(1, 'CART_TOKEN must not be empty'),
  VERCEL_SECRET_TOKEN: z.string().optional().default(''),
})

const result = schema.safeParse(process.env)

if (!result.success) {
  const messages = result.error.issues
    .map(e => `  ${String(e.path[0])}: ${e.message}`)
    .join('\n')
  console.error(`[MCP] Configuration error:\n${messages}`)
  throw new Error(`[MCP] Invalid configuration:\n${messages}`)
}

export const config = result.data
