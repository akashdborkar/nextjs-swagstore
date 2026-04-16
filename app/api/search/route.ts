import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // 1. Extract search parameters from the client request
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const limit = searchParams.get('limit') || '5'; // Enforce limit of 5 for search
  const featured = searchParams.get('featured') || '';

  const bypassToken = process.env.VERCEL_SECRET_TOKEN || '';

  try {
    const targetUrl = new URL('https://vercel-swag-store-api.vercel.app/api/products');
    targetUrl.searchParams.set('page', '1');


    if (search.trim()) {
      targetUrl.searchParams.set('search', search.trim());
      targetUrl.searchParams.set('limit', limit);
      if (featured) targetUrl.searchParams.set('featured', featured);
    }

    if (category && category !== 'all') targetUrl.searchParams.set('category', category);

    const response = await fetch(targetUrl.toString(), {
      headers: {
        'x-vercel-protection-bypass': bypassToken,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`External API Error: ${response.status}`);
    }

    const data = await response.json();

    // 5. Return the data to the client
    return NextResponse.json(data);
  } catch (error) {
    console.error("API Proxy Error:", error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}