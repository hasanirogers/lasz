declare module '*.css?inline';
declare module '*.css';

declare namespace astroHTML {
  interface HTMLAttributes {
    'set:html'?: string;
  }
}

declare const Fragment: any;
