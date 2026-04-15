'use client';
import { Product } from '@/app/products/[id]/page';
import { addToExistingCart, createCart, fetchExistingCart, removeFromCart, updateCartItemQuantity } from '@/app/services/cartService';
import { createContext, useContext, useState, useEffect, useCallback, SetStateAction, Dispatch } from 'react';

const CART_TOKEN_KEY = 'app_cart_token';

interface CartItem {
    addedAt: string;
    lineTotal: number;
    product: Product;
    price: number;
    quantity: number;
    totalPrice: number;
}

export interface CartModel {
    createdAt: string;
    currency: string;
    items: CartItem[];
    subtotal: number;
    token: string;
    totalItems: number;
    updatedAt: string;
}

const CartContext = createContext<CartProviderProps | undefined>(undefined);
export interface CartProviderProps {
    cart: CartModel | undefined;
    loading: boolean | undefined;
    token: string | null | undefined;
    setCart: Dispatch<SetStateAction<CartModel | undefined>>;
    fetchCart(): void;
    addToCart(productId: string, quantity?: number): Promise<{ success: boolean; error?: any }>;
    updateQuantity(itemId: string, quantity: number): void;
    removeItem(itemId: string): void;
}


export const CartProvider = ({ children }: { children: React.ReactNode }) => {
    const [cart, setCart] = useState<CartModel | undefined>(undefined);
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const savedToken = window.sessionStorage.getItem(CART_TOKEN_KEY);
        if (savedToken) {
            setToken(savedToken);
            fetchCart();
        }
    }, []);

    // Fetch full cart data
    const fetchCart = async () => {
        if (!token) return;
        try {
            const res = await fetchExistingCart(token)
            if (res.success) {
                setCart(res.data);
            }
        } catch (error) {
            console.error("Failed to fetch cart:", error);
        }
    };

    // The Core "Add to Cart" Logic
    const addToCart = useCallback(async (productId: string, quantity = 1): Promise<{ success: boolean; error?: any }> => {
        setLoading(true);
        try {
            if (token) {
                console.log("Cart token found, add to existing cart...");
                const cartdata = await addToExistingCart(productId, quantity, token);
                setCart(cartdata);
                return { success: true };
            }
            else {
                const cartToken = await createCart();
                console.log("Cart token not found, creating cart...");
                if (cartToken?.token && !token) {
                    setToken(cartToken?.token || null);
                    window.sessionStorage.setItem(CART_TOKEN_KEY, cartToken?.token);
                    const cartdata = await addToExistingCart(productId, quantity, cartToken?.token);
                    setCart(cartdata);
                }

                return { success: true, error: null };
            }
        } catch (error) {
            return { success: false, error: error };
        } finally {
            setLoading(false);
        }
    }, [token]);

    const updateQuantity = async (itemId: string, quantity: number) => {
        if (!token) return;
        try {
            const res = await updateCartItemQuantity(token, itemId, quantity);
            if (res.ok) {
                const data = await res.json();
                setCart(data);
            }
        } catch (err) {
            console.error("Update quantity failed", err);
        }
    };

    const removeItem = async (itemId: string) => {
        if (!token) return;
        try {
            const res = await removeFromCart(token, itemId);
            if (res.ok) {
                const data = await res.json();
                setCart(data);
            }
        } catch (err) {
            console.error("Remove item failed", err);
        }
    };

    return (
        <CartContext.Provider value={{ cart, loading, token, setCart, fetchCart, addToCart, updateQuantity, removeItem }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};