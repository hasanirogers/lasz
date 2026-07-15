import { createStore } from 'zustand/vanilla';

export interface IAppStore {
  isMobile: boolean;
  supabaseConfigured: boolean;
}

const isMobile = () => {
  return !matchMedia('(min-width: 769px)').matches;
}

const checkSupabaseConfigured = async () => {
  const response = await fetch('/api/configured');
  const data = await response.json();
  return data ?? false;
}

const supabaseConfigured = await checkSupabaseConfigured();

const store = createStore<IAppStore>(() => ({
  isMobile: isMobile(),
  supabaseConfigured,
}));

window.addEventListener('resize', () => {
  store.setState({ isMobile: isMobile() });
});

export default store;
