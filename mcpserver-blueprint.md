┌────────────────────────────────────────────────────────┐
│ Phase 1: MCP Tooling Integration & Config (Existing App)│
└───────────────────────────┬────────────────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│ Phase 2: Domain Logic (Transformers & Errors)          │
└───────────────────────────┬────────────────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│ Phase 3: REST Client (Bridging MCP to Next.js API)     │
└───────────────────────────┬────────────────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│ Phase 4: Server Registration & Execution Scripts       │
└────────────────────────────────────────────────────────┘
Updated Code-Generation Prompts
Feed these prompts to your code-generation LLM sequentially.

Prompt 1: MCP Dependency Integration and Configuration
We are adding a Model Context Protocol (MCP) server to an EXISTING Next.js TypeScript project. Do not initialize a new project; assume `package.json` and standard Next.js configurations already exist. Our goal is to create a dedicated `mcp/` directory to house this server cleanly without interfering with the Next.js app router.

Execute the following requirements:
1. Provide the exact `npm install` command to add `@modelcontextprotocol/sdk` and `zod` as standard dependencies, plus `tsx` (to execute the TypeScript server directly) as a dev dependency.
2. Create a new directory structure for the MCP server at the root level: `mcp/`.
3. Create a configuration module in `mcp/config.ts`. It must parse, validate using Zod, and export two runtime environment parameters:
   - `SWAG_STORE_API_URL`: A valid URL string.
   - `CART_TOKEN`: A non-empty validation token string.
   Ensure that if these parameters are missing from `process.env` (usually loaded from Next.js's `.env.local`), the configuration logic immediately throws descriptive validation error logs upon execution.
4. Write a unit test file `mcp/__tests__/config.test.ts` ensuring that `mcp/config.ts` successfully asserts configurations when variables are properly assigned, and cleanly throws exceptions when parameters are missing. Use the existing testing framework (e.g., Jest or Vitest) that is standard for Next.js.

Provide the complete source code for the configuration file and its test suite. Do not use placeholders.


Prompt 2: Data Transformers and Error Normalization (TDD)
Implement the Data Transformation layer and Error Normalization utilities for our MCP server inside the new `mcp/` directory. This layer ensures that raw Next.js API responses are stripped of heavy metadata before being passed back to the AI's context window.

Execute the following requirements:
1. Create a dedicated TypeScript types file `mcp/types.ts` defining:
   - Complete internal representations for the raw product, product list, and cart payloads returned by our Next.js API.
   - Standardized output interfaces: Every mapped payload must ONLY expose `id`, `name`, `price`, `stock`, `description`, and `quantity`.
2. Create a file `mcp/transformers.ts` containing the structural data cleaning features:
   - `transformProduct(rawProduct: any): CleanProduct`: Transforms full e-commerce items into the stripped-down schema.
   - `transformCart(rawCart: any): CleanCart`: Aggregates the cart, dropping tracking timestamps, large image arrays, and nested meta records.
3. Create a file `mcp/errors.ts` implementing an error normalizer:
   - `handleApiError(error: any): { status: "error"; message: string }`: Catches network exceptions or HTTP error codes and transforms them into a unified JSON format: `{ "status": "error", "message": "Human-readable explanation" }`.
4. Create test suites `mcp/__tests__/transformers.test.ts` and `mcp/__tests__/errors.test.ts`:
   - Supply realistic bloated mock JSON data to verify data transformations remain defensive and accurate.
   - Assert the error wrapper properly structures functional messaging without letting hard Node.js exceptions crash the process.

Provide the complete source code for `mcp/types.ts`, `mcp/transformers.ts`, `mcp/errors.ts`, and their respective test suites.

Prompt 3: Swag Store Core API HttpClient Implementation
Build the core network orchestration client `mcp/apiClient.ts` that safely manages communications with our Next.js backend API routes. Even though this client lives in the same repository as the Next.js app, it must act as an external REST client targeting the API URLs to ensure decoupled architecture.

Execute the following requirements:
1. Implement a class wrapper `SwagStoreApiClient` that imports the configuration (URL and Token) from `mcp/config.ts`.
2. Build dedicated client methods providing access to the server workflows using the native `fetch` API:
   - `fetchProducts(params: { page?: number; limit?: number; category?: string; search?: string; featured?: string })`
   - `fetchProductDetails(productId: string)`
   - `checkStock(productId: string)`
   - `fetchCart()`: Attaches the active static `CART_TOKEN` state context using standard headers or query parameters as required by the API.
   - `addToCart(productId: string, quantity: number)`
   - `updateCart(productId: string, quantity: number)`
3. Wrap every network call inside a `try/catch` block. Ensure the API response bodies are parsed, run through the formatting utilities in `mcp/transformers.ts`, and returned. If a request fails, route the error through `handleApiError` from `mcp/errors.ts`, returning the structured error frame.
4. Create a test suite inside `mcp/__tests__/apiClient.test.ts` mocking the native `fetch` function. Verify that the correct URLs and query parameters are generated, the `CART_TOKEN` is passed, and network failures are intercepted gracefully.

Provide complete implementation code for all files without using placeholders.


Prompt 4: MCP Protocol Implementation and Execution Script
Assemble the final Model Context Protocol (MCP) server layer to register the tools and expose the Next.js Swag Store functionality to AI clients like Claude Desktop and Cursor.

Execute the following requirements:
1. Create the server file `mcp/server.ts`. Instantiate a core `Server` from `@modelcontextprotocol/sdk/server/index.js` with the identity `name: "nextjs-swag-store-mcp"`, `version: "1.0.0"`.
2. Implement the `ListToolsRequestSchema` handler. Define all 7 system tools explicitly using Zod runtime object specifications: `list_products`, `get_product_details`, `check_stock_availability`, `list_cheap_products`, `get_cart`, `add_to_cart`, and `update_cart_quantity`. Use precise descriptions for all tool schemas.
3. Implement the `CallToolRequestSchema` handler. Create a router switch block targeting the tool names. Dispatch inputs to an instance of `SwagStoreApiClient`, retrieve the payload, and encapsulate the response within an MCP-compliant standard format:
   ```json
   {
     "content": [{ "type": "text", "text": "JSON_STRINGIFIED_TRANSFORMED_DATA" }]
   }
Ensure tool errors (objects returning "status": "error") set isError: true inside the response envelope.
4. Establish process initialization: Set up transport mechanisms reading from standard system I/O pipelines (new StdioServerTransport()).
5. Create the execution entrypoint mcp/index.ts that boots the server and initializes runtime listeners.
6. Provide the exact JSON to add to the package.json "scripts" block to run the server via standard I/O (e.g., "mcp-server": "tsx mcp/index.ts").

Provide complete file outputs for mcp/server.ts and mcp/index.ts to fully wire up the project.