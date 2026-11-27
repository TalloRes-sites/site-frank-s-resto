import type { APIRoute } from 'astro';
import { robotsTxt } from '../lib/seo';
import { loadSite } from '../lib/site-data';

export const GET: APIRoute = () => new Response(robotsTxt(loadSite().restaurant), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
