'use client';
import { useState, useEffect } from 'react';
import { useCart } from '@/app/context/Cart/CartProvider';
import { Product, StockData } from '../types';

export function ProductActions({ product, id }: { product: Product; id: string }) {
  const [quantity, setQuantity] = useState<number | undefined>(1);
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [stockLoading, setStockLoading] = useState(true);
  const { addToCart, fetchCart } = useCart();
  const [status, setStatus] = useState<string | null>(null);

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
      await fetchCart();
      setTimeout(() => setStatus(null), 2000);
    } else {
      setStatus('error');
    }
  };

  const isOutOfStock = stockData ? !stockData.inStock : false;

  return (
    <div className="flex flex-col gap-6 mt-6 pt-6 border-t border-gray-100">
      {/* Stock Status Indicator */}
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

      {/* Quantity Selector */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold uppercase text-gray-400">Quantity</label>
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={handleQuantityChange}
          disabled={isOutOfStock || stockLoading}
          className="w-24 p-3 border-2 border-black rounded-xl font-bold focus:outline-none disabled:opacity-50"
        />
      </div>

      {/* Action Button */}
      <button
        onClick={handleAdd}
        disabled={isOutOfStock || stockLoading || status === 'adding'}
        className={`w-full py-6 rounded-[2rem] font-black uppercase tracking-[0.25em] transition-all transform active:scale-95 text-sm ${
          isOutOfStock || stockLoading
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
  );
}