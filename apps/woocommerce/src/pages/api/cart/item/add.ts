import type { APIRoute } from 'astro';

export const prerender = false;

const API_URL = import.meta.env.PUBLIC_API_URL;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    const options = {
      method: 'POST',
      headers: request.headers,
      body: JSON.stringify(body),
    };

    const response = await fetch(`${API_URL}/wp-json/wc/store/v1/cart/add-item`, options);
    const responseData = await response.json();

    if (!response.ok) {
      console.error('Cart API error:', responseData);
      return new Response(JSON.stringify({ message: responseData.message || 'Failed to add item to cart.' }), { status: responseData.data.status || 400 });
    }

    return new Response(JSON.stringify(responseData), { status: 200 });

  } catch (error) {
    console.error('Cart API error:', error);
    return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
  }
};
