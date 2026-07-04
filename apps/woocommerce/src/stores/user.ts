import { createStore } from 'zustand/vanilla';
import Cookies from 'js-cookie';

export interface IUserStore {
  user: any;
  profile: any;
  addresses: any;
  paymentMethods: any[];
  orders: any[];
  updateProfile: (profile: any) => void;
  updateAddresses: (addresses: any) => void;
  updatePaymentMethods: (paymentMethods: any[]) => void;
  updateOrders: (orders: any[]) => void;
  isLoggedIn: boolean;
  login: (loginData: any) => void;
  logout: () => void;
}

// const API_URL = import.meta.env.PUBLIC_API_URL;

const getProfile = async () => {
  const user = Cookies.get('lasz-user') ? JSON.parse(Cookies.get('lasz-user') || '') : undefined;

  if (!user) {
    return;
  }

  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user.token}`
    }
  };

  const userProfile = await fetch(`/api/user/${user.user_id.toString()}`, options)
    .then((response) => response.json());

  if (userProfile) {
    return { profile: userProfile };
  }

  return;
}

const getAddresses = async () => {
  const user = Cookies.get('lasz-user') ? JSON.parse(Cookies.get('lasz-user') || '') : undefined;

  if (!user) {
    return;
  }

  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user.token}`
    }
  };

  try {
    const customerData = await fetch(`/api/customer`, options)
      .then((response) => response.json());

    if (customerData) {
      return {
        addresses: {
          billing: customerData.billing || {},
          shipping: customerData.shipping || {}
        }
      };
    }
  } catch (error) {
    console.error('Failed to fetch addresses:', error);
  }

  return { addresses: { billing: {}, shipping: {} } };
}

const getPaymentMethods = async () => {
  const user = Cookies.get('lasz-user') ? JSON.parse(Cookies.get('lasz-user') || '') : undefined;

  if (!user) {
    return { paymentMethods: [] };
  }

  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user.token}`
    }
  };

  try {
    // Use custom endpoint for Stripe plugin payment methods
    const response = await fetch(`/api/customer/payment-methods`, options);

    if (response.ok) {
      const paymentMethodsData = await response.json();
      if (paymentMethodsData) {
        return { paymentMethods: paymentMethodsData.payment_methods || [] };
      }
    } else {
      console.warn('Failed to fetch payment methods:', response.status);
    }
  } catch (error) {
    console.error('Failed to fetch payment methods:', error);
  }

  return { paymentMethods: [] };
}

const getOrders = async () => {
  const user = Cookies.get('lasz-user') ? JSON.parse(Cookies.get('lasz-user') || '') : undefined;

  if (!user) {
    return { orders: [] };
  }

  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user.token}`
    }
  };

  try {
    const response = await fetch(`/api/customer/orders`, options);

    if (response.ok) {
      const ordersData = await response.json();
      return { orders: ordersData.orders || [] };
    } else {
      console.warn('Failed to fetch orders:', response.status);
    }
  } catch (error) {
    console.error('Failed to fetch orders:', error);
  }

  return { orders: [] };
}

const profileResponse = await getProfile();
const addressesResponse = await getAddresses();
const paymentMethodsResponse = await getPaymentMethods();
const ordersResponse = await getOrders();

const store = createStore<IUserStore>(set => ({
  user: Cookies.get('lasz-user') ? JSON.parse(Cookies.get('lasz-user') || '') : {},
  profile: profileResponse?.profile,
  addresses: addressesResponse?.addresses || { billing: {}, shipping: {} },
  paymentMethods: paymentMethodsResponse?.paymentMethods || [],
  orders: ordersResponse?.orders || [],
  updateProfile: (profile: any) => set(() => { return { profile } }),
  updateAddresses: (addresses: any) => set(() => { return { addresses } }),
  updatePaymentMethods: (paymentMethods: any[]) => set(() => { return { paymentMethods } }),
  updateOrders: (orders: any[]) => set(() => { return { orders } }),
  isLoggedIn: !!Cookies.get('lasz-user'),
  login: (loginData) => set(() => {
    Cookies.set('lasz-user', JSON.stringify(loginData), { expires: 7 });
    return { isLoggedIn: true, user: loginData };
  }),
  logout: () => set(() => {
    Cookies.remove('lasz-user');
    return { isLoggedIn: false };
  })
}));

export default store;
