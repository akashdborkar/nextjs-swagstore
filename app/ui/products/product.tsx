import Image from 'next/image';
import { Product } from '../types';
import { ProductActions } from './stock';

interface ProductClientProps {
  product: Product;
  id: string;
}

export default function ProductClient({ product, id }: ProductClientProps) {
  return (
    <main className="max-w-7xl mx-auto px-4 py-12 flex flex-col md:flex-row gap-12 font-sans">

      {/* Product Image Gallery */}
      <div className="flex-1 relative aspect-square bg-gray-50 rounded-3xl overflow-hidden border border-gray-100">
        {product.images && product.images.length > 0 && (
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
      <div className="flex-1 flex flex-col gap-6">
        <h1 className="text-4xl font-black uppercase italic">{product.name}</h1>
        <p className="text-2xl text-gray-600">${product.price.toFixed(2)}</p>
        <p className="text-gray-500 leading-relaxed">{product.description}</p>

        {/* Isolated Stock and Cart Logic */}
        <ProductActions product={product} id={id} />
      </div>

    </main>
  );
}