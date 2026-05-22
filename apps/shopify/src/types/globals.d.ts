declare module '*.css?inline';
declare module '*.css';

interface ImportMetaEnv {
  PUBLIC_SHOPIFY_DOMAIN: string;
  SHOPIFY_CLIENT_ID: string;
  SHOPIFY_SECRET: string;
}

interface ImportMeta {
  env: ImportMetaEnv;
}
