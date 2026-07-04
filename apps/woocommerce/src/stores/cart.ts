import { createStore } from 'zustand/vanilla';
//import { stateTaxRates } from '../shared/data';
import userStore from './user';

const CART_STORAGE_KEY = 'lasz-cart-data';
const CART_TOKEN_KEY = 'lasz-cart-token';
const CART_NONCE_KEY = 'lasz-cart-nonce';

export interface CartItem {
  key: string;
  id: number;
  name: string;
  images: Array<{
    id: number;
    src: string;
    thumbnail: string;
  }>;
  quantity: number;
  prices: {
    current_code: string;
    currency_decimal_separator: string;
    currency_minor_unit: number;
    currency_prefix: string;
    currency_suffix: string;
    currency_symbol: string;
    currency_thousand_separator: string;
    price: string;
    raw_prices: any;
    regular_price: string;
    sale_price: string;
  };
  product_id: number;
  variation_id?: number;
  variation?: Record<string, {attribute: string, value: string, raw_attribute: string}>;
}

export interface CartState {
  items: CartItem[];
  total: string;
  isLoading: boolean;
  error: string | null;
  cartToken: string | null;
  nonce: string | null;
  totals: {
    total_items: string;
    total_items_tax: string;
    total_shipping: string;
    total_shipping_tax: string;
    total_tax: string;
    total_price: string;
    currency_code: string;
    currency_symbol: string;
  } | null;
  shippingRates: Array<{
    rate_id: string;
    name: string;
    price: string;
    taxes: string;
    selected: boolean;
  }> | null;
  billingAddress: any | null;
  shippingAddress: any | null;
}

export interface CartActions {
  addToCart: (productId: number, quantity?: number, variationId?: number, variation?: Array<{attribute: string, value: string}>) => Promise<void>;
  removeFromCart: (key: string) => Promise<void>;
  updateQuantity: (key: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  fetchCart: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  restoreCart: () => void;
  saveCart: () => void;
  getTotal: () => string;
  getShippingCost: (hasAddressInfo?: boolean) => string;
  getTaxCost: (stateCode?: string) => string | null;
  getSubtotal: () => string;
  getCurrencySymbol: () => string;
  updateCustomer: (customerData: any) => Promise<void>;
}

export interface CartStore extends CartState, CartActions {}

const saveCartToStorage = (
  items: CartItem[],
  total: string,
  cartToken: string | null,
  nonce: string | null,
  billingAddress: any | null = null,
  shippingAddress: any | null = null
) => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return;
  }

  const addresses = userStore.getState().addresses;

  try {
    const cartData = {
      items,
      total,
      cartToken,
      nonce,
      timestamp: Date.now(),
      billing_address: billingAddress ?? addresses.billing ?? '',
      shipping_address: shippingAddress ?? addresses.shipping ?? ''
    };
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartData));
    if (cartToken) {
      localStorage.setItem(CART_TOKEN_KEY, cartToken);
    }
    if (nonce) {
      localStorage.setItem(CART_NONCE_KEY, nonce);
    }
  } catch (error) {
    console.warn('Failed to save cart to localStorage:', error);
  }
};

const loadCartFromStorage = (): PersistedCartData => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return {
      items: [],
      total: '0',
      cartToken: null,
      nonce: null,
      billing_address: null,
      shipping_address: null
    };
  }

  try {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    const storedToken = localStorage.getItem(CART_TOKEN_KEY);
    const storedNonce = localStorage.getItem(CART_NONCE_KEY);

    if (storedCart) {
      const cartData = JSON.parse(storedCart);
      // Check if cart data is not older than 24 hours
      const isRecent = (Date.now() - cartData.timestamp) < 24 * 60 * 60 * 1000;

      if (isRecent) {
        return {
          items: cartData.items || [],
          total: cartData.total || '0',
          cartToken: storedToken || cartData.cartToken || null,
          nonce: storedNonce || cartData.nonce || null,
          billing_address: cartData.billing_address || null,
          shipping_address: cartData.shipping_address || null
        };
      } else {
        // Clear old cart data
        localStorage.removeItem(CART_STORAGE_KEY);
        localStorage.removeItem(CART_TOKEN_KEY);
        localStorage.removeItem(CART_NONCE_KEY);
      }
    }

    return {
      items: [],
      total: '0',
      cartToken: storedToken || null,
      nonce: storedNonce || null,
      billing_address: null,
      shipping_address: null
    };
  } catch (error) {
    console.warn('Failed to load cart from localStorage:', error);
    return {
      items: [],
      total: '0',
      cartToken: null,
      nonce: null,
      billing_address: null,
      shipping_address: null
    };
  }
};

interface PersistedCartData {
  items: CartItem[];
  total: string;
  cartToken: string | null;
  nonce: string | null;
  billing_address: any | null;
  shipping_address: any | null;
}

