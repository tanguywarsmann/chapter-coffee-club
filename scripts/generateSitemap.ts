import { writeFileSync } from 'fs';
import { join } from 'path';
import { createClient } from '@supabase/supabase-js';

interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: 'weekly' | 'monthly';
  priority: string;
}

async function generateStaticSitemap() {
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
      priority: '0.9'
    }
  ];

  let blogUrls: SitemapUrl[] = [];
  
  try {
    // Connexion à Supabase pour récupérer les articles
    const supabase = createClient(
      "https://xjumsrjuyzvsixvfwoiz.supabase.co",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqdW1zcmp1eXp2c2l4dmZ3b2l6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxNTU1NjYsImV4cCI6MjA2MDczMTU2Nn0.GXAF1p5iTeI3mLwwYi4rnXLsWHSUwglmdQJ7SoC3rH8"
    );
    
    const { data: blogPosts, error } = await supabase
      .from('blog_posts')
      .select('slug, updated_at')
      .eq('published', true)
      .order('updated_at', { ascending: false });

    if (error) {
      console.warn('Erreur lors de la récupération des articles:', error);
    } else {
      blogUrls = (blogPosts || []).map(post => ({
        loc: `${baseUrl}/blog/${post.slug}`,
        lastmod: post.updated_at.split('T')[0],
        changefreq: 'monthly' as const,
        priority: '0.8'
      }));
    }
  } catch (error) {
    console.warn('Impossible de récupérer les articles de blog:', error);
    // Continue avec seulement les pages statiques
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
  
  console.log(`✅ Sitemap statique généré avec ${allUrls.length} URLs dans public/sitemap.xml`);
}

generateStaticSitemap().catch(console.error);