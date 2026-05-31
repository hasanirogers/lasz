import type { APIRoute } from 'astro';

export const prerender = false;

const API_URL = import.meta.env.PUBLIC_API_URL;

export const POST: APIRoute = async ({ params, request }) => {
  try {
    const body = await request.json();

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: request.headers.get('authorization') || ''
      },
      body: JSON.stringify(body)
    };


    const response = await fetch(`${API_URL}/wp-json/lasz-woocommerce/v1/user/password`, options);
    const responseData = await response.json();

    if (!response.ok) {
      console.error('User API error:', responseData);
      return new Response(JSON.stringify({ message: responseData.message || 'Failed to create password.' }), { status: responseData.data.status || 400 });
    }

    return new Response(JSON.stringify(responseData), { status: 200 });

  } catch (error) {
    console.error('User API error:', error);
    return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
  }
};
