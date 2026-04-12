import PromoBanner from '../ui/promobanner';

export default async function PromotionalBanner() {
  try {
    // 1. Fetch data securely on the server
    const response = await fetch('https://vercel-swag-store-api.vercel.app/api/promotions', {
      method: 'GET',
      headers: {
        'x-vercel-protection-bypass': process.env.VERCEL_SECRET_TOKEN || '',
        'Content-Type': 'application/json'
      },
      // Cache the result for 60 seconds to reduce load and improve performance
      next: { revalidate: 60 } 
    });

    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    const promoItem = Array.isArray(data) ? data[0] : data;

    if (!promoItem || promoItem.data.active === false) {
        console.log("No active promotion found.");
      return null;
    }

    const promoData = {
      message: promoItem.data.title || "Special Promotion!",
      discountCode: promoItem.data.code,
    };

    return <PromoBanner promo={promoData} />;

  } catch (error) {
    console.error("Failed to fetch promotional data:", error);
    return null;
  }
}
