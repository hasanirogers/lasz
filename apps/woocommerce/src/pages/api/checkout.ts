import type { APIRoute } from 'astro';
import cartStore from '../../stores/cart';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const PUBLIC_API_URL = import.meta.env.PUBLIC_API_URL || 'https://woocommerce.deificarts.com';

    const {
      cart_token,
      billing_address,
      shipping_address,
      payment_method_id, // Ensure your frontend passes the 'pm_...' ID here
      customer_note
    } = body;

    if (!cart_token) {
      return new Response(JSON.stringify({ error: 'Cart token is missing.' }), { status: 400 });
    }

    // 1. Fetch current cart to get a fresh Nonce
    const cartResponse = await fetch(`${PUBLIC_API_URL}/wp-json/wc/store/v1/cart`, {
      headers: { 'Cart-Token': cart_token }
    });

    if (!cartResponse.ok) {
      return new Response(JSON.stringify({ error: 'Failed to fetch cart data.' }), { status: 400 });
    }

    const cartData = await cartResponse.json();
    const nonce = cartData.nonce || cartResponse.headers.get('Nonce');

    if (!nonce) {
      return new Response(JSON.stringify({ error: 'Security nonce missing.' }), { status: 400 });
    }

    // 2. Prepare the Single Checkout Payload
    // We send the Stripe data IMMEDIATELY during order creation
    // src/pages/api/checkout.ts

    // src/pages/api/checkout.ts

    const checkoutData = {
      billing_address,
      shipping_address,
      customer_note: customer_note || '',
      payment_method: 'stripe', // The Gateway ID
      payment_data: [
        // 1. Identifies the gateway again for internal routing
        { key: "payment_method", value: "stripe" },

        // 2. The Stripe Payment Method ID (pm_...)
        { key: "wc-stripe-payment-method", value: payment_method_id },

        // 3. THE FIX: The plugin looks for 'stripe_payment_method' or 'wc-stripe-payment-type'
        // To be safe with the latest "Optimized" versions, we provide all three:
        { key: "wc-stripe-payment-type", value: "card" },
        { key: "payment_type", value: "card" },
        { key: "stripe_payment_method", value: payment_method_id },

        // 4. Required for new UPE flows to signal a fresh card entry
        { key: "wc-stripe-new-payment-method", value: "true" }
      ]
    };

    // 3. One-shot Checkout
    const response = await fetch(`${PUBLIC_API_URL}/wp-json/wc/store/v1/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cart-Token': cart_token,
        'X-WC-Store-API-Nonce': nonce // Official standard header name
      },
      body: JSON.stringify(checkoutData)
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Checkout Failed:', result);
      return new Response(JSON.stringify({
        error: result.message || 'Checkout failed',
        details: result.data
      }), { status: response.status });
    }

    // 4. Handle Success
    // If the payment requires 3D Secure, the result.payment_result will contain a redirect URL
    return new Response(JSON.stringify({
      success: true,
      order_id: result.order_id,
      order_key: result.order_key,
      status: result.status,
      redirect_url: result.payment_result?.redirect_url || result.order_received_url,
      message: 'Order placed successfully'
    }), { status: 200 });

  } catch (error) {
    console.error('Checkout API error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};
