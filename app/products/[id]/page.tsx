import { getProduct } from '@/app/services/productService';
import ProductDetail from '@/app/ui/products/product';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

type Props = {
  params: Promise<{ id: string }>;
};

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

  return <ProductDetail product={product.data} id={id} />;
}