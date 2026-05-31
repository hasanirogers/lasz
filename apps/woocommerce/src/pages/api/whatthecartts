import type { APIRoute } from 'astro';
import cartStore from '../../stores/cart';

export const GET: APIRoute = async ({ request }) => {
  try {
    const state = cartStore.getState();
    await state.fetchCart();
    
    return new Response(JSON.stringify({
      items: state.items,
      total: state.total,
      isLoading: state.isLoading,
      error: state.error
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch cart' 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { action, key, quantity } = body;
    const state = cartStore.getState();

    switch (action) {
      case 'update':
        if (key && quantity) {
          await state.updateQuantity(key, quantity);
        }
        break;
      case 'remove':
        if (key) {
          await state.removeFromCart(key);
        }
        break;
      default:
        throw new Error('Invalid action');
    }

    // Return updated cart state
    return new Response(JSON.stringify({
      items: state.items,
      total: state.total,
      isLoading: state.isLoading,
      error: state.error
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Failed to update cart' 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};
