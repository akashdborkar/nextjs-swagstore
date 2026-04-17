import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const bypassToken = process.env.VERCEL_SECRET_TOKEN || '';

    try {
        const targetUrl = new URL('https://vercel-swag-store-api.vercel.app/api/promotions');

        const response = await fetch(targetUrl.toString(), {
            headers: {
                'x-vercel-protection-bypass': bypassToken,
                'Content-Type': 'application/json'
            },
            // Cache the result for 60 seconds to reduce load and improve performance
            next: { revalidate: 300 }
        });

        if (!response.ok) {
            throw new Error(`External API Error: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("API  Error:", error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}