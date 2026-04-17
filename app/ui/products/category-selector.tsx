'use client'
import { useEffect, useState } from "react";
import { Category } from "../types";

export function CategorySelector({
    currentCategory,
    onCategoryChangeAction
}: {
    currentCategory: string,
    onCategoryChangeAction: (val: string) => void
}) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCategories() {
            try {
                const response = await fetch('/api/categories');
                const json = await response.json();
                if (json.success) setCategories(json.data);
            } catch (err) {
                console.error("Failed to load categories, using fallback");
            } finally {
                setLoading(false);
            }
        }
        fetchCategories();
    }, []);

    return (
        <div className="flex-1 relative">
            <select
                value={currentCategory}
                onChange={(e) => onCategoryChangeAction(e.target.value)}
                className="w-full p-4 md:p-6 px-6 md:px-10 bg-zinc-100 border-2 border-transparent focus:border-black rounded-2xl md:rounded-3xl font-black uppercase tracking-widest text-[10px] md:text-xs outline-none cursor-pointer appearance-none disabled:opacity-50 transition-all"
            >
                <option value="all">{loading ? 'Loading Categories...' : 'All Categories'}</option>
                {!loading && categories.map((cat) => (
                    <option key={cat.slug} value={cat.slug}>
                        {cat.name} ({cat.productCount})
                    </option>
                ))}
            </select>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                </svg>
            </div>
        </div>
    );
}