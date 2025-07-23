import { supabase } from "@/integrations/supabase/client";

interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: 'weekly' | 'monthly';
  priority: string;
}

export default async function handler(req: Request): Promise<Response> {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Content-Type': 'application/xml',
    'Cache-Control': 'max-age=3600, stale-while-revalidate=86400'
  };

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const baseUrl = 'https://vread.fr';
    const today = new Date().toISOString().split('T')[0];
    
    // Pages statiques publiques
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

    // Articles de blog dynamiques depuis Supabase
    const { data: blogPosts, error } = await supabase
      .from('blog_posts')
      .select('slug, updated_at')
      .eq('published', true)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Erreur lors de la récupération des articles:', error);
      throw error;
    }

    const blogUrls: SitemapUrl[] = (blogPosts || []).map(post => ({
      loc: `${baseUrl}/blog/${post.slug}`,
      lastmod: post.updated_at.split('T')[0],
      changefreq: 'monthly',
      priority: '0.8'
    }));

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

    return new Response(sitemap, { headers: corsHeaders });
  } catch (error) {
    console.error('Erreur génération sitemap:', error);
    
    // Fallback vers un sitemap minimal
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://vread.fr/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://vread.fr/blog</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`;

    return new Response(fallbackSitemap, { 
      headers: corsHeaders,
      status: 200 
    });
  }
}