import type { APIRoute } from 'astro';
import { llmsTxt } from '../lib/seo';
import { loadSite } from '../lib/site-data';

export const GET: APIRoute = () => {
  const { restaurant, content } = loadSite();
  return new Response(llmsTxt(restaurant, content), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
