# Swag Store — Technical Architecture Document

**Project:** Next.js Swag Store  
**Framework:** Next.js 16.2.3 (App Router)  
**Author:** Akash Borkar  
**Date:** June 2026

---

## 1. Project Overview

Swag Store is a full-stack e-commerce storefront built entirely on the Next.js App Router. It connects to an external Vercel Swag Store REST API for product, stock, promotion, and cart data. The architecture is designed around the **composable caching** model introduced in Next.js 16 — delivering dynamic experiences at static-level performance.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.3 (App Router) |
| Language | TypeScript 5.x |
| Styling | Tailwind CSS v4 |
| Fonts | Geist Sans & Geist Mono (Google Fonts via `next/font`) |
| Images | `next/image` with remote pattern from Vercel Blob |
| State Management | React Context API (cart state) |
| Data | External REST API (`vercel-swag-store-api.vercel.app`) |
| Deployment Target | Vercel |

---

## 3. Folder Structure

```
app/
├── api/                          # Next.js Route Handlers (API layer)
│   ├── categories/route.ts       # GET /api/categories
│   ├── promo/route.ts            # GET /api/promo
│   └── search/route.ts           # GET /api/search
├── context/
│   └── Cart/CartProvider.tsx     # Client-side cart state via React Context
├── products/
│   └── [id]/
│       ├── page.tsx              # Dynamic product detail page
│       └── not-found.tsx         # 404 for unknown product IDs
├── services/                     # Server-side data access layer
│   ├── cartService.ts            # Server Actions for cart mutations
│   ├── productService.ts         # Cached product data fetchers
│   └── promoService.ts           # Cached promo data fetcher
├── ui/                           # Reusable UI components
│   ├── home/
│   │   ├── hero.tsx              # Static hero section (server)
│   │   ├── promobanner.tsx       # Server wrapper for promo banner
│   │   └── promo-banner-client.tsx  # Client shell (dismiss state)
│   ├── products/
│   │   ├── feature-products.tsx  # Cached featured products grid (server)
│   │   ├── product.tsx           # Product detail layout (server)
│   │   ├── product-card.tsx      # Product card (server, props-only)
│   │   ├── stock.tsx             # Stock + add-to-cart (client)
│   │   ├── cart.tsx              # Cart page UI (client)
│   │   ├── search.tsx            # Search interface (client)
│   │   ├── category-selector.tsx # Category dropdown (client)
│   │   └── cart-quantity-update.tsx  # Quantity input (client)
│   ├── footer.tsx                # Footer (client, needs new Date())
│   ├── header.tsx                # Header with cart count (client)
│   ├── skeletons.tsx             # Loading skeleton components
│   └── types.ts                  # Shared TypeScript interfaces
├── cart/page.tsx                 # /cart route
├── search/page.tsx               # /search route
├── error.tsx                     # Global error boundary (client)
├── layout.tsx                    # Root layout (server)
├── page.tsx                      # Home page /
└── globals.css
```

---

## 4. Routing

The app uses the **Next.js App Router** with file-system routing. Every `page.tsx` inside a folder becomes a URL segment.

### Route Map

| URL | File | Type | Description |
|---|---|---|---|
| `/` | `app/page.tsx` | Server Component | Home page with hero, promo banner, featured products |
| `/products/[id]` | `app/products/[id]/page.tsx` | Dynamic Server Component | Product detail page, `id` comes from URL |
| `/search` | `app/search/page.tsx` | Server Component (wrapper) | Search page — delegates UI to client component |
| `/cart` | `app/cart/page.tsx` | Server Component (wrapper) | Cart page — delegates UI to client component |
| `/api/categories` | `app/api/categories/route.ts` | Route Handler | Returns product categories |
| `/api/search` | `app/api/search/route.ts` | Route Handler | Returns search/filtered products |

### Dynamic Routing — `/products/[id]`

The `[id]` folder creates a dynamic segment. Next.js passes `params` as a `Promise<{ id: string }>` in Next.js 15+:

```typescript
type Props = { params: Promise<{ id: string }> };

export default function ProductDetailPage({ params }: Props) {
  return (
    <Suspense fallback={<ProductDetailSkeleton />}>
      <ProductDetailContent params={params} />  // async server component
    </Suspense>
  );
}
```

### `generateMetadata` — Dynamic SEO

On the product detail page, `generateMetadata` generates Open Graph and Twitter card metadata dynamically per product:

```typescript
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductOnce(id);   // React.cache memoizes this
  return {
    title: data.name,
    openGraph: { images: data.images },
    // ...
  };
}
```

---

