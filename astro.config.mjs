// @ts-check
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'static',
  site: 'https://promptpad-4yp.pages.dev',
  integrations: [preact()],
  vite: {
    plugins: [tailwindcss()],
  },
});
