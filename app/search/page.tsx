import { Suspense } from 'react';
import { Metadata } from 'next';
import { SearchSkeleton } from '../ui/skeletons';
import { Search } from '../ui/products/search';

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search for your favorite swag items in our store.',
  openGraph: {
    title: 'Search',
    description: 'Search for your favorite swag items in our store.',
  },
};

export default function SearchPage() {
  return (
    <main className="min-h-screen bg-white">
      <Suspense 
        fallback={<SearchSkeleton />}
      >
        <Search />
      </Suspense>
    </main>
  );
}