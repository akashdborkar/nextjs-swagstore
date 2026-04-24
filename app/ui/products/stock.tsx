'use client';
import { useState } from 'react';
import { useCart } from '@/app/context/Cart/CartProvider';
import { Product, Stock } from '../types';

export function Stocks({ product, stock }: { product: Product; id: string; stock: Stock }) {
  const [quantity, setQuantity] = useState<number>(1);
  const { addToCart, fetchCart } = useCart();
  const [status, setStatus] = useState<'adding' | 'success' | 'error' | null>(null);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    const max = stock?.stock || 1;

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
    const result = await addToCart(product?.id, quantity);

    if (result.success) {
      setStatus('success');
      await fetchCart();
      setTimeout(() => setStatus(null), 2000);
    } else {
      setStatus('error');
      setTimeout(() => setStatus(null), 3000);
    }
  };

  const isOutOfStock = !stock?.inStock || stock?.stock === 0;

  return (
    <div className="flex flex-col gap-6 mt-6 pt-6 border-t border-gray-100">
      <div className="flex items-center gap-4">
        <div className={`w-3.5 h-3.5 rounded-full ${isOutOfStock ? 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.4)]' : 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.4)]'}`} />
        <span className={`text-xs font-black uppercase tracking-[0.2em] ${isOutOfStock ? 'text-red-600' : 'text-green-700'} ${stock?.lowStock && !isOutOfStock ? 'text-yellow-600' : ''}`}>
          {isOutOfStock ? 'Sold Out' : stock?.lowStock ? `Only ${stock.stock} Units Left` : 'In Stock & Ready'}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold uppercase text-gray-400">Quantity</label>
        <input
          type="number"
          min="1"
          max={stock?.stock}
          value={quantity}
          onChange={handleQuantityChange}
          disabled={isOutOfStock}
          className="w-24 p-3 border-2 border-black rounded-xl font-bold focus:outline-none disabled:opacity-20 disabled:border-zinc-200"
        />
      </div>

      {/* Action Button */}
      <button
        onClick={handleAdd}
        disabled={isOutOfStock || status === 'adding'}
        className={`w-full py-6 rounded-[2rem] font-black uppercase tracking-[0.25em] transition-all transform active:scale-95 text-sm ${
          isOutOfStock
            ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed border-2 border-zinc-200'
            : 'bg-black text-white hover:bg-zinc-800 shadow-2xl hover:shadow-black/20'
        }`}
      >
        {status === 'adding' ? (
          'Processing...'
        ) : status === 'success' ? (
          'Added!'
        ) : isOutOfStock ? (
          'Currently Unavailable'
        ) : (
          `Add to Cart — $${(product?.price * quantity).toFixed(2)}`
        )}
      </button>

      {status === 'error' && (
        <p className="text-red-500 text-xs mt-3 text-center font-bold italic animate-bounce">
          Something went wrong. Please try again.
        </p>
      )}
    </div>
  );
}