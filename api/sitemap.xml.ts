// api/sitemap.xml.ts — Prod (Node runtime) + Supabase + timeout + fallback
import type { VercelRequest, VercelResponse } from '@vercel/node';

function escapeXml(s: string) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const BASE = process.env.SITEMAP_BASE || 'https://www.vread.fr';
  const SUPABASE_URL = process.env.SITEMAP_SUPABASE_URL;
  const SUPABASE_KEY = process.env.SITEMAP_SUPABASE_KEY;

  // Sécurité : pas de secret ? => fallback immédiat
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    const now = new Date().toISOString();
    const xml =
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${BASE}/</loc><lastmod>${now}</lastmod></url>
  <url><loc>${BASE}/blog</loc><lastmod>${now}</lastmod></url>
</urlset>
`;
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=3600');
    res.setHeader('x-sitemap-version', 'vread-sitemap-fallback-no-secrets');
    return res.status(200).send(xml);
  }

  // Build query (blog uniquement)
  const qs = new URL(`${SUPABASE_URL}/rest/v1/blog_posts`);
  qs.searchParams.set('select', 'slug,updated_at,created_at,published');
  qs.searchParams.set('published', 'eq.true');
  qs.searchParams.set('order', 'updated_at.desc');
  qs.searchParams.set('limit', '10000');

  // Timeout réseau strict
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 6000);

  let rows: Array<{ slug: string; updated_at?: string; created_at?: string }> = [];
  try {
    const r = await fetch(qs.toString(), {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
      cache: 'no-store',
      signal: controller.signal,
    });
    clearTimeout(t);
    if (!r.ok) throw new Error(`Upstream ${r.status}`);
    rows = await r.json();
  } catch (e) {
    // En cas d’échec/timeout, on tombe en fallback minimal, jamais d’erreur 500
    const now = new Date().toISOString();
    const xml =
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${BASE}/</loc><lastmod>${now}</lastmod></url>
  <url><loc>${BASE}/blog</loc><lastmod>${now}</lastmod></url>
</urlset>
`;
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=3600');
    res.setHeader('x-sitemap-version', 'vread-sitemap-fallback-timeout');
    return res.status(200).send(xml);
  }

  const now = new Date().toISOString();
  const urls = [
    { loc: `${BASE}/`, lastmod: now },
    { loc: `${BASE}/blog`, lastmod: now },
    ...rows.map(r => ({
      loc: `${BASE}/blog/${r.slug}`,
      lastmod: new Date(r.updated_at || r.created_at || now).toISOString(),
    })),
  ];

  const body = urls.map(u =>
    `  <url><loc>${escapeXml(u.loc)}</loc><lastmod>${u.lastmod}</lastmod></url>`
  ).join('\n');

  const xml =
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=86400');
  res.setHeader('x-sitemap-version', 'vread-sitemap-v3-node');
  return res.status(200).send(xml);
}
