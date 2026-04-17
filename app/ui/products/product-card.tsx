
import Link from "next/link";
import Image from "next/image";
import { Product } from "../types";

export function ProductCard({ product }: { product: Product }) {
    return (
        <Link href={`/products/${product.id}`}
            className="group flex flex-col bg-white border border-gray-100 hover:border-[#E6E6FA] hover:shadow-2xl hover:shadow-[#E6E6FA]/40 transition-all duration-500 overflow-hidden"
        >
            <div className="group flex flex-col transition-all duration-500 cursor-pointer">
                <div className="relative aspect-[4/5] bg-zinc-100 rounded-[2rem] overflow-hidden mb-4 border border-transparent group-hover:border-black transition-colors">
                    <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        loading='eager'
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] font-black uppercase tracking-widest text-black">${product.price.toFixed(2)}</span>
                    </div>
                </div>
                <div className="px-1">
                    <h3 className="font-black text-xs md:text-sm uppercase tracking-tight text-zinc-900 truncate mb-1">
                        {product.name}
                    </h3>
                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                        {product.category || 'Archive Piece'}
                    </p>
                </div>
            </div>
        </Link>
    );
}