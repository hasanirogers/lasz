import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async () => {
  const PUBLIC_API_URL = import.meta.env.PUBLIC_API_URL || 'https://woocommerce.deificarts.com';

  try {
    // First try the dedicated payment gateways endpoint
    const paymentResponse = await fetch(`${PUBLIC_API_URL}/wp-json/wc/store/v1/payment-gateways`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (paymentResponse.ok) {
      const paymentGateways = await paymentResponse.json();
      return new Response(JSON.stringify(paymentGateways), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // If payment gateways endpoint fails, fall back to cart endpoint which includes payment_methods
    const cartResponse = await fetch(`${PUBLIC_API_URL}/wp-json/wc/store/v1/cart`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (cartResponse.ok) {
      const cartData = await cartResponse.json();
      const paymentMethods = cartData.payment_methods || [];

      // Transform payment method IDs into gateway format with proper mapping
      const formattedGateways = paymentMethods.map((method: string) => {
        // Use the exact payment method IDs that WooCommerce accepts
        const gatewayMap: Record<string, string> = {
          'stripe': 'stripe',
          'stripe_card': 'stripe',
          'stripe_ach_debit': 'stripe',
          'stripe_us_bank_account': 'stripe_us_bank_account'
        };

        const gatewayId = gatewayMap[method] || method;

        return {
          id: gatewayId,
          title: method.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          description: `Pay with ${method.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
          enabled: true,
          method_title: method.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          method_description: `Pay with ${method.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
          icon: null
        };
      });

      return new Response(JSON.stringify(formattedGateways), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Return error if both endpoints fail
    return new Response(JSON.stringify({
      error: 'Payment methods not available',
      message: `Failed to fetch payment methods from ${PUBLIC_API_URL}. Both payment-gateways and cart endpoints are unavailable.`
    }), {
      status: 503,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Payment gateways API error:', error);

    return new Response(JSON.stringify({
      error: 'Payment methods API error',
      message: `Failed to fetch payment methods from ${PUBLIC_API_URL}. Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};
