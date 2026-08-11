// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  build: {
    // Inlines all CSS files smaller than 15kb directly into the HTML
    inlineStylesheets: 'always',
  },
  output: 'server',
  adapter: vercel(),
  site: 'https://woocommerce.belasz.dev',
  integrations: [sitemap()],
  vite: {
    server: {
      allowedHosts: ['localhost', '127.0.0.1', '0.0.0.0', 'golf-wrought-copious.ngrok-free.dev']
    }
  }
});
