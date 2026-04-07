import type { APIRoute } from 'astro';
import { buildAbsoluteUrl, getSiteUrl } from '../lib/site';

export const GET: APIRoute = () => {
  const siteUrl = getSiteUrl(import.meta.env.SITE);
  const body = [
    'User-agent: *',
    'Allow: /',
    `Sitemap: ${buildAbsoluteUrl('/sitemap.xml', siteUrl)}`,
    '',
  ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
