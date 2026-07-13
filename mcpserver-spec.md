MCP Server Specification: Next.js Swag Store
1. Executive Summary
This specification outlines the development of a Model Context Protocol (MCP) server. The server exposes the functionalities of an existing Next.js e-commerce Swag Store to AI assistants (e.g., Claude Desktop, Cursor). Operating as a REST API client, it bridges the AI's tool calls with the store's backend API endpoints.

2. Architecture & Technology Stack
Language: TypeScript

Runtime: Node.js

Framework: Official @modelcontextprotocol/sdk

Validation: zod (for strict tool input schema definitions)

HTTP Client: Native fetch API (or axios)

Target API: Existing Next.js API routes

3. Environment & Configuration
The server must support seamless switching between local development and production environments via environment variables.

SWAG_STORE_API_URL: The base URL for the backend API.

Development example: http://localhost:3000/api

Production example: https://vercel-swag-store-api.vercel.app/api

CART_TOKEN: A static token used to persist the AI's cart state across chat sessions. The server reads this and injects it into the headers or payload of all cart-related API requests.

4. Core Server Behaviors
State Management
The server must inject the CART_TOKEN environment variable into all requests interfacing with cart functionality.

Cross-device or cross-browser persistence is out of scope; the static token ensures a consistent "AI testing cart."

Data Transformation (Response Stripping)
Requirement: The server must not return raw, unfiltered API responses to the LLM.

Implementation: Pass all API responses through a transformer utility. Strip out unnecessary metadata (SEO tags, large HTML blocks, internal database timestamps).

Output Structure: Returned objects must only include strictly necessary fields: id, name, price, stock, description (shortened), and quantity.

Graceful Error Handling
Requirement: Catch all API errors (e.g., 400 Bad Request, 404 Not Found). Do not throw hard Node.js exceptions that break the MCP connection.

Implementation: Return a structured JSON error object back to the AI.

Format: { "status": "error", "message": "Human-readable explanation" }

Example: { "status": "error", "message": "Failed to add to cart. Product 'tshirt_001' is out of stock." }

5. Tool Definitions & Schemas
The server must expose the following 7 tools. Input schemas must be strictly validated using zod.

Tool 1: list_products
Description: Retrieves a paginated list of products. Supports filtering by category, search term, and featured status.

Input Schema:

TypeScript
z.object({
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(100).optional().default(10),
  category: z.enum(["bottles", "cups", "mugs", "desk", "stationery"]).optional(),
  search: z.string().optional(),
  featured: z.enum(["true", "false"]).optional()
})
Tool 2: get_product_details
Description: Retrieves detailed information for a single product using its ID or slug.

Input Schema:

TypeScript
z.object({
  productId: z.string().describe("The unique ID or slug of the product")
})
Tool 3: check_stock_availability
Description: Checks the current inventory level for a specific product prior to cart operations.

Input Schema:

TypeScript
z.object({
  productId: z.string().describe("The unique ID or slug of the product")
})
Tool 4: list_cheap_products
Description: Retrieves products sorted by the lowest price first.

Input Schema:

TypeScript
z.object({
  limit: z.number().min(1).max(50).optional().default(5)
})
Tool 5: get_cart
Description: Retrieves the current contents of the AI's shopping cart using the environment CART_TOKEN.

Input Schema:

TypeScript
z.object({})
Tool 6: add_to_cart
Description: Adds a specified quantity of a product to the cart.

Input Schema:

TypeScript
z.object({
  productId: z.string().describe("The unique ID or slug of the product"),
  quantity: z.number().min(1).default(1)
})
Tool 7: update_cart_quantity
Description: Updates the quantity of an existing item in the cart. Setting the quantity to 0 removes the item entirely.

Input Schema:

TypeScript
z.object({
  productId: z.string().describe("The unique ID or slug of the product currently in the cart"),
  quantity: z.number().min(0).describe("The new desired quantity. 0 removes the item.")
})
6. Testing Plan
To ensure reliability before connecting the server to a live AI client, the developer must execute the following testing phases:

Phase 1: Unit Testing
Data Transformers: Write tests to ensure the response stripping utility correctly removes bloated metadata and retains only id, name, price, stock, description, and quantity.

Error Formatters: Verify that caught exceptions are correctly transformed into the { status: "error", message: "..." } JSON structure.

Phase 2: Integration Testing
Mocked API Calls: Use tools like nock or msw to mock the Next.js API endpoints.

Validation: Trigger each MCP tool programmatically and verify that the correct HTTP requests (with proper query parameters and the CART_TOKEN header) are dispatched.

Phase 3: MCP Protocol Testing
MCP Inspector: Use the official @modelcontextprotocol/inspector CLI tool to spin up the server independently of Claude/Cursor.

Manual Tool Execution: Manually execute list_products, add_to_cart, and get_cart through the inspector UI to verify end-to-end connectivity and schema validation.

Error Simulation: Intentionally pass invalid product IDs through the inspector to verify the graceful error handling prevents protocol crashes.