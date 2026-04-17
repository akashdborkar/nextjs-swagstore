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