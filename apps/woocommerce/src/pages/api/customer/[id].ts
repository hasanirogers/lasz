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
      console.error('Customer API error: Customer ID is missing');
      return new Response(JSON.stringify({ message: 'Customer ID is missing.' }), { status: 400 });
    }

    const response = await fetch(`${API_URL}/wp-json/wc/v3/customers/${id}`, options);
    const responseData = await response.json();

    if (!response.ok) {
      console.error('Customer API error:', responseData);
      return new Response(JSON.stringify({ message: responseData.message || 'Failed to fetch customer data.' }), { status: responseData.data.status || 400 });
    }

    return new Response(JSON.stringify(responseData), { status: 200 });

  } catch (error) {
    console.error('Customer API error:', error);
    return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
  }
};

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params;

    const options = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        authorization: request.headers.get('authorization') || ''
      }
    };

    if (!id) {
      console.error('Customer API error: Customer ID is missing');
      return new Response(JSON.stringify({ message: 'Customer ID is missing.' }), { status: 400 });
    }

    const response = await fetch(`${API_URL}/wp-json/wc/v3/customers/${id}`, options);
    const responseData = await response.json();

    if (!response.ok) {
      console.error('Customer API error:', responseData);
      return new Response(JSON.stringify({ message: responseData.message || 'Failed to update customer data.' }), { status: responseData.data.status || 400 });
    }

    return new Response(JSON.stringify(responseData), { status: 200 });

  } catch (error) {
    console.error('Customer API error:', error);
    return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
  }
};
