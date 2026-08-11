// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  build: {
    // Inlines all CSS files smaller than 15kb directly into the HTML
    inlineStylesheets: 'always',
  },
  output: 'server',
  adapter: vercel()
});

