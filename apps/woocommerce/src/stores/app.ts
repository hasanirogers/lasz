import { createStore } from 'zustand/vanilla';

export interface AppStore {
  isMobile: boolean;
  drawerOpened: boolean;
  setDrawerOpened: (opened: boolean) => void;
}

const isMobile = () => {
  return !matchMedia('(width > 1024px)').matches;
}


const store = createStore<AppStore>((set) => ({
  isMobile: isMobile(),
  drawerOpened: false,
  setDrawerOpened: (opened: boolean) => set({ drawerOpened: opened }),
}));

window.addEventListener('resize', () => {
  store.setState({ isMobile: isMobile() });
});

export default store;
