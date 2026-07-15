// @ts-check
import { defineConfig } from 'astro/config';

import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  build: {
    // Inlines all CSS files smaller than 15kb directly into the HTML
    inlineStylesheets: 'always',
  },
  adapter: node({
    mode: 'standalone'
  })
});
