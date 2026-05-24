import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  try {
    const PUBLIC_API_URL = import.meta.env.PUBLIC_API_URL || 'https://woocommerce.deificarts.com';
    const { order } = params;

    if (!order) {
      return new Response(JSON.stringify({ error: 'Order ID is missing.' }), { status: 400 });
    }

    const statusResponse = await fetch(`${PUBLIC_API_URL}/wp-json/lasz-woocommerce/v1/orders/status?order_id=${order}`);
    const statusData = await statusResponse.json();

    if (!statusResponse.ok) {
      return new Response(JSON.stringify({ error: 'Failed to fetch order data.' }), { status: 400 });
    }

    return new Response(JSON.stringify(statusData), { status: 200 });

  } catch (error) {
    console.error('Checkout API error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};