const clearCartFromStorage = () => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(CART_STORAGE_KEY);
    localStorage.removeItem(CART_TOKEN_KEY);
    localStorage.removeItem(CART_NONCE_KEY);
  } catch (error) {
    console.warn('Failed to clear cart from localStorage:', error);
  }
};

export const centsToDollars = (cents: string) => {
  return `$${(parseInt(cents) / 100).toFixed(2)}`;
};

// Initialize store with persisted data
const persistedData = loadCartFromStorage();

const store = createStore<CartStore>((set, get) => ({
  items: persistedData.items,
  total: persistedData.total,
  isLoading: false,
  error: null,
  cartToken: persistedData.cartToken,
  nonce: persistedData.nonce,
  totals: null,
  shippingRates: null,
  billingAddress: persistedData.billing_address || null,
  shippingAddress: persistedData.shipping_address || null,

  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setError: (error: string | null) => set({ error }),

  restoreCart: () => {
    const persistedData = loadCartFromStorage();
    set({
      items: persistedData.items,
      total: persistedData.total,
      cartToken: persistedData.cartToken,
      nonce: persistedData.nonce,
      isLoading: false
    });
  },

  saveCart: () => {
    const { items, total, cartToken, nonce } = get();
    saveCartToStorage(items, total, cartToken, nonce);
  },

  addToCart: async (productId: number, quantity = 1, variationId?: number, variation?: Array<{attribute: string, value: string}>) => {
    set({ isLoading: true, error: null });

    try {
      let { cartToken, nonce } = get();

      // If no nonce exists, fetch the cart first to get a nonce
      if (!nonce) {
        console.log('No nonce found, fetching cart to obtain nonce');
        await get().fetchCart();
        nonce = get().nonce;
        cartToken = get().cartToken;
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (cartToken) {
        headers['Cart-Token'] = cartToken;
      }

      if (nonce) {
        headers['X-WC-Store-API-Nonce'] = nonce;
      }

      const payload = {
          id: productId,
          quantity,
          ...(variation && { variation }),
        };

      const response = await fetch(`/api/cart/item/add`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Cart API Error:', response.status, errorData);
        throw new Error(`Failed to add item to cart: ${response.status} ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      const newCartToken = data.cartToken || response.headers.get('Cart-Token');

      set({
        items: data.items || [],
        total: data.totals?.total_price || data.totals_total || '0',
        totals: data.totals || null,
        shippingRates: data.shipping_rates || null,
        cartToken: newCartToken || cartToken,
        nonce: data.nonce || nonce,
        isLoading: false
      });

      // Save to localStorage after successful API call
      const { items, total, cartToken: updatedToken, nonce: updatedNonce } = get();
      saveCartToStorage(items, total, updatedToken, updatedNonce);
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to add to cart',
        isLoading: false
      });
    }
  },

  removeFromCart: async (key: string) => {
    set({ isLoading: true, error: null });

    try {
      const { cartToken, nonce } = get();
      const headers: Record<string, string> = {};

      if (cartToken) {
        headers['Cart-Token'] = cartToken;
      }

      if (nonce) {
        headers['X-WC-Store-API-Nonce'] = nonce;
      }

      const response = await fetch(`/api/cart/item/remove`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ key }),
      });

      if (!response.ok) {
        throw new Error('Failed to remove item from cart');
      }

      const data = await response.json();
      const newCartToken = data.cartToken || response.headers.get('Cart-Token');

      set({
        items: data.items || [],
        total: data.totals?.total_price || data.totals_total || '0',
        totals: data.totals || null,
        shippingRates: data.shipping_rates || null,
        cartToken: newCartToken || cartToken,
        isLoading: false
      });

      // Save to localStorage after successful API call
      const { items, total, cartToken: updatedToken, nonce: currentNonce } = get();
      saveCartToStorage(items, total, updatedToken, currentNonce);
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to remove from cart',
        isLoading: false
      });
    }
  },

  updateQuantity: async (key: string, quantity: number) => {
    set({ isLoading: true, error: null });

    try {
      const { cartToken, nonce } = get();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (cartToken) {
        headers['Cart-Token'] = cartToken;
      }

      if (nonce) {
        headers['X-WC-Store-API-Nonce'] = nonce;
      }

      const response = await fetch(`/api/cart/item/update`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ key, quantity }),
      });

      if (!response.ok) {
        throw new Error('Failed to update cart item');
      }

      const data = await response.json();
      const newCartToken = data.cartToken || response.headers.get('Cart-Token');

      set({
        items: data.items || [],
        total: data.totals?.total_price || data.totals_total || '0',
        totals: data.totals || null,
        shippingRates: data.shipping_rates || null,
        cartToken: newCartToken || cartToken,
        isLoading: false
      });

      // Save to localStorage after successful API call
      const { items, total, cartToken: updatedToken, nonce: currentNonce } = get();
      saveCartToStorage(items, total, updatedToken, currentNonce);
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update cart',
        isLoading: false
      });
    }
  },

  clearCart: async () => {
    set({ isLoading: true, error: null });

    try {
      // Clear cart locally without API call
      set({
        items: [],
        total: '0',
        isLoading: false
      });

      // Clear localStorage
      clearCartFromStorage();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to clear cart',
        isLoading: false
      });
    }
  },

  updateCustomer: async (customerData: any) => {
    set({ isLoading: true, error: null });

    try {
      const { cartToken } = get();
      const headers: Record<string, string> = {};

      if (cartToken) {
        headers['Cart-Token'] = cartToken;
      }

      const response = await fetch(`/api/cart/customer/update`, {
        method: 'POST',
        headers,
        body: JSON.stringify(customerData),
      });

      if (!response.ok) {
        throw new Error('Failed to update customer');
      }

      const data = await response.json();
      console.log('Customer update response:', data);
      const newCartToken = data.cartToken || response.headers.get('Cart-Token');

      set({
        cartToken: newCartToken || cartToken,
        isLoading: false,
        totals: data.totals,
        billingAddress: data.billing_address,
        shippingAddress: data.shipping_address
      });

      // Save to localStorage after successful API call
      const { items, total, cartToken: updatedToken, nonce: currentNonce } = get();
      saveCartToStorage(
        items,
        total,
        updatedToken,
        currentNonce,
        customerData.billing_address,
        customerData.shipping_address
      );
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update customer',
        isLoading: false
      });
    }
  },

  fetchCart: async () => {
    set({ isLoading: true, error: null });

    try {
      const { cartToken } = get();
      const headers: Record<string, string> = {};

      if (cartToken) {
        headers['Cart-Token'] = cartToken;
      }

      const { updateCustomer, billingAddress, shippingAddress, items: currentItems } = get();

      if (billingAddress || shippingAddress) {
        await updateCustomer({
          billing_address: billingAddress,
          shipping_address: shippingAddress
        });
      } else {
        console.log('No address data to update');
      }

      const response = await fetch(`/api/cart`, {
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }

      const data = await response.json();
      console.log('Cart data:', data);
      const newCartToken = data.cartToken || response.headers.get('Cart-Token');

      set({
        items: data.items || [],
        total: data.totals?.total_price || data.totals_total || '0',
        totals: data.totals || null,
        shippingRates: data.shipping_rates || null,
        cartToken: newCartToken || cartToken,
        nonce: data.nonce || null,
        isLoading: false
      });

      // Save to localStorage after successful fetch
      const { items, total, cartToken: updatedToken, nonce: updatedNonce } = get();
      saveCartToStorage(items, total, updatedToken, updatedNonce);
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch cart',
        isLoading: false
      });
    }
  },

  getTotal: () => {
    const { totals, items } = get();

    // Use API total if available and valid, otherwise fall back to calculated value
    if (totals?.total_price && parseFloat(totals.total_price) > 0) {
      return (parseFloat(totals.total_price) * 0.01).toFixed(2);
    }

    // Only calculate if there are items in cart
    if (items.length > 0) {
      const subtotal = (items.reduce((total, item) => total + (parseFloat(item.prices.price) * item.quantity), 0) * 0.01).toFixed(2);
      const shipping = 9.99;
      const tax = parseFloat(subtotal) * 0.08;
      return (parseFloat(subtotal) + shipping + tax).toFixed(2);
    }

    // Return 0 if no items
    return '0.00';
  },

  getShippingCost: (hasAddressInfo = false) => {
    const { totals, items } = get();
    if (totals?.total_shipping && parseFloat(totals.total_shipping) > 0) {
      return (parseFloat(totals.total_shipping) * 0.01).toFixed(2);
    }
    // Only show shipping cost if there are items in cart AND user has entered address info
    if (items.length > 0 && hasAddressInfo) {
      return '9.99';
    }
    return '0.00';
  },

  getTaxCost: (stateCode = '') => {
    const { totals, updateCustomer } = get();

    if (totals?.total_tax && parseFloat(totals.total_tax) > 0) {
      return (parseFloat(totals.total_tax) * 0.01).toFixed(2);
    }

    return null;
  },

  getSubtotal: () => {
    const { totals } = get();
    if (totals?.total_items) {
      return (parseFloat(totals.total_items) * 0.01).toFixed(2);
    }
    // Fallback to calculation
    const { items } = get();
    return (items.reduce((total, item) => total + (parseFloat(item.prices.price) * item.quantity), 0) * 0.01).toFixed(2);
  },

  getCurrencySymbol: () => {
    const { totals } = get();
    return totals?.currency_symbol || '$';
  }
}));

export default store;
