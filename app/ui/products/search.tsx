'use client';

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Product } from './product';

export function Search() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialQuery = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || 'all';

  interface Category {
    slug: string;
    name: string;
    productCount: number;
  }

  const [inputValue, setInputValue] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchProducts = useCallback(async (query: string, cat: string) => {
    setLoading(true);
    setError(null);

    try {
      const apiParams = new URLSearchParams();
      // Set 5 result limit as requested
      apiParams.set('limit', '5');
      if (query.trim()) apiParams.set('search', query.trim());
      if (cat !== 'all') apiParams.set('category', cat);

      // If no query, we show featured items as the default state
      if (!query.trim()) apiParams.set('featured', 'true');

      const response = await fetch(`/api/search?${apiParams.toString()}`);

      if (!response.ok) {
        throw new Error(`Error: ${response.status} failed to fetch results`);
      }

      const json = await response.json();

      if (json.success && Array.isArray(json.data)) {
        setProducts(json.data);
      } else {
        setProducts([]);
      }
    } catch (err: any) {
      setError("Unable to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    setLoadingCategories(true);
    try {

      const response = await fetch(`/api/categories`);

      if (!response.ok) {
        throw new Error(`Error: ${response.status} failed to fetch categories`);
      }

      const json = await response.json();

      if (json.success) {
        setCategories(json.data);
      }
    } catch (err) {
      setError("Unable to load categories.");
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  // Initial Load
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Sync data whenever URL parameters change
  useEffect(() => {
    fetchProducts(initialQuery, initialCategory);
    setInputValue(initialQuery);
    setCategory(initialCategory);
  }, [initialQuery, initialCategory, fetchProducts]);

  // Update the browser URL (triggers the useEffect above)
  const updateUrlParams = (newQuery: string, newCategory: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (newQuery.trim()) params.set('search', newQuery.trim());
    else params.delete('search');

    if (newCategory !== 'all') params.set('category', newCategory);
    else params.delete('category');

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    // Automatic search after 3 characters OR if cleared
    if (val.trim().length >= 3 || val.trim().length === 0) {
      debounceTimerRef.current = setTimeout(() => {
        updateUrlParams(val, category);
      }, 400);
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCat = e.target.value;
    setCategory(newCat);
    updateUrlParams("", newCat);
  };

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    updateUrlParams(inputValue, category);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-12 font-sans">
      <header className="mb-12">
        <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-8">
          Swag Search
        </h1>

        {/* Search Controls */}
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Search for apparel, bottles, etc..."
              className="w-full p-4 pl-6 bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white rounded-2xl outline-none transition-all font-medium"
            />
          </div>

          <div className="flex-1 relative">
            <select
              value={category}
              onChange={handleCategoryChange}
              disabled={loadingCategories}
              className="w-full p-6 px-10 bg-zinc-100 border-2 border-transparent focus:border-black rounded-3xl font-black uppercase tracking-widest text-xs outline-none cursor-pointer appearance-none disabled:opacity-50"
            >
              <option value="all">{loadingCategories ? 'Loading...' : 'All Categories'}</option>
              {!loadingCategories && categories.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.name} ({cat.productCount})
                </option>
              ))}
            </select>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>

          <button
            type="submit"
            className="p-4 px-10 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Search
          </button>
        </form>
      </header>

      {/* Results Area */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-400">
            {loading ? 'Searching...' : `${products.length} Results Found`}
          </h2>
          {loading && (
            <div className="w-5 h-5 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
          )}
        </div>

        {error && (
          <div className="p-8 bg-red-50 rounded-3xl text-red-600 font-bold text-center">
            {error}
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-[3rem]">
            <p className="text-gray-400 font-medium italic">No matches found for your search.</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {products.map((product) => (
            <a
              key={product.id}
              href={`/products/${product.slug}`}
              className="group flex flex-col bg-white rounded-3xl border border-gray-50 hover:border-black transition-all duration-300 overflow-hidden"
            >
              <div className="relative aspect-square bg-gray-50 overflow-hidden">
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 20vw"
                  loading="eager"
                />
              </div>
              <div className="p-5">
                <h3 className="font-bold text-gray-900 group-hover:underline line-clamp-1">{product.name}</h3>
                <p className="text-sm text-gray-500 mt-1">${(product.price).toFixed(2)}</p>
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}