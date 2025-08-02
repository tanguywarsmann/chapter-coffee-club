import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Edge Function pour publier automatiquement les articles planifiés
 * Cron: toutes les 15 minutes (0,15,30,45 * * * *)
 */
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting scheduled posts publication check...');
    
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Publier les articles dont la date de publication est passée
    const { data, error } = await supabase
      .from("blog_posts")
      .update({ 
        published: true, 
        updated_at: new Date().toISOString() 
      })
      .eq("published", false)
      .not("published_at", "is", null)
      .lte("published_at", new Date().toISOString())
      .select("id, title, slug");

    if (error) {
      console.error("Error publishing scheduled posts:", error);
      return new Response(
        JSON.stringify({ error: "Failed to publish posts" }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const publishedCount = data?.length || 0;
    console.log(`Published ${publishedCount} scheduled posts:`, data);

    // Log des articles publiés pour debugging
    if (publishedCount > 0) {
      data?.forEach(post => {
        console.log(`✅ Published: "${post.title}" (${post.slug})`);
      });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        published_count: publishedCount,
        published_posts: data || []
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error in publish-scheduled-posts:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});