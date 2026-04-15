'use client';
import { useEffect, useRef, useState } from 'react';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Loader2, Link } from 'lucide-react';
import { useCart } from '../context/Cart/CartProvider';

export default function CartPage() {
  const { cart, loading, updateQuantity, removeItem, token, fetchCart } = useCart();
  const initialFetchRequested = useRef(false);
  
  // State to prevent rapid multi-clicks while API processes the update
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (token && !cart && !loading && !initialFetchRequested.current) {
      initialFetchRequested.current = true;
      fetchCart();
    }
  }, [token, cart, loading, fetchCart]);

  // Wrapper for removing item to force a re-fetch immediately after
  const handleRemoveItem = async (productId: string) => {
    setIsUpdating(true);
    try {
      await removeItem(productId);
    } finally {
      fetchCart(); // Force UI to refresh
      setIsUpdating(false);
    }
  };

  // Wrapper for updating quantity to force a re-fetch immediately after
  const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
    setIsUpdating(true);
    try {
      await updateQuantity(productId, newQuantity);
    } finally {
      fetchCart(); // Force UI to refresh
      setIsUpdating(false);
    }
  };

  const isActuallyLoading = loading || (token && !cart);

  if (isActuallyLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4 font-sans bg-white">
        <Loader2 className="w-10 h-10 text-black animate-spin" />
        <p className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">
          Filling your Bag...
        </p>
      </div>
    );
  }

  const items = cart?.items || [];
  const isEmpty = items.length === 0;

  if (isEmpty) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center font-sans">
        <div className="relative inline-block mb-8">
          <div className="bg-zinc-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto border border-zinc-100">
            <ShoppingBag className="w-10 h-10 text-zinc-300" />
          </div>
          <div className="absolute -top-2 -right-2 bg-white border border-zinc-100 rounded-full p-2 shadow-sm">
            <div className="w-2 h-2 bg-zinc-900 rounded-full animate-pulse"></div>
          </div>
        </div>
        <h1 className="text-4xl font-black mb-4 tracking-tighter uppercase italic text-zinc-900">Your bag is empty</h1>
        <p className="text-zinc-500 mb-10 max-w-sm mx-auto leading-relaxed">
          Your curation journey starts here. Explore our latest drops and find something unique for your collection.
        </p>
        <button 
          onClick={() => window.location.href = '/search'}
          className="inline-flex items-center gap-3 bg-black text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-zinc-800 transition-all active:scale-95 shadow-xl shadow-black/10"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-16 font-sans antialiased text-black">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
        <div>
          <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none">Your Bag</h1>
          <div className="flex items-center gap-2 mt-4">
            <span className="h-px w-8 bg-zinc-200"></span>
            <p className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.3em]">
              {items.length} {items.length === 1 ? 'Statement Piece' : 'Items in collection'}
            </p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-10">
          {items.map((item) => (
            <div 
              key={item.product.id} 
              className={`flex flex-col sm:flex-row gap-8 pb-10 border-b border-zinc-100 last:border-0 group transition-opacity ${isUpdating ? 'opacity-50' : 'opacity-100'}`}
            >
              <div className="w-full sm:w-40 h-48 sm:h-48 bg-zinc-50 border border-zinc-100 rounded-3xl overflow-hidden flex-shrink-0 relative">
                <img 
                  src={item.product.images?.[0] || `https://api.dicebear.com/7.x/shapes/svg?seed=${item.product.id}`} 
                  alt={item.product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
              </div>

              <div className="flex-grow flex flex-col py-2">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-black uppercase tracking-tight text-zinc-900 leading-none">
                    {item.product.name}
                  </h3>
                  <button 
                    onClick={() => handleRemoveItem(item.product.id)}
                    disabled={isUpdating}
                    className="text-zinc-300 hover:text-black transition-colors p-1 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Remove item"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-auto mt-1">
                  {item.product.category || 'Limited Edition'}
                </p>

                <div className="flex flex-wrap justify-between items-end gap-4 mt-8">
                  {/* Stepper Control */}
                  <div className="flex items-center bg-white border border-zinc-200 rounded-2xl p-1 shadow-sm">
                    <button 
                      onClick={() => handleUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                      className="w-10 h-10 flex items-center justify-center hover:bg-zinc-50 rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      disabled={item.quantity <= 1 || isUpdating}
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center font-black text-sm tabular-nums">
                      {item.quantity}
                    </span>
                    <button 
                      onClick={() => handleUpdateQuantity(item.product.id, item.quantity + 1)}
                      className="w-10 h-10 flex items-center justify-center hover:bg-zinc-50 rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      disabled={isUpdating}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-1">Item Total</p>
                    <p className="text-2xl font-black text-black tabular-nums">
                      ${item.lineTotal?.toFixed(2) || (item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Sidebar */}
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
              className="group relative w-full bg-white text-black py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] overflow-hidden transition-all hover:bg-zinc-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="relative z-10">{isUpdating ? 'Updating...' : 'Process Payment'}</span>
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