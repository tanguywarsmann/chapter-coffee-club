// api/sitemap.xml.ts
const LA = "<";
const RA = ">";

function escapeXml(s: string) {
  return String(s).replace(/[<>&'"]/g, (c) =>
    c === "<" ? "&lt;" :
    c === ">" ? "&gt;" :
    c === "&" ? "&amp;" :
    c === "'" ? "&apos;" : "&quot;"
  );
}

export default async function handler() {
  const BASE = process.env.SITEMAP_BASE || "https://www.vread.fr";
  const url =
    process.env.SITEMAP_SUPABASE_URL ||
    process.env.SUPABASE_URL;
  const key =
    process.env.SITEMAP_SUPABASE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    return new Response("Missing Supabase env (SUPABASE_URL / SUPABASE_*KEY).", { status: 500 });
  }

  // Blog uniquement (publiés)
  const qs = new URL(`${url}/rest/v1/blog_posts`);
  qs.searchParams.set("select", "slug,updated_at,created_at,published");
  qs.searchParams.set("published", "eq.true");
  qs.searchParams.set("order", "updated_at.desc");
  qs.searchParams.set("limit", "10000");

  const res = await fetch(qs.toString(), {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
    cache: "no-store",
  });
  if (!res.ok) return new Response("Upstream error", { status: 502 });

  const rows: Array<{ slug: string; updated_at?: string; created_at?: string }> = await res.json();
  const now = new Date().toISOString();

  const urls = [
    { loc: `${BASE}/`, lastmod: now },
    { loc: `${BASE}/blog`, lastmod: now },
    ...rows.map((r) => ({
      loc: `${BASE}/blog/${r.slug}`,
      lastmod: new Date(r.updated_at || r.created_at || now).toISOString(),
    })),
  ];

  const open  = `${LA}urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"${RA}`;
  const close = `${LA}/urlset${RA}`;
  const body  = urls
    .map((u) =>
      `${LA}url${RA}${LA}loc${RA}${escapeXml(u.loc)}${LA}/loc${RA}` +
      `${LA}lastmod${RA}${u.lastmod}${LA}/lastmod${RA}${LA}/url${RA}`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n${open}\n${body}\n${close}\n`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
      "x-sitemap-version": "vread-sitemap-v2",
    },
  });
}
