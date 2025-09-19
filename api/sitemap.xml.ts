// api/sitemap.xml.ts — Hotfix: réponse instantanée sans Supabase
// (Optionnel) Active Edge si tu veux :
// export const config = { runtime: "edge" };

export default async function handler(_req?: Request) {
  const BASE = "https://www.vread.fr";
  const now  = new Date().toISOString();

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `  <url><loc>${BASE}/</loc><lastmod>${now}</lastmod></url>\n` +
    `  <url><loc>${BASE}/blog</loc><lastmod>${now}</lastmod></url>\n` +
    `</urlset>\n`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=600, stale-while-revalidate=3600",
      "x-sitemap-version": "vread-sitemap-HOTFIX",
    },
  });
}
