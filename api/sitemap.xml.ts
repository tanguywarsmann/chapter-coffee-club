// api/sitemap.xml.ts
type Url = { loc: string; lastmod: string };

const esc = (s: string) =>
  s.replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&apos;','"':'&quot;'}[c] as string));

const render = (urls: Url[]) =>
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map(u => `  <url><loc>${esc(u.loc)}</loc><lastmod>${u.lastmod}</lastmod></url>`).join('\n') +
  `\n</urlset>`;

export default async function handler(): Promise<Response> {
  const BASE = process.env.SITEMAP_BASE ?? 'https://www.vread.fr';
  // 👇 tombe sur tes variables Vercel existantes si les SITEMAP_* ne sont pas définies
  const SUPA_URL =
    process.env.SITEMAP_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '';
  const SUPA_KEY =
    process.env.SITEMAP_SUPABASE_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? // OK côté serveur uniquement
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

  const now = new Date().toISOString();
  const baseUrls: Url[] = [
    { loc: `${BASE}/`, lastmod: now },
    { loc: `${BASE}/blog`, lastmod: now },
  ];

  // Si pas d’env, renvoyer quand même un XML valide
  if (!SUPA_URL || !SUPA_KEY) {
    return new Response(render(baseUrls), {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Sitemap-Note': 'missing-env',
      },
    });
  }

  try {
    const qs = new URL(`${SUPA_URL}/rest/v1/blog_posts`);
    qs.searchParams.set('select', 'slug,updated_at,created_at,published');
    qs.searchParams.set('published', 'eq.true');
    qs.searchParams.set('order', 'updated_at.desc');
    qs.searchParams.set('limit', '10000');

    const r = await fetch(qs.toString(), {
      headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` },
      cache: 'no-store',
    });

    if (!r.ok) throw new Error(`supabase:${r.status}`);

    const rows: any[] = await r.json();
    const urls: Url[] = [
      ...baseUrls,
      ...rows.map((row) => ({
        loc: `${BASE}/blog/${row.slug}`,
        lastmod: new Date(row.updated_at ?? row.created_at ?? now).toISOString(),
      })),
    ];

    return new Response(render(urls), {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Sitemap-Source': 'api/node',
      },
    });
  } catch (e: any) {
    // Fallback en 200 pour ne pas casser /sitemap.xml
    return new Response(render(baseUrls), {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Sitemap-Error': String(e?.message ?? e),
      },
    });
  }
}
