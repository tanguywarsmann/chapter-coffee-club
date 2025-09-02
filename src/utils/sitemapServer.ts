
import { blogService } from '@/services/blogService';
import { supabase } from '@/integrations/supabase/client';

export async function generateCompleteSitemap(): Promise<string> {
  const baseUrl = 'https://www.vread.fr';
  const today = new Date().toISOString().split('T')[0];
  
  try {
    // Pages statiques
    const staticUrls = [
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

    // Articles de blog depuis Supabase
    const blogPosts = await blogService.getPublishedPosts();
    const blogUrls = blogPosts.map(post => ({
      loc: `${baseUrl}/blog/${post.slug}`,
      lastmod: post.updated_at.split('T')[0],
      changefreq: 'monthly',
      priority: '0.8'
    }));

    // Livres publics depuis Supabase (using correct column names)
    const { data: books } = await supabase
      .from('books')
      .select('id, slug, created_at')
      .eq('is_published', true);

    const bookUrls = (books || []).map(book => ({
      loc: `${baseUrl}/books/${book.id}`,
      lastmod: book.created_at ? new Date(book.created_at).toISOString().split('T')[0] : today,
      changefreq: 'monthly',
      priority: '0.7'
    }));

    const allUrls = [...staticUrls, ...blogUrls, ...bookUrls];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    return sitemap;
  } catch (error) {
    console.error('Erreur génération sitemap complet:', error);
    // Fallback minimal
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
  }
}
