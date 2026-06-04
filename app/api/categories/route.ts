import { NextResponse } from 'next/server';
import { cacheLife, cacheTag } from 'next/cache';

const bypassToken = process.env.VERCEL_SECRET_TOKEN || '';

async function fetchCategories() {
  "use cache"
  cacheLife('categories');
  cacheTag('categories');

  const response = await fetch('https://vercel-swag-store-api.vercel.app/api/categories', {
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

export async function GET() {
  try {
    const data = await fetchCategories();
    return NextResponse.json(data);
  } catch (error) {
    console.error("API Proxy Error:", error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
