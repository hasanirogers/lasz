import type { DirectiveResult } from 'lit/async-directive.js';
import { UnsafeHTMLDirective } from 'lit/directives/unsafe-html.js';
import { createStore } from 'zustand/vanilla';

interface IAlertConfig {
  message: string | DirectiveResult<typeof UnsafeHTMLDirective>;
  opened: boolean;
  overlay?: string;
  status?: string;
  icon?: string;
  closeable?: boolean;
}

export interface IAlertStore {
  config: IAlertConfig;
  setConfig: (options: IAlertConfig) => void;
}

const store = createStore<IAlertStore>(set => ({
  config: { message: '', opened: false, icon: 'exclamation-triangle', closeable: true },
  setConfig: (options: IAlertConfig) => set(() => { return { config: options } }),
}));

export default store;
