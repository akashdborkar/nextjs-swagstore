import Image from 'next/image';
import { Product } from '../types';
import { Stocks } from './stock';
import { Suspense } from 'react';

interface ProductClientProps {
  product?: Product;
  id: string;
}

export default function ProductClient({ product, id }: ProductClientProps) {
  return (
    <main className="max-w-7xl mx-auto px-4 py-12 flex flex-col md:flex-row gap-12 font-sans">

      <div className="flex-1 relative aspect-square bg-gray-50 rounded-3xl overflow-hidden border border-gray-100">
        {product?.images && product?.images.length > 0 && (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
          />
        )}
      </div>

      {/* Product Details & Actions */}
      {product &&
        <div className="flex-1 flex flex-col gap-6">
          <h1 className="text-4xl font-black uppercase italic">{product?.name}</h1>
          <p className="text-2xl text-gray-600">${product?.price.toFixed(2)}</p>
          <p className="text-gray-500 leading-relaxed">{product?.description}</p>
          <Suspense fallback={<p>Fetching stock availability...</p>}>
            <Stocks product={product} id={id} />
          </Suspense>
        </div>}
    </main>
  );
}