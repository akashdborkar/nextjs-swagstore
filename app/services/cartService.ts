'use server';
const apiUrl = 'https://vercel-swag-store-api.vercel.app/api/cart';
const bypassToken = process.env.VERCEL_SECRET_TOKEN|| '';

export async function createCart():Promise<{ success: boolean; token?: string | null; error?: any }> {
       const apiEndpoint = `${apiUrl}/create`;
        const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'x-vercel-protection-bypass': bypassToken,
            },
            cache: 'no-cache',
        });
        if (!response.ok) throw new Error('Failed to create cart');

        const cartToken = response.headers.get('x-cart-token');
        return { success: true, token: cartToken, error: null };
    }

export async function addToExistingCart(productId: string, quantity: number, token: string):Promise<any> {
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'x-cart-token': token,
            'x-vercel-protection-bypass': bypassToken,
        },
        cache: 'no-cache',
        body: JSON.stringify({productId, quantity }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        if (errorData && errorData.message) {
            return errorData.message;
        }
        return 'error';
    } else {
        const successData = await response.json();
        return successData;
    } 
}

export async function fetchExistingCart(cartToken: string):Promise<any> {
    const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
            'content-type': 'application/json',
            'x-cart-token': cartToken,
            'x-vercel-protection-bypass': bypassToken,
        },
        cache: 'no-cache',
    });

    if (!response.ok) {
        const errorData = await response.json();
        if (errorData && errorData.message) {
            return errorData.message;
        }
        return errorData;
    } else {
        const successData = await response.json();
        return successData;
    } 
}

export async function updateCartItemQuantity(cartToken: string, itemId: string, quantity: number):Promise<any> {
    const apiEndpoint = `${apiUrl}/${itemId}`;
    const response = await fetch(apiEndpoint, {
        method: 'PATCH',
        headers: {
            'content-type': 'application/json',
            'x-cart-token': cartToken,
            'x-vercel-protection-bypass': bypassToken,
        },
        body: JSON.stringify({ quantity }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        if (errorData && errorData.message) {
            return errorData.message;
        }
        return errorData;
    } else {
        const successData = await response.json();
        return successData;
    } 
}


export async function removeFromCart(cartToken: string, itemId: string):Promise<any> {

    const apiEndpoint = `${apiUrl}/${itemId}`;

    const response = await fetch(apiEndpoint, {
        method: 'DELETE',
        headers: {
            'content-type': 'application/json',
            'x-cart-token': cartToken,
            'x-vercel-protection-bypass': bypassToken,
        },
        cache: 'no-cache',
        referrerPolicy: 'no-referrer',
    });

    if (!response.ok) {
        const errorData = await response.json();
        if (errorData && errorData.message) {
            return errorData.message;
        }
        return 'error';
    } else {
        const successData = await response.json();
        return successData;
    } 
}

