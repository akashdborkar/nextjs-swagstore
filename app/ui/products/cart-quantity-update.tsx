'use client';
import { useState, useEffect } from 'react';
import { Minus, Plus, RefreshCw } from 'lucide-react';

interface CartItemQuantityProps {
    productId: string;
    initialQuantity: number;
    onUpdate: (productId: string, newQuantity: number) => Promise<void>;
    disabled?: boolean;
}

export function CartQuantityUpdate({
    productId,
    initialQuantity,
    onUpdate,
    disabled
}: CartItemQuantityProps) {
    const [draftQuantity, setDraftQuantity] = useState(initialQuantity);
    const [isUpdating, setIsUpdating] = useState(false);

    //Sync if the global cart resets or updates successfully
    useEffect(() => {
        setDraftQuantity(initialQuantity);
    }, [initialQuantity]);

    const hasChanged = draftQuantity !== initialQuantity;

    const handleUpdateClick = async () => {
        setIsUpdating(true);
        try {
            await onUpdate(productId, draftQuantity);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="flex items-center gap-3">
            <div className="flex items-center bg-white border border-zinc-200 rounded-2xl p-1 shadow-sm">
                <button
                    onClick={() => setDraftQuantity(Math.max(1, draftQuantity - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-zinc-50 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={draftQuantity <= 1 || disabled || isUpdating}>
                    <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-10 text-center font-black text-sm tabular-nums">
                    {draftQuantity}
                </span>
                <button
                    onClick={() => setDraftQuantity(draftQuantity + 1)}
                    className="w-10 h-10 flex items-center justify-center hover:bg-zinc-50 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={disabled || isUpdating}>
                    <Plus className="w-3.5 h-3.5" />
                </button>
            </div>

            {hasChanged && (
                <button
                    onClick={handleUpdateClick}
                    disabled={disabled || isUpdating}
                    className="flex items-center gap-2 px-4 py-3 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all active:scale-95 animate-in fade-in zoom-in-95 duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                    <RefreshCw className={`w-3 h-3 ${isUpdating ? 'animate-spin' : ''}`} />
                    Update
                </button>
            )}
        </div>
    );
}