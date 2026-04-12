import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log("Received request for product ID:", id);
  
  const bypassToken = process.env.VERCEL_PROTECTION_BYPASS; 

  try {
    const response = await fetch(`https://vercel-swag-store-api.vercel.app/api/products/${id}`, {
      headers: {
        'x-vercel-protection-bypass': bypassToken || '',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      return NextResponse.json({ success: false }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}
