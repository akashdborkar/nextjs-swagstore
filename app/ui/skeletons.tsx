export function ProductDetailSkeleton() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-12 flex flex-col md:flex-row gap-12 animate-pulse">
      <div className="flex-1 relative aspect-square bg-zinc-100 rounded-3xl border border-gray-100" />
      <div className="flex-1 flex flex-col gap-6 pt-2">
        <div className="h-10 w-3/4 bg-zinc-100 rounded-xl" />
        <div className="h-7 w-1/4 bg-zinc-100 rounded-lg" />
        <div className="space-y-2">
          <div className="h-4 w-full bg-zinc-50 rounded" />
          <div className="h-4 w-5/6 bg-zinc-50 rounded" />
          <div className="h-4 w-4/6 bg-zinc-50 rounded" />
        </div>
        <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col gap-6">
          <div className="h-5 w-28 bg-zinc-100 rounded" />
          <div className="h-14 w-24 bg-zinc-100 rounded-xl" />
          <div className="h-16 w-full bg-zinc-100 rounded-[2rem]" />
        </div>
      </div>
    </main>
  );
}

export function HeaderSkeleton() {
  return (
    <header className="sticky top-0 z-50 font-sans">
      <div className="bg-[#ddbbed] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-1">
            <div className="w-8 h-8 bg-black/10 rounded-full" />
            <div className="h-5 w-24 bg-black/10 rounded" />
          </div>
          <div className="flex items-center gap-8">
            <div className="h-5 w-14 bg-black/10 rounded" />
            <div className="h-5 w-14 bg-black/10 rounded" />
          </div>
        </div>
        <div className="w-10 h-10 bg-black/10 rounded-full" />
      </div>
    </header>
  );
}

export function FeaturedProductsSkeleton() {
  return (
    <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto animate-pulse">
      <div className="h-10 w-48 bg-zinc-100 rounded-xl mb-10"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="flex flex-col rounded-3xl border border-gray-100 overflow-hidden">
            <div className="aspect-square bg-zinc-100"></div>
            <div className="p-6 flex flex-col gap-3">
              <div className="h-5 w-3/4 bg-zinc-100 rounded"></div>
              <div className="h-6 w-1/3 bg-zinc-50 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function SearchSkeleton() {
  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-12 animate-pulse bg-white">
      <div className="h-16 w-64 bg-zinc-100 rounded-2xl mb-12"></div>
      <div className="h-20 w-full bg-zinc-50 rounded-3xl mb-16"></div>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-8">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="space-y-4">
            <div className="aspect-[4/5] bg-zinc-100 rounded-[2rem]"></div>
            <div className="h-4 w-3/4 bg-zinc-100 rounded"></div>
            <div className="h-3 w-1/2 bg-zinc-50 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
}