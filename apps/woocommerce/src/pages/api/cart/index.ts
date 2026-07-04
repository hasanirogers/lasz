import type { APIRoute } from 'astro';

export const prerender = false;

const API_URL = import.meta.env.PUBLIC_API_URL;

export const GET: APIRoute = async ({ request }) => {
  try {
    const options = {
      method: 'GET',
      headers: request.headers,
    };

    const response = await fetch(`${API_URL}/wp-json/wc/store/v1/cart`, options);
    const responseData = await response.json();

    if (!response.ok) {
      console.error('Cart API error:', responseData);
      return new Response(JSON.stringify({ message: responseData.message || 'Failed to get cart.' }), { status: response.status || 400 });
    }

    // Extract nonce and cart token from WooCommerce response and include it in the response
    const nonce = response.headers.get('nonce') || response.headers.get('X-WC-Store-API-Nonce');
    const cartToken = response.headers.get('cart-token') || response.headers.get('Cart-Token');

    console.log('Extracted nonce from header:', nonce);
    console.log('Nonce in response data:', responseData.nonce);
    console.log('Extracted cart token from header:', cartToken);

    const responseDataWithNonce = {
      ...responseData,
      nonce: nonce || responseData.nonce,
      cartToken: cartToken
    };

    console.log('Final response with nonce:', responseDataWithNonce.nonce);
    console.log('Final response with cart token:', responseDataWithNonce.cartToken);
    return new Response(JSON.stringify(responseDataWithNonce), { status: 200 });

  } catch (error) {
    console.error('Cart API error:', error);
    return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
  }
};
