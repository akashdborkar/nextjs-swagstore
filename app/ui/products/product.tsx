'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useCart } from '@/app/context/Cart/CartProvider';

export interface Product {
  category: string;
  createdAt: string;
  currency: string;
  description: string;
  featured: boolean;
  id: string;
  images: string[];
  name: string;
  price: number;
  slug: string;
  tags: string[];
}

interface StockData {
  productId: string;
  stock: number;
  inStock: boolean;
  lowStock: boolean;
}

interface ProductClientProps {
  product: Product;
  id: string;
}

export default function ProductClient({ product, id }: ProductClientProps) {
  const [quantity, setQuantity] = useState<number | undefined>(1);
  
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [stockLoading, setStockLoading] = useState(true);
  
  const { addToCart, token, cart, fetchCart } = useCart();
  const [status, setStatus] = useState<string | null>(null);

  // We keep stock fetching on the client side since inventory is highly dynamic
  // and we want real-time accuracy without busting the entire page cache.
  useEffect(() => {
    const fetchStock = async () => {
      setStockLoading(true);
      try {
        const response = await fetch(`/api/products/${id}/stock`);
        const json = await response.json();

        if (json.success && json.data) {
          setStockData(json.data);
          if (!json.data.inStock) {
            setQuantity(0);
          }
        } else {
          throw new Error('Product stock data is not found');
        }
      } catch (err: any) {
        console.error(err.message);
      } finally {
        setStockLoading(false);
      }
    };

    if (id) {
      fetchStock();
    }
  }, [id]);

  // Handle quantity change to prevent NaN errors
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    const max = stockData?.stock || 1;

    if (isNaN(val) || val < 1) {
      setQuantity(1);
    } else if (val > max) {
      setQuantity(max);
    } else {
      setQuantity(val);
    }
  };

  const handleAdd = async () => {
    if (!product?.id) {
      setStatus('error');
      return;
    }

    setStatus('adding');
    const result = await addToCart(product.id, quantity || 1);
    
    if (result.success) {
      setStatus('success');
      // Force the cart context to refresh its data globally, updating the header
      await fetchCart();
      setTimeout(() => setStatus(null), 2000);
    } else {
      setStatus('error');
      setTimeout(() => setStatus(null), 2000);
    }
  };

  const isOutOfStock = stockData ? !stockData.inStock : false;

  return (
    <main className="max-w-7xl mx-auto px-4 py-12 flex flex-col md:flex-row gap-12 font-sans">
      <div className="flex-1 relative aspect-square bg-gray-50 rounded-3xl overflow-hidden border border-gray-100">
        {product.images && product.images.length > 0 && (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority // Using priority for above-the-fold images
          />
        )}
      </div>
      <div className="flex-1 flex flex-col gap-6">
        <h1 className="text-4xl font-black uppercase italic">{product.name}</h1>
        <p className="text-2xl text-gray-600">${product.price.toFixed(2)}</p>
        <p className="text-gray-500 leading-relaxed">{product.description}</p>

        <div className="flex items-center gap-4">
          {stockLoading ? (
            <div className="h-5 w-40 bg-zinc-100 animate-pulse rounded-full"></div>
          ) : (
            <>
              <div className={`w-3.5 h-3.5 rounded-full ${isOutOfStock ? 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.4)]' : 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.4)]'}`} />
              <span className={`text-xs font-black uppercase tracking-[0.2em] ${isOutOfStock ? 'text-red-600' : 'text-green-700'} ${stockData?.lowStock ? 'text-yellow-600' : ''}`}>
                {isOutOfStock ? 'Sold Out' : stockData?.lowStock ? `Only ${stockData.stock} Units Left` : 'In Stock & Ready'}
              </span>
            </>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold uppercase text-black-400">Quantity</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={handleQuantityChange}
            disabled={isOutOfStock || stockLoading}
            className="w-24 p-3 border-2 border-black rounded-xl font-bold focus:outline-none disabled:opacity-50"
          />
        </div>

        <button
          onClick={handleAdd}
          disabled={isOutOfStock || stockLoading || status === 'adding'}
          className={`w-full py-6 rounded-[2rem] font-black uppercase tracking-[0.25em] transition-all transform active:scale-95 text-sm ${isOutOfStock || stockLoading
            ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed border-2 border-zinc-200'
            : 'bg-black text-white hover:bg-zinc-800 shadow-2xl hover:shadow-black/20'
            }`}
        >
          {status === 'adding' ? 'Processing...' : status === 'success' ? 'Added!' :
            `Add to Cart — $${(product.price * (Number(quantity) || 1)).toFixed(2)}`}
        </button>

        {status === 'error' && (
          <p className="text-red-500 text-xs mt-3 text-center font-bold italic">Something went wrong. Please try again.</p>
        )}
      </div>
    </main>
  );
}