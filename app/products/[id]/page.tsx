import { getProduct } from '@/app/services/productService';
import ProductDetail from '@/app/ui/products/product';
import { ProductDetailSkeleton } from '@/app/ui/skeletons';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache, Suspense } from 'react';

// Per-request memoization on top of "use cache" — ensures generateMetadata and ProductDetailContent use cold cache.
const getProductOnce = cache(getProduct);

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductOnce(id);

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
    },
  };
}

async function ProductDetailContent({ params }: Props) {
  const { id } = await params;
  const product = await getProductOnce(id);

  if (!product.success || !product.data || product.error?.code === "NOT_FOUND") {
    notFound();
  }

  return <ProductDetail product={product.data} id={id} />;
}

export default function ProductDetailPage({ params }: Props) {
  return (
    <Suspense fallback={<ProductDetailSkeleton />}>
      <ProductDetailContent params={params} />
    </Suspense>
  );
}