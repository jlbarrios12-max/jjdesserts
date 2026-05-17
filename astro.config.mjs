// @ts-check
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
import react from '@astrojs/react';
import netlify from '@astrojs/netlify';
import sanity from '@sanity/astro';

// Load env vars from .env (Astro config doesn't auto-populate process.env)
const env = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), '');
const SANITY_PROJECT_ID = env.PUBLIC_SANITY_PROJECT_ID;
const SANITY_DATASET = env.PUBLIC_SANITY_DATASET || 'production';

// Only register the Sanity integration when a real project ID exists,
// so the site can boot for layout previews before Sanity is configured.
const sanityConfigured =
  !!SANITY_PROJECT_ID && SANITY_PROJECT_ID !== 'your-project-id-here';

const integrations = [react()];
if (sanityConfigured) {
  integrations.push(
    sanity({
      projectId: SANITY_PROJECT_ID,
      dataset: SANITY_DATASET,
      apiVersion: '2024-10-01',
      useCdn: true,
      studioBasePath: '/studio',
    })
  );
} else {
  console.log('[JJDesserts] Sanity not configured yet — /studio disabled, site running with placeholder content.');
}

export default defineConfig({
  site: 'https://jjdesserts.com',
  output: 'hybrid',
  adapter: netlify(),
  integrations,
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
