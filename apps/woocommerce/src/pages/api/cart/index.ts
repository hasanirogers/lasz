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
      return new Response(JSON.stringify({ message: responseData.message || 'Failed to get cart.' }), { status: responseData.data.status || 400 });
    }

    return new Response(JSON.stringify(responseData), { status: 200 });

  } catch (error) {
    console.error('Cart API error:', error);
    return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
  }
};
