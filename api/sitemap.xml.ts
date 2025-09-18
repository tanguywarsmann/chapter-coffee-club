export const config = { runtime: 'edge' };

export default async function handler() {
  const BASE = process.env.SITEMAP_BASE || 'https://www.vread.fr';
  const url = process.env.SITEMAP_SUPABASE_URL!;
  const key = process.env.SITEMAP_SUPABASE_KEY!;

  // Articles publiés uniquement
  const qs = new URL(`${url}/rest/v1/blog_posts`);
  qs.searchParams.set('select', 'slug,updated_at,created_at');
  qs.searchParams.set('published', 'eq.true');
  qs.searchParams.set('order', 'updated_at.desc');
  qs.searchParams.set('limit', '10000');

  const res = await fetch(qs.toString(), {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
    cache: 'no-store'
  });
  if (!res.ok) return new Response('Upstream error', { status: 502 });
  const rows = await res.json();

  const now = new Date().toISOString();
  const urls = [
    { loc: `${BASE}/`, lastmod: now },
    { loc: `${BASE}/blog`, lastmod: now },
    ...rows.map((r: any) => ({
      loc: `${BASE}/blog/${r.slug}`,
      lastmod: new Date(r.updated_at || r.created_at || now).toISOString()
    }))
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `<url><loc>${escapeXml(u.loc)}</loc><lastmod>${u.lastmod}</lastmod></url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400'
    }
  });
}

function escapeXml(s: string) {
  return String(s).replace(/[<>&'"]/g, c => (
    c === '<' ? '&lt;' :
    c === '>' ? '&gt;' :
    c === '&' ? '&amp;' :
    c === '\'' ? '&apos;' :
    c === '"' ? '&quot;' : c
  ));
}