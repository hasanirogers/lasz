import { createStore } from 'zustand/vanilla';
import { type IProfile } from '../shared/interfaces';

export interface IProfileStore {
  profile: IProfile;
  updateProfile: (profile: IProfile) => void;
  isLoggedIn: boolean;
  logout: () => void;
}

const getProfile = async () => {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  };

  try {
    const userProfile = await fetch(`/api/profile/me`, options)
      .then((response) => response.json());
    if (userProfile) {
      return userProfile;
    }
  } catch (error) {
    console.log(error);
  }

  return;
}

const isLoggedIn = async () => await fetch('/api/auth/authorized').then(response => response.json());
const isLoggedInResponse = await isLoggedIn();

const profileResponse = isLoggedInResponse ? await getProfile() : null;

const store = createStore<IProfileStore>(set => ({
  profile: { ...profileResponse },
  updateProfile: (profile: IProfile) => set(() => { return { profile } }),
  isLoggedIn: isLoggedInResponse,
  logout: async () => {
    await fetch(`/api/auth/logout`);
    window.location.href = "/";
  }
}));

export default store;
