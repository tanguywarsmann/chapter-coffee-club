// api/sitemap.xml.ts
export const config = { runtime: 'edge' };

// Construire les chevrons pour éviter toute "correction" de l'éditeur
const LA = String.fromCharCode(60);  // "<"
const RA = String.fromCharCode(62);  // ">"

function escapeXml(s: string) {
  return String(s).replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case "'": return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

export default async function handler() {
  const BASE = process.env.SITEMAP_BASE || 'https://www.vread.fr';
  const url = process.env.SITEMAP_SUPABASE_URL!;
  const key = process.env.SITEMAP_SUPABASE_KEY!;

  // Blog uniquement: articles publiés
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

  const urlsetOpen  = `${LA}urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"${RA}`;
  const urlsetClose = `${LA}/urlset${RA}`;

  const body = urls.map(u => {
    const loc = `${LA}loc${RA}${escapeXml(u.loc)}${LA}/loc${RA}`;
    const lastmod = `${LA}lastmod${RA}${u.lastmod}${LA}/lastmod${RA}`;
    return `${LA}url${RA}${loc}${lastmod}${LA}/url${RA}`;
  }).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n${urlsetOpen}\n${body}\n${urlsetClose}`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400'
    }
  });
}