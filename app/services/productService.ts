import { cacheLife, cacheTag } from 'next/cache';
import { ProductResponse, ProductsResponse, StockResponse } from "../ui/types";

const apiUrl = 'https://vercel-swag-store-api.vercel.app/api/products';
const bypassToken = process.env.VERCEL_SECRET_TOKEN || '';

export async function getProduct(id: string): Promise<ProductResponse> {
    "use cache"
    cacheLife('products');
    cacheTag('products', `product-${id}`);

    const response = await fetch(`${apiUrl}/${id}`, {
        headers: {
            'x-vercel-protection-bypass': bypassToken,
            'Content-Type': 'application/json',
        },
    });

    // 5xx: server error — throw so the result is not cached and the next request retries
    if (response.status >= 500) {
        throw new Error(`External API Error: ${response.status}`);
    }

    // 4xx: API returns a JSON error body (e.g. NOT_FOUND) — cache it
    return response.json();
}

export async function getFeatureProducts(): Promise<ProductsResponse> {
    "use cache"
    cacheLife('featured');
    cacheTag('products', 'featured-products');

    const response = await fetch(`${apiUrl}?page=1&limit=6&featured=true`, {
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

export async function getStock(id: string): Promise<StockResponse> {
    try {
        const response = await fetch(`${apiUrl}/${id}/stock`, {
            headers: {
                'x-vercel-protection-bypass': bypassToken,
                'Content-Type': 'application/json',
            },
            cache: 'no-store'
        });

        return await response.json();
    } catch (error) {
        console.error("Product stock fetch error:", error);
        return { success: false };
    }
}
