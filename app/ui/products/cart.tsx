'use client';
import { useEffect, useState } from 'react';
import { Trash2, ShoppingBag, ArrowLeft, Loader2, ArrowRight } from 'lucide-react';
import { useCart } from '@/app/context/Cart/CartProvider';
import Image from 'next/image';
import { CartQuantityUpdate } from './cart-quantity-update';
import Link from 'next/link';

export function CartClient() {
  const { cart, loading, updateQuantity, removeItem, token, fetchCart } = useCart();
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (token && !cart && !loading) {
      fetchCart();
    }
  }, [token, cart, loading, fetchCart]);

  const handleRemoveItem = async (productId: string) => {
    setIsUpdating(true);
    try {
      await removeItem(productId);
    } finally {
      fetchCart();
      setIsUpdating(false);
    }
  };

  const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
    setIsUpdating(true);
    try {
      await updateQuantity(productId, newQuantity);
    } finally {
      fetchCart();
      setIsUpdating(false);
    }
  };

  const isActuallyLoading = loading || (token && !cart);

  if (isActuallyLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4 font-sans bg-white">
        <Loader2 className="w-10 h-10 text-black animate-spin" />
        <p className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Filling your Bag...</p>
      </div>
    );
  }

  const items = cart?.items || [];

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center font-sans">
        <div className="bg-zinc-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto border border-zinc-100 mb-8">
          <ShoppingBag className="w-10 h-10 text-zinc-300" />
        </div>
        <h1 className="text-4xl font-black mb-4 tracking-tighter uppercase italic text-zinc-900">Your bag is empty</h1>
        <Link href="/search" className="inline-flex items-center gap-3 bg-black text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-zinc-800 transition-all active:scale-95">
          <ArrowLeft className="w-4 h-4" /> Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-16 font-sans antialiased text-black">
      <div className="flex flex-row justify-between items-center mb-12">
        <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none">
          Your Bag
        </h1>
        <Link
          href="/search"
          className="inline-flex items-center gap-3 bg-black text-white px-28 h-[3rem] rounded-full font-bold uppercase tracking-widest text-[12px] hover:bg-zinc-800 transition-all active:scale-95 shadow-lg shadow-black/5">
          Add More Items <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        <div className="lg:col-span-8 space-y-10">
          {items.map((item) => (
            <div key={item.product.id} className={`flex flex-col sm:flex-row gap-8 pb-10 border-b border-zinc-300 group ${isUpdating ? 'opacity-50' : 'opacity-100'}`}>
              <div className="w-full sm:w-40 h-48 sm:h-48 bg-zinc-50 border border-zinc-100 rounded-3xl overflow-hidden flex-shrink-0 relative">
                <Image
                  src={item.product.images?.[0]}
                  alt={item.product.name}
                  fill
                  loading='eager'
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>

              <div className="flex-grow flex flex-col py-2">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-black uppercase tracking-tight leading-none">{item.product.name}</h3>
                  <button onClick={() => handleRemoveItem(item.product.id)} disabled={isUpdating} className="text-zinc-300 hover:text-black">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-auto mt-1">{item.product.category}</p>
                <h4 className="text-xl font-black tabular-nums">Per Unit: ${item.product.price}</h4>

                <div className="flex flex-wrap justify-between items-end gap-4 mt-8">
                  <CartQuantityUpdate
                    productId={item.product.id}
                    initialQuantity={item.quantity}
                    onUpdate={handleUpdateQuantity}
                    disabled={isUpdating} />
                  <div className="text-right">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-1">Item Total</p>
                    <p className="text-2xl font-black tabular-nums">${(item.product.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-4 lg:sticky lg:top-12">
          <div className="bg-zinc-950 text-white rounded-[2.5rem] p-10 shadow-2xl shadow-zinc-200">
            <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-10">Checkout Details</h2>

            <div className="space-y-6 mb-10">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                <span>Value</span>
                <span className="text-white">${cart?.subtotal?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                <span>Logistics</span>
                <span className="text-white">Complimentary</span>
              </div>

              <div className="pt-10 border-t border-zinc-800 flex flex-col gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Total Amount</span>
                <span className="text-5xl font-black tracking-tighter italic">
                  ${cart?.subtotal?.toFixed(2) || '0.00'}
                </span>
              </div>
            </div>

            <button
              disabled={isUpdating}
              className="group relative w-full bg-white text-black py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] overflow-hidden transition-all hover:bg-zinc-200 active:scale-[0.98]">
              <span className="relative z-10">{isUpdating ? 'Processing...' : 'Process Payment'}</span>
              {!isUpdating && (
                <div className="absolute inset-0 bg-zinc-200 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              )}
            </button>

            <p className="mt-8 text-center text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em]">
              Encrypted Checkout & Secure Data Handling
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}