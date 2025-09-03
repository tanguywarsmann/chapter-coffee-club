import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  console.log('[JOKER-REVEAL] Request received:', req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    console.log('[JOKER-REVEAL] Environment variables check:', {
      hasUrl: !!supabaseUrl,
      hasAnonKey: !!supabaseAnonKey,
      hasServiceKey: !!supabaseServiceKey
    });

    // Client for user authentication
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: req.headers.get("Authorization")! } },
    });

    const {
      data: { user },
      error: userErr,
    } = await supabaseAuth.auth.getUser();
    
    console.log('[JOKER-REVEAL] Auth check:', { hasUser: !!user, userErr });
    
    if (userErr || !user) {
      console.error('Authentication error:', userErr);
      return new Response(JSON.stringify({ error: "Unauthorized" }), { 
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const uid = user.id;

    const body = await req.json().catch((e) => {
      console.error('[JOKER-REVEAL] JSON parse error:', e);
      return {};
    });
    console.log('[JOKER-REVEAL] Request body:', body);
    
    const { bookId, bookSlug, segment, questionId, consume = true } = body;

    if ((!bookId && !bookSlug) || typeof segment !== "number") {
      console.error('[JOKER-REVEAL] Missing required params:', { bookId, bookSlug, segment });
      return new Response(JSON.stringify({ error: "Missing bookId/bookSlug or segment" }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Service Role client for secure operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1) Consume joker via existing RPC if requested
    if (consume) {
      const { data: jokerResult, error: rpcErr } = await supabase.rpc("use_joker", {
        p_user_id: uid,
        p_book_id: bookId ?? bookSlug,
        p_segment: segment,
      });
      
      if (rpcErr) {
        console.error('Joker RPC error:', rpcErr);
        return new Response(JSON.stringify({ error: "use_joker failed", details: rpcErr.message }), { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      // Check if joker usage was successful - handle multiple return formats
      const jr = jokerResult;
      const success = 
        jr === true ||
        (typeof jr === 'object' && jr?.success === true) ||
        (Array.isArray(jr) && (jr[0] === true || jr[0]?.success === true));

      if (!success) {
        return new Response(JSON.stringify({ 
          error: "Joker usage failed", 
          message: JSON.stringify(jr)
        }), { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    } else {
      // If not consuming here, verify joker was already used for this segment
      const { data: rv, error: rvErr } = await supabase
        .from("reading_validations")
        .select("id")
        .eq("user_id", uid)
        .eq("segment", segment)
        .eq("book_id", bookId ?? bookSlug)
        .eq("used_joker", true)
        .maybeSingle();
        
      if (rvErr) {
        console.error('Validation check error:', rvErr);
        return new Response(JSON.stringify({ error: "Failed to verify joker usage" }), { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      if (!rv) {
        return new Response(JSON.stringify({ error: "Joker not used for this segment" }), { 
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // 2) Get the correct answer
    let answer: string | null = null;

    if (questionId) {
      const { data: q1, error: q1Err } = await supabase
        .from("reading_questions")
        .select("answer")
        .eq("id", questionId)
        .maybeSingle();
        
      if (q1Err) {
        console.error('Question fetch by ID error:', q1Err);
        return new Response(JSON.stringify({ error: "Failed to read question by id", details: q1Err.message }), { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      answer = q1?.answer ?? null;
    } else {
      const { data: q2, error: q2Err } = await supabase
        .from("reading_questions")
        .select("answer")
        .eq(bookId ? "book_id" : "book_slug", bookId ?? bookSlug)
        .eq("segment", segment)
        .limit(1)
        .maybeSingle();
        
      if (q2Err) {
        console.error('Question fetch by book/segment error:', q2Err);
        return new Response(JSON.stringify({ error: "Failed to read question by book/segment", details: q2Err.message }), { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      answer = q2?.answer ?? null;
    }

    // Trim & guard the answer before return (avoid empty string due to spaces)
    answer = String(answer ?? '').trim();
    if (!answer) {
      return new Response(JSON.stringify({ error: "No correct answer found (empty)" }), { 
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 3) Mark answer as revealed and set correct to true
    const now = new Date().toISOString();
    const { data: updatedRows, error: updErr } = await supabase
      .from("reading_validations")
      .update({ revealed_answer_at: now, correct: true, validated_at: now })
      .eq("user_id", uid)
      .eq("segment", segment)
      .eq("book_id", bookId ?? bookSlug)
      .select("id");
      
    if (updErr) {
      console.error('Update revealed_answer_at error:', updErr);
      return new Response(JSON.stringify({ error: "Failed to update revealed_answer_at", details: updErr.message }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // If no rows affected, create the validation record
    if (!updatedRows || updatedRows.length === 0) {
      console.log('No existing validation found, creating new record');
      const { error: insErr } = await supabase
        .from("reading_validations")
        .insert([{
          user_id: uid,
          book_id: bookId ?? bookSlug,
          segment: segment,
          correct: true,
          used_joker: true,
          validated_at: now,
          revealed_answer_at: now
        }])
        .select("id")
        .maybeSingle();
        
      if (insErr) {
        console.error('Insert validation record error:', insErr);
        return new Response(JSON.stringify({ error: "Failed to create validation record", details: insErr.message }), { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    console.log(`Answer revealed for user ${uid}, segment ${segment}, book ${bookId ?? bookSlug}`);

    return new Response(
      JSON.stringify({
        correctAnswer: answer,
        revealedAt: now,
        segment,
        bookId: bookId ?? bookSlug,
        _debug: { usedQuestionId: !!questionId }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (e) {
    console.error('Joker reveal function error:', e);
    return new Response(JSON.stringify({ error: "Internal server error", details: String(e) }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});