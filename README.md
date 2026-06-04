# Swag Store

A branded merchandise shop built with Next.js 16. Browse and purchase curated company swag — apparel, accessories, and drinkware.

**Live:** [nextjs-swagstore.vercel.app](https://nextjs-swagstore.vercel.app/)

## Stack

Next.js 16 · TypeScript · Tailwind CSS · Vercel

## Getting Started

```bash
npm install
npm run dev
```

Set `VERCEL_SECRET_TOKEN` in `.env.local` for the upstream API bypass header.

## Key Concepts

- **`"use cache"` + named `cacheLife` profiles** — all data fetching uses Next.js 16's cache directive with six profiles (`products`, `featured`, `categories`, `promo`, `search`, `static`) configured in `next.config.ts`
- **Partial prerendering** — `cacheComponents: true` with `<Suspense>` boundaries for streaming
- **Server / Client split** — server components handle all fetching; client components (`Header`, `Stocks`, `PromoBannerClient`, `CartProvider`) are leaf nodes only
- **Cache-safe error handling** — inner cached functions throw on errors (not cached); outer functions catch and return `null` gracefully
- **Route Handlers as cached proxies** — `/api/search` and `/api/categories` cache upstream responses per query profile
- **LCP optimisation** — hero image uses `priority` (`fetchpriority=high` + `<link rel="preload">`)
- **`React.cache()`** — deduplicates `getProduct` between `generateMetadata` and page render within a single request
- App Router, Suspense, `generateMetadata`, `cacheTag`, Context API, `next/image`, `next/font`
