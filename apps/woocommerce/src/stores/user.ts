import { createStore } from 'zustand/vanilla';
import Cookies from 'js-cookie';

export interface IUserStore {
  user: any;
  profile: any;
  addresses: any;
  updateProfile: (profile: any) => void;
  updateAddresses: (addresses: any) => void;
  isLoggedIn: boolean;
  login: (loginData: any) => void;
  logout: () => void;
}

const API_URL = import.meta.env.PUBLIC_API_URL;

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

  const userProfile = await fetch(`${API_URL}/wp-json/wp/v2/users/${user.user_id.toString()}?context=edit`, options)
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
    const customerData = await fetch(`${API_URL}/wp-json/wc/v3/customers/${user.user_id.toString()}`, options)
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

const profileResponse = await getProfile();
const addressesResponse = await getAddresses();

const store = createStore<IUserStore>(set => ({
  user: Cookies.get('lasz-user') ? JSON.parse(Cookies.get('lasz-user') || '') : {},
  profile: profileResponse?.profile,
  addresses: addressesResponse?.addresses || { billing: {}, shipping: {} },
  updateProfile: (profile: any) => set(() => { return { profile } }),
  updateAddresses: (addresses: any) => set(() => { return { addresses } }),
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
