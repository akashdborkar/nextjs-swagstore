Next.js Swag Store MCP Server - Implementation Checklist
Phase 1: Project Setup & Configuration
[x] Install Dependencies

[x] Run npm install @modelcontextprotocol/sdk zod

[x] Run npm install -D tsx (for executing the server directly)

[x] Establish Directory Structure

[x] Create an mcp/ directory at the root of the existing Next.js project

[x] Create an mcp/__tests__/ directory for test files

[x] Implement Configuration Module (mcp/config.ts)

[x] Define a zod schema to validate required environment variables

[x] Extract and export SWAG_STORE_API_URL

[x] Extract and export CART_TOKEN

[x] Add logic to throw a clear, descriptive error if either variable is missing

[x] Test Configuration (mcp/__tests__/config.test.ts)

[x] Write a test asserting successful config loading when env vars are present

[x] Write a test asserting that an exception is thrown when variables are missing

[x] Run the test suite to verify

Phase 2: Domain Logic (Transformers & Errors)
[x] Define Types (mcp/types.ts)

[x] Define internal interfaces for raw Next.js API payloads (Product, ProductList, Cart)

[x] Define standardized output interfaces restricting fields to only: id, name, price, stock, description, and quantity

[x] Implement Data Transformers (mcp/transformers.ts)

[x] Write transformProduct(rawProduct) to strip bloated metadata

[x] Write transformCart(rawCart) to aggregate lines and drop nested/visual metadata

[x] Implement Error Normalizer (mcp/errors.ts)

[x] Write handleApiError(error) to catch network exceptions/HTTP codes

[x] Ensure handleApiError returns the strict format: { status: "error", message: "..." }

[x] Test Domain Logic

[x] Create mcp/__tests__/transformers.test.ts

[x] Pass bloated mock JSON to transformers and verify the output is perfectly stripped

[x] Create mcp/__tests__/errors.test.ts

[x] Pass mock network errors and verify the normalized JSON output prevents hard crashes

Phase 3: REST Client Implementation
[x] Implement API Client (mcp/apiClient.ts)

[x] Create the SwagStoreApiClient class

[x] Import SWAG_STORE_API_URL and CART_TOKEN from the config module

[x] Build Client Methods (using native fetch)

[x] fetchProducts(params): Include logic for page, limit, category, search, and featured query params

[x] fetchProductDetails(productId)

[x] checkStock(productId)

[x] fetchCart(): Inject CART_TOKEN via headers or query strings as required by your API

[x] addToCart(productId, quantity): Inject CART_TOKEN

[x] updateCart(productId, quantity): Inject CART_TOKEN

[x] Wire Up Error Handling & Transformers in Client

[x] Wrap every fetch call in a try/catch block

[x] Route successful raw responses through mcp/transformers.ts before returning

[x] Route all caught errors through mcp/errors.ts before returning

[x] Test API Client (mcp/__tests__/apiClient.test.ts)

[x] Mock native fetch (or use a tool like nock/msw)

[x] Verify query parameters are properly constructed for list_products

[x] Verify CART_TOKEN is successfully attached to cart requests

[x] Verify network failures are caught and gracefully transformed

Phase 4: MCP Protocol & Execution Scripts
[x] Implement Server Setup (mcp/server.ts)

[x] Instantiate the MCP Server (name: "nextjs-swag-store-mcp", version: "1.0.0")

[x] Register Tool Schemas (ListToolsRequestSchema)

[x] Register list_products (with Zod validation for all query params)

[x] Register get_product_details (Zod: productId)

[x] Register check_stock_availability (Zod: productId)

[x] Register list_cheap_products (Zod: limit)

[x] Register get_cart (Empty object schema)

[x] Register add_to_cart (Zod: productId, quantity)

[x] Register update_cart_quantity (Zod: productId, quantity)

[x] Implement Tool Execution Router (CallToolRequestSchema)

[x] Build a switch block to route incoming tool calls to the SwagStoreApiClient methods

[x] Wrap the client's output in the standard MCP JSON envelope: {"content": [{"type": "text", "text": "..."}]}

[x] Add logic to check for { status: "error" } objects and flag isError: true in the MCP response if found

[x] Establish I/O Transport & Entrypoint

[x] Set up StdioServerTransport in mcp/server.ts

[x] Create mcp/index.ts to boot the server and start standard I/O listeners

[x] Update package.json

[x] Add the execution script to your root package.json: "mcp-server": "tsx mcp/index.ts"

[x] Final Manual Testing

[x] Run pnpm mcp-server to ensure it boots without syntax errors

[x] Tested all 7 tools via MCP Inspector (Direct / Streamable HTTP connection)

[x] Verified list_products returns real product data end-to-end

Phase 5: HTTP Deployment (Vercel API Route)

[x] Add WebStandardStreamableHTTPServerTransport route at app/api/mcp/route.ts

[x] Refactor mcp/server.ts to export createMcpServer() factory (fresh instance per request)

[x] Add CORS headers (Access-Control-Allow-Origin, Methods, Headers incl. mcp-protocol-version)

[x] Add OPTIONS preflight handler

[x] Verify initialize handshake and tools/call work via MCP Inspector

[ ] Set SWAG_STORE_API_URL and CART_TOKEN in Vercel project environment variables

[ ] Deploy to Vercel and confirm public MCP URL responds at /api/mcp
