// api/sitemap.xml.ts — HOTFIX Node (@vercel/node)

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  const BASE = 'https://www.vread.fr';
  const now = new Date().toISOString();

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `  <url><loc>${BASE}/</loc><lastmod>${now}</lastmod></url>\n` +
    `  <url><loc>${BASE}/blog</loc><lastmod>${now}</lastmod></url>\n` +
    `</urlset>\n`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=3600');
  res.setHeader('x-sitemap-version', 'vread-sitemap-HOTFIX-node');
  res.status(200).send(xml);
}
