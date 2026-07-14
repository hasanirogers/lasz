import type { APIRoute } from 'astro';

export const prerender = false;

const API_URL = import.meta.env.PUBLIC_API_URL;

export const GET: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params;

    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        authorization: request.headers.get('authorization') || ''
      }
    };

    if (!id) {
      console.error('User API error: User ID is missing');
      return new Response(JSON.stringify({ message: 'User ID is missing.' }), { status: 400 });
    }

    const response = await fetch(`${API_URL}/wp-json/wp/v2/users/${id}?context=edit`, options);
    const responseData = await response.json();

    if (!response.ok) {
      console.error('User API error:', responseData);
      return new Response(JSON.stringify({ message: responseData.message || 'Failed to fetch user data.' }), { status: responseData.data.status || 400 });
    }

    return new Response(JSON.stringify(responseData), { status: 200 });

  } catch (error) {
    console.error('User API error:', error);
    return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params;
    const body = await request.json();

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: request.headers.get('authorization') || ''
      },
      body: JSON.stringify(body)
    };

    if (!id) {
      console.error('User API error: User ID is missing');
      return new Response(JSON.stringify({ message: 'User ID is missing.' }), { status: 400 });
    }

    const response = await fetch(`${API_URL}/wp-json/wp/v2/users/${id}?context=edit`, options);
    const responseData = await response.json();

    if (!response.ok) {
      console.error('User API error:', responseData);
      return new Response(JSON.stringify({ message: responseData.message || 'Failed to post user data.' }), { status: responseData.data.status || 400 });
    }

    return new Response(JSON.stringify(responseData), { status: 200 });

  } catch (error) {
    console.error('User API error:', error);
    return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
  }
};
