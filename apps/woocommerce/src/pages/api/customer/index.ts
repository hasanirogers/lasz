import type { APIRoute } from 'astro';

export const prerender = false;

const API_URL = import.meta.env.PUBLIC_API_URL;

export const GET: APIRoute = async ({ request }) => {
  try {
    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        authorization: request.headers.get('authorization') || ''
      }
    };

    const response = await fetch(`${API_URL}/wp-json/lasz-woocommerce/v1/customer`, options);
    const responseData = await response.json();

    if (!response.ok) {
      console.error('Customer API error:', responseData);
      return new Response(JSON.stringify({ message: responseData.message || 'Failed to fetch customer.' }), { status: responseData.data.status || 400 });
    }

    return new Response(JSON.stringify(responseData), { status: 200 });

  } catch (error) {
    console.error('Customer API error:', error);
    return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
  }
};
