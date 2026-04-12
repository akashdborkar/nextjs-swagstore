import FeaturedProducts, { ProductsResponse } from "../ui/products/feature-products";

export default async function Products() {
  // 1. Secure Server-Side Fetch
  const fetchProducts = async (): Promise<ProductsResponse> => {

    const response = await fetch('https://vercel-swag-store-api.vercel.app/api/products?page=1&limit=6', {
      headers: { 'x-vercel-protection-bypass': process.env.VERCEL_SECRET_TOKEN || '' },
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    return response.json();
  };

  const productResponse = await fetchProducts();

  // 2. Render the Client Component with the fetched data
  return <FeaturedProducts data={productResponse.data} />;
}

