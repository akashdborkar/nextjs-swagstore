import { cacheLife, cacheTag } from 'next/cache';
import { PromoProps } from '../ui/types';

const bypassToken = process.env.VERCEL_SECRET_TOKEN || '';

// Inner cached function — only caches successful API responses.
// Throws on HTTP or network errors so "use cache" skips the cache write.
async function fetchPromoData() {
    "use cache"
    cacheLife('promo');
    cacheTag('promo');

    const response = await fetch('https://vercel-swag-store-api.vercel.app/api/promotions', {
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

// Outer function — not cached. Converts raw data to PromoProps or null.
// Errors from fetchPromoData are caught here and return null gracefully without poisoning the cache.
export async function getPromo(): Promise<PromoProps | null> {
    try {
        const data = await fetchPromoData();
        const promoItem = Array.isArray(data) ? data[0] : data;

        if (!promoItem?.data || promoItem.data.active === false) {
            return null;
        }

        return {
            message: promoItem.data.title || "Special Promotion!",
            discountCode: promoItem.data.code,
        };
    } catch (error) {
        console.error("Promo fetch error:", error);
        return null;
    }
}
