import ProductClient from '@/app/ui/products/product';
import { Metadata } from 'next';

type Props = {
  params: Promise<{ id: string }>;
};

async function getProduct(id: string) {
  const bypassToken = process.env.VERCEL_PROTECTION_BYPASS || '';
  
  try {
    const response = await fetch(`https://vercel-swag-store-api.vercel.app/api/products/${id}`, {
      headers: {
        'x-vercel-protection-bypass': bypassToken,
        'Content-Type': 'application/json',
      },
      // You can adjust caching behavior here based on your needs
      cache: 'no-store' 
    });
    
    const json = await response.json();
    if (json.success && json.data) {
      return json.data;
    }
    return null;
  } catch (error) {
    console.error("Server fetch error:", error);
    return null;
  }
}

// 1. Dynamic Metadata Generation
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  return {
    title: `${product.name}`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.images && product.images.length > 0 ? [product.images[0]] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description,
      images: product.images && product.images.length > 0 ? [product.images[0]] : [],
    }
  };
}

// 2. Server Component Page
export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  
  const product = await getProduct(id);

  if (!product) {
    return <div className="p-20 text-center font-sans text-lg font-bold">Product not found.</div>;
  }

  // Pass the pre-fetched data to the interactive Client Component
  return <ProductClient product={product} id={id} />;
}