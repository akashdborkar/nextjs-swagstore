import React from 'react';

/**
 * Hero Component - Optimized for standalone preview
 * Note: Replaced Next.js 'next/link' with standard anchor tags 
 * to ensure the component compiles successfully in the preview environment.
 */
export default function Hero() {
  return (
    <section className="p-4 overflow-hidden font-sans">
      <div className="py-16 md:px-16 md:py-24 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        
        {/* Left Content: Text and CTA */}
        <div className="flex-1 space-y-8 text-center lg:text-left">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-extrabold text-black tracking-tight leading-tight">
              Elevate Your <br /> 
              <span className="text-gray-700">Everyday Swag.</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-xl mx-auto lg:mx-0 font-medium">
              Discover a curated collection of premium essentials designed for modern living. Minimalist, functional, and uniquely you.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
            <a 
              href="/search" 
              className="px-8 py-4 bg-black text-white rounded-2xl font-bold text-lg hover:scale-105 transition-transform shadow-lg shadow-gray-400/20 text-center inline-block"
            >
              Shop Collection
            </a>
            <a 
              href="/about" 
              className="px-8 py-4 bg-white/50 text-black border border-gray-300 rounded-2xl font-bold text-lg hover:bg-white transition-colors text-center inline-block"
            >
              Learn More
            </a>
          </div>

          <div className="flex items-center justify-center lg:justify-start gap-8 pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-black">10k+</p>
              <p className="text-sm text-gray-500 uppercase font-semibold">Customers</p>
            </div>
            <div className="w-px h-10 bg-gray-300" />
            <div className="text-center">
              <p className="text-2xl font-bold text-black">24/7</p>
              <p className="text-sm text-gray-500 uppercase font-semibold">Support</p>
            </div>
          </div>
        </div>

        {/* Right Content: Visual Element */}
        <div className="flex-1 relative w-full max-w-lg lg:max-w-none">
          {/* Abstract background shape for the illustration */}
          <div className="absolute inset-0 bg-white/40 rounded-full blur-3xl -z-10 transform scale-110" />
          
          <div className="relative aspect-square w-full bg-white/30 rounded-[3rem] border border-white/50 shadow-2xl overflow-hidden flex items-center justify-center p-8 backdrop-blur-sm">
            {/* Visual Illustration (SVG) */}
            <svg 
              viewBox="0 0 500 500" 
              className="w-full h-full drop-shadow-2xl"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="swagGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#000', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#444', stopOpacity: 1 }} />
                </linearGradient>
              </defs>
              {/* Abstract Swag Geometry */}
              <rect x="150" y="100" width="200" height="300" rx="40" fill="url(#swagGradient)" transform="rotate(-10 250 250)" />
              <circle cx="350" cy="150" r="60" fill="#fff" opacity="0.9" />
              <polygon points="250,180 200,320 300,320" fill="#E6E6FA" />
              {/* Floating accents */}
              <circle cx="100" cy="400" r="20" fill="black" />
              <rect x="380" y="380" width="40" height="40" rx="10" fill="black" transform="rotate(45 400 400)" />
            </svg>
            
            {/* Overlay Tag */}
            <div className="absolute bottom-10 left-10 bg-black text-white px-4 py-2 rounded-xl text-sm font-bold animate-bounce">
              New Season ✨
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}