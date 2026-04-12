'use client';
import Image from 'next/image';
import Link from 'next/link';

export interface Product {
    id: string;
    name: string;
    price: number;
    images: string[];
    slug: string;
}

export interface ProductsResponse {
    success?: boolean;
    data: Product[];
    meta?: any;
}

export default function FeaturedProducts({ data }: ProductsResponse) {
    const products = Array.isArray(data) ? data : [];

    if (!products || products.length === 0) {
        return "Products not found, please try again later.";
    }
    console.log("Rendering FeaturedProducts with data:", products);

    return (
        <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto font-sans">
            <div className="flex items-center justify-between mb-10">
                <h2 className="text-3xl md:text-4xl font-extrabold text-black tracking-tight uppercase italic">
                    Featured Swag
                </h2>

                <Link href="/search" className="hidden text-sm font-bold text-gray-500 hover:text-black transition-colors flex items-center gap-1 uppercase tracking-widest md:flex">
                    View All
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((product) => (
                    <a
                        key={product.id}
                        href={`/products/${product.id}`}
                        className="group flex flex-col bg-white rounded-3xl border border-gray-100 hover:border-[#E6E6FA] hover:shadow-2xl hover:shadow-[#E6E6FA]/40 transition-all duration-500 overflow-hidden"
                    >
                        <div className="relative w-full aspect-square bg-gray-50 overflow-hidden">
                            <Image src={product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-in-out"
                                loading="lazy"
                                fill={true}
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw">
                            </Image>
                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                Quick View
                            </div>
                        </div>

                        <div className="p-6 flex flex-col gap-2">
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-black transition-colors">
                                {product.name}
                            </h3>
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-xl font-light text-gray-900">
                                    ${product.price.toFixed(2)}
                                </span>
                                <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center transform translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 shadow-lg">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </a>
                ))}
            </div>
        </section>
    );
}
