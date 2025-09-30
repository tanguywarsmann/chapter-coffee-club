
// neutralisé – ne pas servir /books/ ni changefreq/priority
export const UNUSED_SITEMAP_HELPER = true;

export async function generateCompleteSitemap(): Promise<string> {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- neutralisé -->
</urlset>`;
}
