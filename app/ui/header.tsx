'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const cartCount = 2; // Simulated cart count, this would come from state

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-[#ddbbed] px-6 py-3 flex items-center justify-between">
        
        <div className="flex items-center gap-12">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center">
              <svg 
                viewBox="0 0 100 100" 
                className="w-7 h-7 fill-black" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <polygon points="50,15 15,85 85,85" />
              </svg>
            </div>

            <span className="text-xl font-bold text-black tracking-tight">Swag Store</span>
          </Link>

          <nav className="flex items-center gap-8">
            <Link 
              href="/" 
              className={`text-lg transition-colors hover:text-black 
                ${pathname === '/' ? 'text-black font-semibold' : 'text-gray-600'}`}
            >
              Home
            </Link>
            <Link 
              href="/search" 
              className={`text-lg transition-colors hover:text-black 
                ${pathname === '/search' ? 'text-black font-semibold' : 'text-gray-600'}`}
            >
              Search
            </Link>
          </nav>
        </div>

        {/* Right: Actions (Cart) */}
        <div className="relative">
          <Link href="/cart" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-lavender-200 transition-colors">
            {/* Minimalist Cart/Shopping Bag Icon */}
            <svg 
              className="w-7 h-7 stroke-black" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            
            {/* Cart Badge with Count */}
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1.5 bg-black text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}