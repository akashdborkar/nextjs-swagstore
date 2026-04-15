import Link from 'next/link';
import swagimg from '../../public/swag_store.webp';
import Image from 'next/image';

export default function Hero() {
  return (
    <section className="p-4 overflow-hidden font-sans bg-[#fcfcfc]">
      <div className="py-16 md:px-16 flex flex-col lg:flex-row items-center gap-12 lg:gap-20 max-w-7xl mx-auto">

        {/* Left Content: Text and CTA */}
        <div className="flex-1 space-y-8 text-center lg:text-left">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-extrabold text-black tracking-tight leading-tight">
              Elevate Your <br />
              <span className="text-gray-400">Everyday Swag.</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-xl mx-auto lg:mx-0 font-medium">
              Discover a curated collection of premium essentials designed for modern living. Minimalist, functional, and uniquely you.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
            <Link href="/search" className="px-8 py-4 bg-black text-white rounded-2xl font-bold text-lg hover:bg-zinc-800 transition-all hover:shadow-xl hover:-translate-y-1 shadow-lg shadow-gray-400/20 text-center inline-block">
              Shop Collection
            </Link>
          </div>

          <div className="flex items-center justify-center lg:justify-start gap-8 pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-black">10k+</p>
              <p className="text-sm text-gray-400 uppercase font-semibold tracking-wider">Customers</p>
            </div>
            <div className="w-px h-10 bg-gray-200" />
            <div className="text-center">
              <p className="text-2xl font-bold text-black">24/7</p>
              <p className="text-sm text-gray-400 uppercase font-semibold tracking-wider">Support</p>
            </div>
          </div>
        </div>

        {/* Right Content: Visual Element */}
        <div className="flex-1 w-full relative group">
          {/* Decorative background elements to help blend */}
          <div className="absolute -inset-4 bg-gradient-to-tr from-gray-100 to-transparent rounded-[4rem] -z-10 blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
          
          <div className="relative aspect-square w-full bg-white rounded-[3.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden flex items-center justify-center p-0 transition-all duration-700 ease-out group-hover:shadow-[0_48px_80px_-16px_rgba(0,0,0,0.15)] group-hover:-translate-y-2 border border-gray-50">
            <Image 
              src={swagimg} 
              alt="Swag Store Illustration" 
              className="w-full h-full object-cover transition-transform duration-1000 ease-in-out group-hover:scale-105"
              style={{
                maskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)'
              }}
              loading='eager'
            />
            {/* Subtle overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent pointer-events-none" />
          </div>
        </div>
      
      </div>
    </section>
  );
}
