import type { APIRoute } from 'astro';

export const prerender = false;

const API_URL = import.meta.env.PUBLIC_API_URL;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    // Forward the nonce header if present
    const headers = new Headers();
    request.headers.forEach((value, key) => {
      headers.set(key, value);
    });

    // Add nonce header if present in request
    const nonce = request.headers.get('X-WC-Store-API-Nonce');
    if (nonce) {
      headers.set('X-WC-Store-API-Nonce', nonce);
      headers.set('Nonce', nonce);
    }

    const options = {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    };

    const response = await fetch(`${API_URL}/wp-json/wc/store/v1/cart/update-item`, options);
    const responseData = await response.json();

    if (!response.ok) {
      console.error('Cart API error:', responseData);
      return new Response(JSON.stringify({ message: responseData.message || 'Failed to update item in cart.' }), { status: response.status || 400 });
    }

    // Extract nonce and cart token from WooCommerce response and include it in the response
    const responseNonce = response.headers.get('nonce') || response.headers.get('X-WC-Store-API-Nonce');
    const responseCartToken = response.headers.get('cart-token') || response.headers.get('Cart-Token');

    const responseDataWithNonce = {
      ...responseData,
      nonce: responseNonce || nonce || responseData.nonce,
      cartToken: responseCartToken
    };

    return new Response(JSON.stringify(responseDataWithNonce), { status: 200 });

  } catch (error) {
    console.error('Cart API error:', error);
    return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
  }
};
