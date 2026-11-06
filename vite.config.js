import { defineConfig } from 'vite';

// Social previews need absolute image URLs. Vercel exposes the production domain at build time;
// locally the tags fall back to relative paths.
function siteUrl() {
  return {
    name: 'site-url',
    transformIndexHtml(html) {
      const host = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL || '';
      return html.replaceAll('__SITE_URL__', host ? `https://${host}` : '');
    },
  };
}

export default defineConfig({
  plugins: [siteUrl()],
});
