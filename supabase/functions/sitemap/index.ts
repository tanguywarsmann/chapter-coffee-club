import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml',
  'Cache-Control': 'max-age=3600, stale-while-revalidate=86400'
};

interface BlogPost {
  slug: string;
  updated_at: string;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Fetch published blog posts
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('slug, updated_at')
      .eq('published', true)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching blog posts:', error);
      throw error;
    }

    // Generate sitemap XML
    const baseUrl = 'https://vread.fr';
    const currentDate = new Date().toISOString();

    // Static pages
    const staticPages = [
      { url: '', lastmod: currentDate, changefreq: 'daily', priority: '1.0' },
      { url: '/blog', lastmod: currentDate, changefreq: 'weekly', priority: '0.8' },
      { url: '/auth', lastmod: currentDate, changefreq: 'monthly', priority: '0.5' },
    ];

    // Blog posts
    const blogPages = (posts || []).map((post: BlogPost) => ({
      url: `/blog/${post.slug}`,
      lastmod: new Date(post.updated_at).toISOString(),
      changefreq: 'monthly',
      priority: '0.7'
    }));

    const allPages = [...staticPages, ...blogPages];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    return new Response(sitemap, {
      status: 200,
      headers: corsHeaders
    });

  } catch (error) {
    console.error('Error generating sitemap:', error);
    
    // Return minimal sitemap as fallback
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://vread.fr</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

    return new Response(fallbackSitemap, {
      status: 200,
      headers: corsHeaders
    });
  }
});