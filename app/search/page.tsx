import { Suspense } from 'react';
import { Search } from '../ui/products/search';

// Since SearchClient uses `useSearchParams`, it must be wrapped in a React Suspense 
// boundary so Next.js can safely render the page boundary on the server.
export default function SearchPage() {
  return (
    <main className="min-h-screen bg-white">
      <Suspense 
        fallback={
          <div className="w-full max-w-7xl mx-auto px-4 py-12 flex justify-center text-gray-500">
            <div className="animate-pulse font-medium text-lg">Loading Search Interface...</div>
          </div>
        }
      >
        <Search />
      </Suspense>
    </main>
  );
}