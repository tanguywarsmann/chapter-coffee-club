// api/sitemap.xml.ts
type Url = { loc: string; lastmod: string };

const encode = (s: string) =>
  s.replace(/[&<>'"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&apos;', '"': '&quot;' }[c] as string));

const render = (urls: Url[]) =>
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map(u => `  <url><loc>${encode(u.loc)}</loc><lastmod>${u.lastmod}</lastmod></url>`).join('\n') +
  `\n</urlset>`;

export default async function handler(): Promise<Response> {
  const BASE = process.env.SITEMAP_BASE ?? 'https://www.vread.fr';
  const SUPA_URL = process.env.SITEMAP_SUPABASE_URL;
  const SUPA_KEY = process.env.SITEMAP_SUPABASE_KEY;

  const now = new Date().toISOString();
  const baseUrls: Url[] = [
    { loc: `${BASE}/`, lastmod: now },
    { loc: `${BASE}/blog`, lastmod: now },
  ];

  try {
    if (!SUPA_URL || !SUPA_KEY) {
      const xml = render(baseUrls);
      return new Response(xml, {
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'no-store, max-age=0',
          'X-Sitemap-Source': 'api/node',
          'X-Sitemap-Note': 'missing-env',
        },
      });
    }

    const qs = new URL(`${SUPA_URL}/rest/v1/blog_posts`);
    qs.searchParams.set('select', 'slug,updated_at,created_at,published');
    qs.searchParams.set('published', 'eq.true');
    qs.searchParams.set('order', 'updated_at.desc');
    qs.searchParams.set('limit', '10000');

    const r = await fetch(qs.toString(), {
      headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` },
      cache: 'no-store',
    });
    if (!r.ok) throw new Error(`supabase ${r.status}`);

    const rows: any[] = await r.json();
    const urls: Url[] = [
      ...baseUrls,
      ...rows.map((row) => ({
        loc: `${BASE}/blog/${row.slug}`,
        lastmod: new Date(row.updated_at ?? row.created_at ?? now).toISOString(),
      })),
    ];

    const xml = render(urls);
    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'no-store, max-age=0',
        'X-Sitemap-Source': 'api/node',
      },
    });
  } catch (err: any) {
    const xml = render(baseUrls);
    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'no-store, max-age=0',
        'X-Sitemap-Source': 'api/node',
        'X-Sitemap-Error': String(err?.message ?? err),
      },
    });
  }
}
