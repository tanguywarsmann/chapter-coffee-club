export const config = { runtime: 'edge' };

export default async function handler() {
  const BASE = process.env.SITEMAP_BASE || 'https://www.vread.fr';
  const url = process.env.SITEMAP_SUPABASE_URL;
  const key = process.env.SITEMAP_SUPABASE_KEY;

  if (!url || !key) {
    return new Response('Missing env', { status: 500 });
  }

  const qs = new URL(`${url}/rest/v1/blog_posts`);
  qs.searchParams.set('select', 'slug,updated_at,created_at');
  qs.searchParams.set('published', 'eq.true');
  qs.searchParams.set('order', 'updated_at.desc');
  qs.searchParams.set('limit', '10000');

  const res = await fetch(qs.toString(), { headers: { apikey: key, Authorization: `Bearer ${key}` } });
  if (!res.ok) return new Response('Upstream error', { status: 502 });
  const rows = await res.json();

  const now = new Date().toISOString();

  const staticUrls = [
    { loc: `${BASE}/`, lastmod: now },
    { loc: `${BASE}/blog`, lastmod: now }
  ];

  const postUrls = rows.map((r: any) => {
    const lm = r.updated_at || r.created_at || now;
    return {
      loc: `${BASE}/blog/${r.slug}`,
      lastmod: new Date(lm).toISOString()
    };
  });

  const urls = [...staticUrls, ...postUrls];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `<url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod></url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400'
    }
  });
}