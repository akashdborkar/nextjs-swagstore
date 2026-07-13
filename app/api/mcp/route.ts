import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js'
import { createMcpServer } from '../../../mcp/server'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, mcp-session-id, mcp-protocol-version',
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

async function handler(req: Request): Promise<Response> {
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // stateless — required for Vercel serverless
  })
  const server = createMcpServer()
  await server.connect(transport)
  const mcpResponse = await transport.handleRequest(req)

  // Attach CORS headers to the MCP response
  const headers = new Headers(mcpResponse.headers)
  Object.entries(CORS_HEADERS).forEach(([k, v]) => headers.set(k, v))
  return new Response(mcpResponse.body, { status: mcpResponse.status, headers })
}

export { handler as GET, handler as POST, handler as DELETE }