## 5. Next.js 16 Core Concepts Used

### 5.1 `cacheComponents: true` — Unified Caching Model

Enabled in `next.config.ts`. This activates Next.js 16's new caching model where:
- Everything prerenders a static shell by default
- Developers control what gets cached via the `"use cache"` directive
- Replaces the old ISR / SSG / SSR per-page choice with granular function/component-level control

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  cacheComponents: true,
  cacheLife: { /* named profiles */ },
};
```

---

### 5.2 `"use cache"` Directive

The `"use cache"` directive caches a **function's return value**, not its execution. It works at three levels:

**Function level (service layer):**
```typescript
export async function getProduct(id: string): Promise<ProductResponse> {
  "use cache"
  cacheLife('products');
  cacheTag('products', `product-${id}`);
  return fetch(`/api/products/${id}`).then(r => r.json());
}
```

**Component level (entire rendered JSX):**
```typescript
export default async function FeaturedProducts() {
  "use cache"
  cacheLife('featured');
  cacheTag('products', 'featured-products');
  const data = await getFeatureProducts();
  return <section>...grid of products...</section>;
}
```

**Key constraint:** Dynamic APIs (`cookies()`, `headers()`, `new Date()`, `searchParams`) cannot be called inside a `"use cache"` scope. They must be evaluated outside and passed as arguments.

---

### 5.3 `cacheLife()` — Named Cache Profiles

Named profiles are defined once in `next.config.ts` and referenced by name anywhere. Next.js auto-generates TypeScript types for them on dev server start.

```typescript
cacheLife: {
  products:   { stale: 300,   revalidate: 900,   expire: 3600      },
  featured:   { stale: 600,   revalidate: 1800,  expire: 3600      },
  categories: { stale: 600,   revalidate: 1800,  expire: 3600      },
  promo:      { stale: 60,    revalidate: 180,   expire: 300       },
  search:     { stale: 30,    revalidate: 120,   expire: 600       },
  static:     { stale: 3600,  revalidate: 86400, expire: 31536000  },
}
```

The three fields:
- **`stale`** — seconds a client can serve without checking the server
- **`revalidate`** — seconds after which the server revalidates in the background (stale-while-revalidate)
- **`expire`** — hard maximum; forces regeneration after this

---

### 5.4 `cacheTag()` and `revalidateTag()` — Mutation-Based Invalidation

Cache entries are tagged with logical names so they can be invalidated precisely:

```typescript
cacheTag('products', `product-${id}`);   // tag this entry
// Later, in a server action:
revalidateTag(`product-${id}`);          // bust only that product's cache
revalidateTag('products');               // bust all product caches
```

Tags used in this app:

| Tag | Covers |
|---|---|
| `products` | All product data |
| `product-{id}` | A specific product |
| `featured-products` | Featured products grid |
| `categories` | Category list |
| `promo` | Active promotion |
| `search` | All search results |
| `category-{slug}` | Search results for a specific category |
| `term-{search}` | Search results for a specific popular term |

---

### 5.5 Server Components vs Client Components

Next.js App Router makes **Server Components the default**. A component is only a Client Component if it has `'use client'` at the top.

**Server Components:**
- Run only on the server (never in the browser)
- Can use `async/await` directly
- Can call databases, APIs, environment variables
- Cannot use browser APIs, `useState`, `useEffect`, event handlers

**Client Components:**
- Run in both server (SSR) and browser (hydration)
- Required for interactivity, browser APIs, React hooks
- Marked with `'use client'`

#### Component Classification in This App

| Component | Type | Reason |
|---|---|---|
| `layout.tsx` | Server | Static layout wrapper |
| `page.tsx` (home) | Server | Renders child components |
| `products/[id]/page.tsx` | Server | Async data fetching |
| `FeaturedProducts` | Server + `"use cache"` | Cached grid rendering |
| `hero.tsx` | Server | Pure static content |
| `promobanner.tsx` | Server | Fetches cached promo, passes to client |
| `promo-banner-client.tsx` | Client | Dismiss button needs `useState` |
| `product.tsx` | Server | Receives product as props, calls `getStock` |
| `header.tsx` | Client | Needs `usePathname`, `useCart` hook |
| `footer.tsx` | Client | Needs `new Date()` — not allowed in server without cache |
| `search.tsx` | Client | Needs `useSearchParams`, `useRouter`, `useEffect` |
| `stock.tsx` | Client | Add-to-cart interactivity, `useCart` |
| `cart.tsx` | Client | Full cart UI, `useCart` context |
| `CartProvider` | Client | Context provider — must wrap client tree |

---

### 5.6 Suspense Boundaries and Streaming

`<Suspense>` is used throughout to enable **partial prerendering** — the static shell is served instantly while dynamic content streams in.

```typescript
// Home page
export default function Home() {
  return (
    <main>
      <Suspense fallback={<p>Fetching latest promotion...</p>}>
        <PromoBanner />           {/* cached server component */}
      </Suspense>
      <Hero />                    {/* fully static */}
      <Suspense fallback={<FeaturedProductsSkeleton />}>
        <FeaturedProducts />      {/* cached server component */}
      </Suspense>
    </main>
  );
}
```

```typescript
// Product detail page — wraps async server component
export default function ProductDetailPage({ params }: Props) {
  return (
    <Suspense fallback={<ProductDetailSkeleton />}>
      <ProductDetailContent params={params} />
    </Suspense>
  );
}
```

```typescript
// Root layout — footer uses new Date(), requires Suspense
<Suspense>
  <Footer />
