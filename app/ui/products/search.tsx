'use client';

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { CategorySelector } from "./category-selector";
import { ProductCard } from "./product-card";
import { Product } from "../types";

export function Search() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Extract query string values from URL
  const query = searchParams.get('search') || '';
  const category = searchParams.get('category') || 'all';

  const [inputValue, setInputValue] = useState(query);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setInputValue(query);
  }, [query]);

  const updateParams = useCallback((newQuery: string, newCategory: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (newQuery.trim()) {
      params.set('search', newQuery.trim());
    } else {
      params.delete('search');
    }

    if (newCategory !== 'all') {
      params.set('category', newCategory);
    } else {
      params.delete('category');
    }

    // router.push updates the URL and triggers a re-render of this component
    router.push(`${pathname}?${params.toString()}`);
  }, [pathname, router, searchParams]);

  const fetchProducts = useCallback(async (q: string, cat: string) => {
    setLoading(true);
    setError(null);

    try {
      const apiParams = new URLSearchParams();
      if (q.trim()) {
        apiParams.set('search', q.trim());
        apiParams.set('limit', '5');
      }
      if (cat !== 'all') apiParams.set('category', cat);
      if (!q.trim() && !cat.trim()) apiParams.set('featured', 'true');

      const response = await fetch(`/api/search?${apiParams.toString()}`);
      if (!response.ok) throw new Error(`Error: ${response.status}`);

      const json = await response.json();
      setProducts(json.success && Array.isArray(json.data) ? json.data : []);
    } catch (err) {
      setError("Unable to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Effect runs whenever the URL params change
  useEffect(() => {
    fetchProducts(query, category);
  }, [query, category, fetchProducts]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    
    // Debounce the URL update
    debounceTimerRef.current = setTimeout(() => {
      updateParams(val, category);
    }, 400);
  };

  const handleCategoryChange = (newCat: string) => {
    // When changing category, we often want to clear the search query or keep it
    updateParams("", newCat);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-12 font-sans antialiased text-black bg-white min-h-screen">
      <header className="mb-16">
        <h3 className="text-2xl md:text-3xl font-black italic tracking-tighter mb-10 leading-none">
          Search our collection...
        </h3>

        <form 
          onSubmit={(e) => { 
            e.preventDefault(); 
            updateParams(inputValue, category); 
          }}
          className="flex flex-col lg:flex-row gap-4 items-stretch"
        >
          <div className="relative flex-[2]">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Search our collection..."
              className="w-full p-5 md:p-6 pl-8 bg-zinc-50 border-2 border-transparent focus:border-black focus:bg-white rounded-2xl md:rounded-3xl outline-none transition-all font-bold text-sm md:text-base placeholder:text-zinc-400"
            />
          </div>

          <CategorySelector
            currentCategory={category}
            onCategoryChangeAction={handleCategoryChange}
          />

          <button
            type="submit"
            className="p-5 md:p-6 px-12 bg-black text-white rounded-2xl md:rounded-3xl font-black uppercase tracking-widest text-[10px] md:text-xs hover:bg-zinc-800 active:scale-[0.98] transition-all shadow-xl shadow-black/5"
          >
            Search
          </button>
        </form>
      </header>

      <section>
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
              Inventory Status
            </h2>
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-200"></span>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black">
              {loading ? 'Processing...' : `${products.length} Units Found for "${query === '' ? category : query}"`}
            </span>
          </div>
          {loading && (
            <div className="w-4 h-4 border-2 border-zinc-200 border-t-black rounded-full animate-spin" />
          )}
        </div>

        {error ? (
          <div className="p-12 bg-red-50 rounded-[2rem] text-red-600 font-bold text-center border border-red-100">
            {error}
          </div>
        ) : !loading && products.length === 0 ? (
          <div className="py-32 text-center border-2 border-dashed border-zinc-100 rounded-[3rem] bg-zinc-50/30">
            <p className="text-zinc-400 font-bold uppercase tracking-widest text-[10px] italic">No matches found in current catalog.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}