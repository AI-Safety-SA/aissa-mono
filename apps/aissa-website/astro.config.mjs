import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Load environment variables from .env file in development
if (process.env.NODE_ENV !== 'production') {
  try {
    const dotenv = await import('dotenv');
    dotenv.config();
  } catch (error) {
    console.warn('dotenv not available, using system environment variables');
  }
}

const SITE_URL =
  process.env.SITE_URL ??
  (process.env.CONTEXT === 'production' ? process.env.URL : process.env.DEPLOY_PRIME_URL);

export default defineConfig({
  site: SITE_URL,
  base: process.env.BASE_URL ?? '/',

  vite: {
    plugins: [tailwindcss()],
  },
});
