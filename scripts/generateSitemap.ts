
import { writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { getBlogPosts } from '../src/utils/blogUtils';

interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: 'daily' | 'weekly' | 'monthly' | 'yearly';
  priority: string;
}

function generateSitemap() {
  const baseUrl = 'https://vread.fr';
  const today = new Date().toISOString().split('T')[0];
  
  // Pages statiques
  const staticPages: SitemapUrl[] = [
    {
      loc: `${baseUrl}/`,
      lastmod: today,
      changefreq: 'weekly',
      priority: '1.0'
    },
    {
      loc: `${baseUrl}/blog`,
      lastmod: today,
      changefreq: 'weekly',
      priority: '0.8'
    }
  ];

  // Articles de blog depuis les fichiers .md et la base de données
  let blogUrls: SitemapUrl[] = [];
  
  try {
    // Récupérer les articles depuis les fichiers markdown
    const blogPosts = getBlogPosts();
    blogUrls = blogPosts.map(post => ({
      loc: `${baseUrl}/blog/${post.slug}`,
      lastmod: post.date,
      changefreq: 'monthly' as const,
      priority: '0.7'
    }));
  } catch (error) {
    // Fallback: scanner directement le dossier content/blog
    try {
      const contentPath = join(process.cwd(), 'content', 'blog');
      const files = readdirSync(contentPath).filter(file => file.endsWith('.md'));
      
      blogUrls = files.map(file => {
        const slug = file.replace('.md', '');
        const filePath = join(contentPath, file);
        const stats = statSync(filePath);
        
        return {
          loc: `${baseUrl}/blog/${slug}`,
          lastmod: stats.mtime.toISOString().split('T')[0],
          changefreq: 'monthly' as const,
          priority: '0.7'
        };
      });
    } catch (fallbackError) {
      // En cas d'échec total, au moins les pages statiques seront générées
    }
  }

  const allUrls = [...staticPages, ...blogUrls];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  const publicPath = join(process.cwd(), 'public', 'sitemap.xml');
  writeFileSync(publicPath, sitemap, 'utf8');
  
  // eslint-disable-next-line no-console
  console.log(`✅ Sitemap généré avec ${allUrls.length} URLs dans public/sitemap.xml`);
}

generateSitemap();
