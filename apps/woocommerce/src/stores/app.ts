import { createStore } from 'zustand/vanilla';

export interface IAppStore {
  isMobile: boolean;
}

const isMobile = () => {
  return !matchMedia('(width > 1024px)').matches;
}


const store = createStore<IAppStore>(() => ({
  isMobile: isMobile(),
}));

window.addEventListener('resize', () => {
  store.setState({ isMobile: isMobile() });
});

export default store;
