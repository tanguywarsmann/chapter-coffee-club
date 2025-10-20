export const config = { runtime: 'edge' };

export default async function handler() {
  const BASE = process.env.SITEMAP_BASE || 'https://www.vread.fr';
  const url = process.env.SITEMAP_SUPABASE_URL;
  const key = process.env.SITEMAP_SUPABASE_KEY;

  if (!url || !key) {
    return new Response('Missing env', { status: 500 });
  }

  const since = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
  // Filtre côté client pour rester simple. Option: RPC Supabase pour faire le filtre côté SQL.
  const qs = new URL(`${url}/rest/v1/blog_posts`);
  qs.searchParams.set('select', 'slug,title,updated_at,created_at');
  qs.searchParams.set('published', 'eq.true');
  qs.searchParams.set('order', 'updated_at.desc');
  qs.searchParams.set('limit', '200');

  const res = await fetch(qs.toString(), { headers: { apikey: key, Authorization: `Bearer ${key}` } });
  if (!res.ok) return new Response('Upstream error', { status: 502 });
  const rows: any[] = await res.json();

  const fresh = rows.filter(r => {
    const lm = new Date(r.updated_at || r.created_at || 0).toISOString();
    return lm >= since;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${fresh.map(r => {
  const loc = `${BASE}/blog/${r.slug}`;
  const lm = new Date(r.updated_at || r.created_at || Date.now()).toISOString();
  const title = escapeXml(r.title || 'Article');
  return `<url>
  <loc>${loc}</loc>
  <lastmod>${lm}</lastmod>
  <news:news>
    <news:publication>
      <news:name>VREAD</news:name>
      <news:language>fr</news:language>
    </news:publication>
    <news:publication_date>${lm}</news:publication_date>
    <news:title>${title}</news:title>
  </news:news>
</url>`;
}).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=900, stale-while-revalidate=3600'
    }
  });
}

function escapeXml(s: string) {
  return s.replace(/[<>&'"]/g, c => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}