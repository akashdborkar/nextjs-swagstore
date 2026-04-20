import { NextResponse } from 'next/server';

const POPULAR_TERMS = ['bag', 'tumbler', 'keychain', 'mug', 'cup', 'pencil', 'notebook', 'pen'];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search')?.toLowerCase().trim() || '';
  const category = searchParams.get('category') || '';
  const limit = searchParams.get('limit') || '5';
  const featured = searchParams.get('featured') || '';

  const bypassToken = process.env.VERCEL_SECRET_TOKEN || '';

  let revalidateTime = 60;

  if (!search && !category) {
    //Home Page/Featured products (Static) Cache for 1 hour
    revalidateTime = 3600;
  } else if (category && category !== 'all' && !search) {
    // Category browsing Cache for 15 minutes
    revalidateTime = 900;
  } else if (POPULAR_TERMS.includes(search)) {
    // Search terms you specified cache 10 min
    revalidateTime = 600;
  }

  try {
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
        'Content-Type': 'application/json'
      },
      next: { 
        revalidate: revalidateTime,
      }
    });

    if (!response.ok) {
      throw new Error(`External API Error: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("API Proxy Error:", error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}