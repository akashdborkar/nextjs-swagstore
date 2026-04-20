import ProductClient from '@/app/ui/products/product';
import { ProductResponse } from '@/app/ui/types';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

type Props = {
  params: Promise<{ id: string }>;
};

async function getProduct(id: string): Promise<ProductResponse> {
  const bypassToken = process.env.VERCEL_PROTECTION_BYPASS || '';
  try {
    const response = await fetch(`https://vercel-swag-store-api.vercel.app/api/products/${id}`, {
      headers: {
        'x-vercel-protection-bypass': bypassToken,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 3600 }
    });

    return await response.json();
  } catch (error) {
    console.error("Server product fetch error:", error);
    return { success: false };
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product.success || !product.data || product.error?.code === "NOT_FOUND") {
    notFound(); 
  }

  const data = product.data!;

  return {
    title: data.name,
    description: data.description,
    openGraph: {
      title: data.name,
      description: data.description,
      images: data.images?.length > 0 ? [data.images[0]] : [],
    },
    twitter: {
    card: 'summary',
    title: data.name,
    description: data.description,
  }
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product.success || !product.data || product.error?.code === "NOT_FOUND") {
    notFound();
  }

  return <ProductClient product={product.data} id={id} />;
}