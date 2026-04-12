'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';

export default function ProductDetailPage() {
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : null;
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for quantity - initialized to 1
  const [quantity, setQuantity] = useState<number | string>(1);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id || id === '[object Object]') return;
      
      setLoading(true);
      try {
        const response = await fetch(`/api/products/${id}`);
        const json = await response.json();
        
        if (json.success && json.data) {
          setProduct(json.data);
        } else {
          throw new Error('Product not found');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Handle quantity change to prevent NaN errors
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    
    // If input is empty, allow it so user can type, but it's a string
    if (val === '') {
      setQuantity('');
      return;
    }

    const parsed = parseInt(val, 10);
    // Only update if it's a valid number and greater than 0
    if (!isNaN(parsed) && parsed > 0) {
      setQuantity(parsed);
    }
  };

  if (loading) return <div className="p-20 text-center">Loading product...</div>;
  if (error || !product) return <div className="p-20 text-center">Product not found.</div>;

  return (
    <main className="max-w-7xl mx-auto px-4 py-12 flex flex-col md:flex-row gap-12">
      <div className="flex-1 relative aspect-square bg-gray-50 rounded-3xl overflow-hidden border border-gray-100">
        <Image 
          src={product.images[0]} 
          alt={product.name} 
          fill 
          className="object-cover" 
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          loading='eager'
        />
      </div>
      <div className="flex-1 flex flex-col gap-6">
        <h1 className="text-4xl font-black uppercase italic">{product.name}</h1>
        <p className="text-2xl text-gray-600">${product.price.toFixed(2)}</p>
        <p className="text-gray-500 leading-relaxed">{product.description}</p>
        
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold uppercase text-black-400">Quantity</label>
          <input 
            type="number"
            min="1"
            value={quantity}
            onChange={handleQuantityChange}
            className="w-24 p-3 border-2 border-black rounded-xl font-bold focus:outline-none"
          />
        </div>

        <button className="bg-black text-white py-4 px-8 rounded-xl font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors">
          Add to Cart — ${(product.price * (Number(quantity) || 1)).toFixed(2)}
        </button>
      </div>
    </main>
  );
}
