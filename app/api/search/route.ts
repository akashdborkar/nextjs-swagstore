import { NextResponse } from 'next/server';
import { cacheLife, cacheTag } from 'next/cache';

const POPULAR_TERMS = ['bag', 'tumbler', 'keychain', 'mug', 'cup', 'pencil', 'notebook', 'pen'];
const bypassToken = process.env.VERCEL_SECRET_TOKEN || '';

async function fetchSearchResults(search: string, category: string, limit: string, featured: string) {
  "use cache"

  if (!search && !category) {
    cacheLife('featured');
    cacheTag('search', 'featured-products');
  } else if (category && category !== 'all' && !search) {
    cacheLife('categories');
    cacheTag('search', `category-${category}`);
  } else if (POPULAR_TERMS.includes(search)) {
    cacheLife('search');
    cacheTag('search', `term-${search}`);
  } else {
    cacheLife({ stale: 0, revalidate: 60, expire: 120 });
    cacheTag('search');
  }

  const targetUrl = new URL('https://vercel-swag-store-api.vercel.app/api/products');
  targetUrl.searchParams.set('page', '1');

  if (search) {
    targetUrl.searchParams.set('search', search);
    targetUrl.searchParams.set('limit', limit);
  }

  if (featured) targetUrl.searchParams.set('featured', featured);

  if (category && category !== 'all') {
    targetUrl.searchParams.set('category', category);
  }

  const response = await fetch(targetUrl.toString(), {
    headers: {
      'x-vercel-protection-bypass': bypassToken,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`External API Error: ${response.status}`);
  }

  return response.json();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = (searchParams.get('search')?.toLowerCase().trim() || '').slice(0, 100);
  const category = searchParams.get('category') || '';
  const limit = searchParams.get('limit') || '5';
  const featured = searchParams.get('featured') || '';

  try {
    const data = await fetchSearchResults(search, category, limit, featured);
    return NextResponse.json(data);
  } catch (error) {
    console.error("API Proxy Error:", error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
