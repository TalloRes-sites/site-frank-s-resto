import type { APIRoute } from 'astro';
import { sitemapXml } from '../lib/seo';
import { loadSite } from '../lib/site-data';

export const GET: APIRoute = () => {
  const { restaurant, content } = loadSite();
  return new Response(sitemapXml(restaurant, content, new Date().toISOString().slice(0, 10)), { headers: { 'Content-Type': 'application/xml' } });
};
