# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev        # Start dev server
pnpm build      # Production build
pnpm lint       # ESLint (flat config, eslint-config-next)
```

No test framework is configured yet. Tests are planned for the upcoming MCP server (`mcp/`) — Jest or Vitest with nock/msw mocks per `mcpserver-spec.md`.

## Environment

Requires `.env.local` at the project root:

```
VERCEL_SECRET_TOKEN=<value>
```

This token is sent as the `x-vercel-protection-bypass` header on all external API calls. No other env vars are needed for the Next.js app. The forthcoming MCP server will also need `SWAG_STORE_API_URL` and `CART_TOKEN`.

## Architecture

**Stack:** Next.js 16, React 19, TypeScript (strict), Tailwind CSS v4, pnpm.

**External API:** `https://vercel-swag-store-api.vercel.app/api` — all products, categories, promotions, cart CRUD. No backend database; the Next.js app is a caching + UI layer over this API.

### Caching Model

This project uses Next.js 16's unified `"use cache"` directive throughout. Six named `cacheLife` profiles are defined in `next.config.ts`: `products`, `featured`, `categories`, `promo`, `search`, `static`. Each has stale/revalidate/expire values tuned to the data's change frequency.

**Rules:**
- Cached server functions are in `app/services/` — they use `"use cache"` + `cacheLife()` + `cacheTag()`.
- Stock is intentionally **not** cached (`cache: 'no-store'`) so it's always real-time.
- Cart Server Actions in `cartService.ts` are never cached.
- Error handling inside cached functions matters: 5xx errors must throw (not cached), 4xx errors may return data (cached). This is not symmetric — follow the existing pattern in `productService.ts`.

**Inner/outer cache pattern** — used for `promoService.ts`: the inner function is cached and throws on error; the outer function is not cached and catches errors, returning `null`. This prevents error states from being cached while still caching successful responses.

**Route handlers as cached proxies** — `app/api/categories/route.ts` and `app/api/search/route.ts` exist specifically so client components can fetch via a cached API route rather than hitting the external API directly.

### Server/Client Component Split

Components are server by default. A component becomes a client component only when it needs:
- Browser APIs (`window`, `sessionStorage`, `new Date()`) — `footer.tsx` is client for this reason
- React hooks (`useState`, `useEffect`, `usePathname`, `useSearchParams`)
- Event handlers

The PromoBanner is a canonical example of the split: `promobanner.tsx` (server, fetches data) wraps `promo-banner-client.tsx` (client, handles dismiss state).

### React.cache() for Per-Request Deduplication

`app/products/[id]/page.tsx` wraps `getProduct` with `React.cache()` as `getProductOnce`. This ensures `generateMetadata` and `ProductDetailContent` share one fetch per request without double-fetching.

### Cart State

Cart state lives in `app/context/Cart/CartProvider.tsx` — a client-side React Context wrapping the entire app. Cart token is stored in `window.sessionStorage` under key `app_cart_token`. Server Actions in `app/services/cartService.ts` (`'use server'`) handle all cart mutations.

### Suspense & Skeletons

All async server components are wrapped in `<Suspense>` with matching skeleton components from `app/ui/skeletons.tsx`. The root layout sets up the Suspense boundaries.

### Async Params (Next.js 16)

Dynamic route params are `Promise`-typed: `params: Promise<{ id: string }>`. Always `await params` before use.

## MCP Server

A TypeScript MCP server lives in `mcp/` and is exposed publicly via a Next.js API route. Full spec in `mcpserver-spec.md`, phased build plan in `mcpserver-blueprint.md`.

### Tools (7 total)

`list_products`, `get_product_details`, `check_stock_availability`, `list_cheap_products`, `get_cart`, `add_to_cart`, `update_cart_quantity` — all wrapping the same external API. Uses `@modelcontextprotocol/sdk` v1.29.0 and `zod`.

### HTTP Transport (Vercel API Route)

The public entry point is `app/api/mcp/route.ts`. It uses `WebStandardStreamableHTTPServerTransport` (Web Standards API, correct for Next.js App Router) in stateless mode (`sessionIdGenerator: undefined`) — a fresh server instance is created per request via `createMcpServer()`.

CORS headers are configured on all responses and the `OPTIONS` preflight handler. Allowed headers include `mcp-protocol-version` (required by MCP Inspector and Claude.ai clients).

**Factory pattern** — `mcp/server.ts` exports `createMcpServer()` for the HTTP route (fresh instance per request) and the module-level `server` singleton for `mcp/index.ts` (stdio, local use).

### Environment Variables

| Variable | Where used |
|---|---|
| `SWAG_STORE_API_URL` | `mcp/config.ts` — base URL for the external API |
| `CART_TOKEN` | `mcp/config.ts` — static token injected into all cart requests |
| `VERCEL_SECRET_TOKEN` | `mcp/config.ts` (optional) + Next.js app — bypass header for external API |

`mcp/config.ts` validates `SWAG_STORE_API_URL` and `CART_TOKEN` at module load time and throws if missing.

### Running Locally

```bash
pnpm dev   # starts Next.js; MCP endpoint at http://localhost:3000/api/mcp
npx @modelcontextprotocol/inspector@latest http://localhost:3000/api/mcp
# → Inspector UI at http://localhost:6274 — use Direct connection type
```

### Stdio Transport (local dev only)

```bash
pnpm mcp-server   # runs mcp/index.ts via tsx with StdioServerTransport
```
