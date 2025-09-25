// api/sitemap-corrected.xml.ts — Utilise les fichiers statiques markdown comme source de vérité
import type { VercelRequest, VercelResponse } from '@vercel/node';

function escapeXml(s: string) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Articles statiques (synchronisés avec content/blog/)
const STATIC_BLOG_POSTS = [
  {
    slug: 'article-test',
    lastmod: '2025-06-23T00:00:00.000Z'
  },
  {
    slug: 'pourquoi-read',
    lastmod: '2025-06-25T00:00:00.000Z'
  },
  {
    slug: 'bienfaits-lecture-quotidienne',
    lastmod: '2025-06-26T00:00:00.000Z'
  }
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const BASE = 'https://www.vread.fr';
  const now = new Date().toISOString();
  
  // Pages principales avec priorités SEO optimisées
  const mainPages = [
    { loc: `${BASE}/`, lastmod: now, priority: '1.0', changefreq: 'weekly' },
    { loc: `${BASE}/a-propos`, lastmod: now, priority: '0.9', changefreq: 'monthly' },
    { loc: `${BASE}/presse`, lastmod: now, priority: '0.8', changefreq: 'monthly' },
    { loc: `${BASE}/blog`, lastmod: now, priority: '0.9', changefreq: 'weekly' },
  ];

  // Articles de blog (utilise uniquement les articles qui existent réellement)
  const blogPages = STATIC_BLOG_POSTS.map(post => ({
    loc: `${BASE}/blog/${post.slug}`,
    lastmod: post.lastmod,
    priority: '0.7',
    changefreq: 'monthly'
  }));

  const allUrls = [...mainPages, ...blogPages];

  const urlsXml = allUrls.map(url => `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlsXml}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
  res.setHeader('x-sitemap-version', 'vread-sitemap-corrected-v1');
  
  return res.status(200).send(xml);
}