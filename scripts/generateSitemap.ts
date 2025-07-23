import fs from 'fs';
import path from 'path';

/**
 * Generates a static sitemap.xml fallback file
 * This runs during build to ensure we have a sitemap even if the edge function fails
 */
export function generateStaticSitemap() {
  const baseUrl = 'https://vread.fr';
  const currentDate = new Date().toISOString();

  // Static pages that are always available
  const staticPages = [
    { url: '', lastmod: currentDate, changefreq: 'daily', priority: '1.0' },
    { url: '/blog', lastmod: currentDate, changefreq: 'weekly', priority: '0.8' },
    { url: '/auth', lastmod: currentDate, changefreq: 'monthly', priority: '0.5' },
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  // Ensure public directory exists
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Write sitemap to public directory
  const sitemapPath = path.join(publicDir, 'sitemap.xml');
  fs.writeFileSync(sitemapPath, sitemap, 'utf8');
  
  console.log('✅ Static sitemap.xml generated at:', sitemapPath);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateStaticSitemap();
}