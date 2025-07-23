
import { useEffect, useState } from 'react';
import { blogService } from '@/services/blogService';
import { supabase } from '@/integrations/supabase/client';

export default function SitemapXml() {
  const [sitemapContent, setSitemapContent] = useState<string>('');

  useEffect(() => {
    const generateSitemap = async () => {
      try {
        const baseUrl = 'https://vread.fr';
        const today = new Date().toISOString().split('T')[0];
        
        // Static pages
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

        // Get published blog posts
        const blogPosts = await blogService.getPublishedPosts();
        const blogUrls = blogPosts.map(post => ({
          loc: `${baseUrl}/blog/${post.slug}`,
          lastmod: post.updated_at.split('T')[0],
          changefreq: 'monthly',
          priority: '0.8'
        }));

        // Get published books
        const { data: books } = await supabase
          .from('books')
          .select('id, created_at')
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

        setSitemapContent(sitemap);
      } catch (error) {
        console.error('Error generating sitemap:', error);
        // Fallback sitemap
        const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://vread.fr/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
        setSitemapContent(fallbackSitemap);
      }
    };

    generateSitemap();
  }, []);

  // Set XML content type
  useEffect(() => {
    if (sitemapContent) {
      document.querySelector('meta[http-equiv="Content-Type"]')?.remove();
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Content-Type';
      meta.content = 'application/xml; charset=UTF-8';
      document.head.appendChild(meta);
    }
  }, [sitemapContent]);

  return (
    <div style={{ display: 'none' }}>
      <pre>{sitemapContent}</pre>
    </div>
  );
}

// Export function to get sitemap content for server-side usage
export const getSitemapXmlContent = async (): Promise<string> => {
  try {
    const baseUrl = 'https://vread.fr';
    const today = new Date().toISOString().split('T')[0];
    
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

    const blogPosts = await blogService.getPublishedPosts();
    const blogUrls = blogPosts.map(post => ({
      loc: `${baseUrl}/blog/${post.slug}`,
      lastmod: post.updated_at.split('T')[0],
      changefreq: 'monthly',
      priority: '0.8'
    }));

    const { data: books } = await supabase
      .from('books')
      .select('id, created_at')
      .eq('is_published', true);

    const bookUrls = (books || []).map(book => ({
      loc: `${baseUrl}/books/${book.id}`,
      lastmod: book.created_at ? new Date(book.created_at).toISOString().split('T')[0] : today,
      changefreq: 'monthly',
      priority: '0.7'
    }));

    const allUrls = [...staticUrls, ...blogUrls, ...bookUrls];

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://vread.fr/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
  }
};
