'use client';
import { useState } from 'react';

interface PromoProps {
  promo: {
    message: string;
    discountCode?: string;
  } | null;
}

export default function PromoBanner({ promo }: PromoProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible || !promo) {
    return null;
  }

  return (
    <div className="relative w-full bg-black text-white px-10 py-2.5 flex items-center justify-center text-sm font-medium z-50">
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-center">
        <span className="tracking-wide">{promo.message}</span>
        
        {promo.discountCode && (
          <>
            <span className="hidden sm:inline opacity-40">|</span>
            <span className="bg-white/20 px-2 py-0.5 rounded text-xs tracking-widest font-bold">
              USE CODE: <span className="text-[#E6E6FA]">{promo.discountCode}</span>
            </span>
          </>
        )}
      </div>
      
      <button 
        onClick={() => setIsVisible(false)}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/20 rounded-full transition-colors text-white/70 hover:text-white"
        aria-label="Close promotion"
      >
        <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  );
}