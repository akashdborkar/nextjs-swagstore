import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { server } from './server'

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  process.stderr.write('[MCP] nextjs-swag-store-mcp running on stdio\n')
}

main().catch((error) => {
  process.stderr.write(`[MCP] Fatal startup error: ${error}\n`)
  process.exit(1)
})
