// api/sitemap.xml.ts
export const config = { runtime: 'edge' };

export default async function handler() {
  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
      '<url><loc>https://www.vread.fr/</loc><lastmod>1970-01-01</lastmod></url>' +
    '</urlset>';

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