</Suspense>
```

---

### 5.7 `React.cache()` — Per-Request Memoization

On the product detail page, both `generateMetadata` and the page component call `getProduct(id)`. Without memoization this would be two network calls per request. `React.cache()` deduplicates them within a single request lifecycle:

```typescript
// Wraps the cached service function with per-request dedup
const getProductOnce = cache(getProduct);

// Both calls resolve to the same promise within one request
export async function generateMetadata({ params }) {
  const product = await getProductOnce(id);  // fetch #1 or cache hit
}
async function ProductDetailContent({ params }) {
  const product = await getProductOnce(id);  // same result, no second fetch
}
```

The two-layer caching model:
- **`"use cache"` (`getProduct`)** — cross-request cache, survives between users/deploys
- **`React.cache()` (`getProductOnce`)** — per-request memoization, deduplicates within one render pass

---

### 5.8 Server Actions — `'use server'`

Server Actions are async functions marked with `'use server'` that can be called from client components. They run exclusively on the server and are exposed as encrypted POST endpoints by Next.js.

Used in `cartService.ts` — called from `CartProvider` (a client component):

```typescript
'use server';

export async function createCart() { /* POST /api/cart/create */ }
export async function addToExistingCart(productId, quantity, token) { /* POST /api/cart */ }
export async function fetchExistingCart(cartToken) { /* GET /api/cart */ }
export async function updateCartItemQuantity(token, itemId, quantity) { /* PATCH /api/cart/:id */ }
export async function removeFromCart(token, itemId) { /* DELETE /api/cart/:id */ }
```

**Important distinction:** `productService.ts` does NOT use `'use server'` — those functions are called only from server components and use `"use cache"` instead. `'use server'` is only needed when client components need to call server-side code.

---

### 5.9 Route Handlers (API Routes)

Located in `app/api/*/route.ts`. Each file exports named HTTP method handlers. These act as a proxy layer between the browser and the external Swag Store API, adding caching and auth token injection.

**Pattern used — cached inner function:**
```typescript
// The route handler reads dynamic request data (URL params)
// so it cannot be cached. But the upstream fetch CAN be.
async function fetchCategories() {
  "use cache"
  cacheLife('categories');
  cacheTag('categories');
  return fetch('https://vercel-swag-store-api.vercel.app/api/categories', {
    headers: { 'x-vercel-protection-bypass': process.env.VERCEL_SECRET_TOKEN }
  }).then(r => r.json());
}

export async function GET() {
  const data = await fetchCategories();   // dynamic handler calls cached function
  return NextResponse.json(data);
}
```

**Search route — tiered caching:**
```typescript
async function fetchSearchResults(search, category, limit, featured) {
  "use cache"
  // Different cache profiles based on query type:
  if (!search && !category)                 cacheLife('featured');   // 10m stale
  else if (category && !search)             cacheLife('categories'); // 10m stale
  else if (POPULAR_TERMS.includes(search))  cacheLife('search');     // 30s stale
  else                                      cacheLife({ stale: 0, revalidate: 60, expire: 120 });
}
```

---

## 6. Data Flow

### Home Page

```
Request → layout.tsx (server)
  → Header (client, sticky, cart count from context)
  → page.tsx (server)
      → Suspense → PromoBanner (server)
          → promoService.getPromo() ["use cache", cacheLife('promo')]
              → External API /api/promotions
          → PromoBannerClient (client, dismiss state)
      → Hero (server, static)
      → Suspense → FeaturedProducts (server, "use cache")
          → productService.getFeatureProducts() ["use cache", cacheLife('featured')]
              → External API /api/products?featured=true
  → Suspense → Footer (client, year from new Date())
```

### Product Detail Page

```
Request → /products/abc123
  → generateMetadata()
      → React.cache(getProduct)('abc123')   ← cross-request cache hit or API call
  → ProductDetailPage (server, renders Suspense shell immediately)
      → Suspense → ProductDetailContent (async server)
          → React.cache(getProduct)('abc123')  ← same result, no second fetch
          → ProductDetail (server)
              → getStock('abc123') [cache: 'no-store'] ← always fresh
              → Stocks (client, add-to-cart button)
```

### Search Flow

```
Browser → /search
  → SearchPage (server, renders Suspense wrapper)
      → Suspense → Search (client component)
          → useSearchParams() reads ?search=bag&category=all from URL
          → fetch('/api/search?search=bag')
              → GET /api/search (route handler, reads URL params)
                  → fetchSearchResults('bag', '', '5', '') ["use cache"]
                      → cacheLife('search') — 30s stale
                      → External API /api/products?search=bag
          → renders ProductCard[] grid
```

### Cart Flow

```
Browser → /cart
  → CartPage (server wrapper, just renders <Cart />)
      → Cart (client)
          → useCart() → CartContext
              → token read from sessionStorage
              → fetchExistingCart(token) [Server Action, no cache]
          → renders items, handles quantity/remove via Server Actions
```

---

## 7. Cart State Management

Cart state is managed with **React Context** (`CartProvider`) wrapping the entire app at the root layout level.

### Token Strategy
- On first "Add to Cart", a cart is created via `createCart()` Server Action
- The API returns a `x-cart-token` response header
- Token is stored in `window.sessionStorage` (persists within tab, not across tabs or after browser close)
- All subsequent cart operations send this token as `x-cart-token` request header

### Context API
```typescript
interface CartProviderProps {
  cart: CartModel | undefined;
  loading: boolean | undefined;
  token: string | null;
  addToCart(productId: string, quantity?: number): Promise<{ success: boolean }>;
  updateQuantity(itemId: string, quantity: number): void;
  removeItem(itemId: string): void;
  fetchCart(): void;
}
```

The `Header` and `Stocks` components both consume this context via `useCart()`.

---

## 8. Caching Architecture Summary

### What is Cached and How

| Data | Cache Level | Profile | Tags | Why |
|---|---|---|---|---|
| Individual product | Function (`getProduct`) | `products` — 5m/15m/1h | `products`, `product-{id}` | Changes rarely, shared across users |
| Featured products | Function + Component | `featured` — 10m/30m/1h | `products`, `featured-products` | Heavy grid, changes rarely |
| Categories | API route inner fn | `categories` — 10m/30m/1h | `categories` | Very stable data |
| Promo | Function (`getPromo`) | `promo` — 1m/3m/5m | `promo` | Short-lived, marketing-driven |
| Search results | API route inner fn | `search` / `featured` / `categories` (tiered) | `search`, `term-*`, `category-*` | Tiered by how common the query is |
| Footer HTML | Component | `static` — 1h/24h/1yr | — | Purely static markup |
| Stock | Not cached | `cache: 'no-store'` | — | Must always be real-time |
| Cart operations | Not cached | `cache: 'no-store'` | — | User-specific, mutation-based |

### Cache Layers in Order (outer to inner)

```
Component cache ("use cache" on FeaturedProducts)
  └─ Function cache ("use cache" on getFeatureProducts)
       └─ HTTP Response cache (fetch with no-store removed)
            └─ External API
```

On a warm cache: only the outermost layer is hit — the entire rendered JSX is returned directly.

### Why Stock Is Never Cached
Product stock (`/api/products/:id/stock`) uses `cache: 'no-store'` because:
- Stock can drop to zero at any moment
- Showing stale in-stock status when a product is sold out creates a bad UX
- The add-to-cart API would fail anyway, but showing "In Stock" is misleading

---

## 9. The `new Date()` Problem in Next.js 16

Next.js 16 with `cacheComponents: true` enforces that prerendered server components and cached components must be deterministic. Calling `new Date()` in these contexts is blocked because:

- A **prerendered server component** (layout, page) cannot call `new Date()` — the static shell is computed once, it can't embed runtime values
- A **`"use cache"` component/function** cannot call `new Date()` — the result is cached and the value would be frozen

### Solution Used: Client Component for the Footer

```typescript
// footer.tsx
'use client';
export default function Footer() {
  const year = new Date().getFullYear();  // safe: client runs in browser
  return <footer>© {year} Swag Store</footer>;
}
```

```typescript
// layout.tsx
<Suspense>
  <Footer />   // Suspense required for Client Components calling new Date() during prerender
</Suspense>
```

The `<Suspense>` boundary tells Next.js: this part of the tree is allowed to be dynamic at render time. Without it, Next.js throws an error because it can't include a runtime value in the prerendered shell.

### Rule of Thumb for `new Date()` in Next.js 16

| Context | Allowed? | Solution |
|---|---|---|
| `"use cache"` function | No | Pass year as argument from non-cached caller |
| Prerendered server component | No | Move to client component |
| Client component | Yes | Must have `<Suspense>` ancestor in the server tree |

---

## 10. Component Splitting Pattern — PromoBanner

A key architectural pattern: **splitting a data-fetching component into a server wrapper + client shell**.

### Before (anti-pattern)
```
PromoBanner (client)
  useEffect → fetch('/api/promo') → setPromo()
  useState(isVisible) → dismiss button
```
Problems:
- Data fetches after hydration (client waterfall)
- No server-side caching
- Empty banner on first render

### After (composable caching pattern)
```
promobanner.tsx (server)                   ← fetches cached data
  getPromo() ["use cache", cacheLife('promo')]
  → passes PromoProps to client shell

promo-banner-client.tsx (client)           ← handles dismiss only
  useState(isVisible)
  props.promo → renders content
```

Benefits:
- Promo data is cached on the server for 1–5 minutes
- Banner arrives pre-filled on first paint
- Client component is minimal — only the dismiss button state

---

## 11. Authentication & API Security

The external Vercel Swag Store API is protected by Vercel Deployment Protection. All server-side requests include a bypass token:

```typescript
headers: {
  'x-vercel-protection-bypass': process.env.VERCEL_SECRET_TOKEN || '',
}
```

This token is stored as an environment variable and **never exposed to the client**. All requests to the external API go through:
1. Server Components (via `productService.ts`, `promoService.ts`)
2. Route Handlers (`/api/*`) — proxied for client-side Search component

The `VERCEL_SECRET_TOKEN` is only accessed in server-side code, ensuring it never appears in browser bundles.

---

## 12. Skeleton Loading States

Each major async section has a matching skeleton component in `skeletons.tsx` that mirrors the layout of the real content:

| Skeleton | Used by | Matches layout of |
|---|---|---|
| `FeaturedProductsSkeleton` | Home page Suspense | 3-column product grid |
| `ProductDetailSkeleton` | Product detail Suspense | Split image + details layout |
| `SearchSkeleton` | Search page Suspense | Search bar + 5-column grid |
| `HeaderSkeleton` | Layout Suspense | Header nav bar |

Skeletons prevent cumulative layout shift (CLS) by matching the dimensions of the content they replace.

---

## 13. Key Files Reference

| File | Purpose |
|---|---|
| `next.config.ts` | `cacheComponents`, `cacheLife` profiles, image domains |
| `app/layout.tsx` | Root layout, CartProvider, fonts, Suspense for header/footer |
| `app/services/productService.ts` | Cached product + stock data fetchers |
| `app/services/promoService.ts` | Cached promo data fetcher (split from route handler) |
| `app/services/cartService.ts` | Server Actions for all cart mutations |
| `app/context/Cart/CartProvider.tsx` | Cart state, token management, context consumers |
| `app/ui/types.ts` | All shared TypeScript interfaces |
| `app/ui/skeletons.tsx` | All Suspense fallback loading states |

---

## 14. Next.js 16 Concepts — Quick Reference

| Concept | What it does | Where used |
|---|---|---|
| `cacheComponents: true` | Enables unified caching model | `next.config.ts` |
| `"use cache"` | Caches function/component return value | `productService`, `promoService`, `FeaturedProducts`, API routes |
| `cacheLife(profile)` | Sets stale/revalidate/expire for a cache entry | All cached functions |
| `cacheTag(tag)` | Labels cache entry for targeted invalidation | All cached functions |
| `revalidateTag(tag)` | Invalidates entries by tag (used in mutations) | Ready to wire to admin actions |
| `React.cache()` | Per-request memoization (dedup within one render) | `getProductOnce` in product detail page |
| `'use server'` | Marks file/function as Server Action (callable from client) | `cartService.ts` |
| `'use client'` | Marks component as Client Component | Header, Footer, Cart, Search, Stock, CartProvider |
| `Suspense` | Enables streaming; required for dynamic client content | All major async sections |
| `generateMetadata` | Dynamic per-page SEO metadata | Product detail page |
| `notFound()` | Renders 404 page programmatically | Product detail — unknown IDs |
| `params: Promise<{id}>` | Next.js 15+ async params pattern | Dynamic routes |

---

*Document generated: June 2026*
