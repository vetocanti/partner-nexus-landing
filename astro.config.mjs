// @ts-check
import { defineConfig } from 'astro/config';

// GitHub Pages: https://vetocanti.github.io/partner-nexus-landing/
// Con dominio propio, cambia `site` y elimina `base`.
export default defineConfig({
  output: 'static',
  site: 'https://vetocanti.github.io',
  base: '/partner-nexus-landing',
});
