import { createStore } from 'zustand/vanilla';

export interface IModalsStore {
  signInOpened: boolean;
  setSignInOpened: (opened: boolean) => void;
}

const store = createStore<IModalsStore>(set => ({
  signInOpened: false,
  setSignInOpened: (signInOpened: boolean) => set(() => { return { signInOpened } }),
}));

export default store;
