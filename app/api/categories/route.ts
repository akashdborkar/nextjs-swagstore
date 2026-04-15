import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const bypassToken = process.env.VERCEL_SECRET_TOKEN || '';

  try {
    const targetUrl = new URL('https://vercel-swag-store-api.vercel.app/api/categories');
    
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