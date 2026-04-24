'use server';

import { ProductResponse, ProductsResponse, StockResponse } from "../ui/types";
const apiUrl = 'https://vercel-swag-store-api.vercel.app/api/products';
const bypassToken = process.env.VERCEL_SECRET_TOKEN || '';

export async function getProduct(id: string): Promise<ProductResponse> {
    try {
        const response = await fetch(`${apiUrl}/${id}`, {
            headers: {
                'x-vercel-protection-bypass': bypassToken,
                'Content-Type': 'application/json',
            },
            next: { revalidate: 3600 }
        });

        return await response.json();
    } catch (error) {
        console.error("Product fetch error:", error);
        return { success: false };
    }
}

export async function getFeatureProducts(): Promise<ProductsResponse> {
    try {
        const response = await fetch(`${apiUrl}?page=1&limit=6&featured=true`, {
            headers: {
                'x-vercel-protection-bypass': bypassToken,
                'Content-Type': 'application/json',
            },
            next: { revalidate: 3600 } // Cache for an hour
        });
        return await response.json();
    } catch (error) {
        console.error("Feature Products fetch error:", error);
        return { success: false };
    }
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