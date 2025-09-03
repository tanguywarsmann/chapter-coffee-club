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

    // Resolve book slug to UUID if needed
    let actualBookId = bookId;
    if (!bookId && bookSlug) {
      console.log('[JOKER-REVEAL] Resolving book slug to UUID:', bookSlug);
      const { data: bookData, error: bookErr } = await supabase
        .from("books_public")
        .select("id")
        .eq("slug", bookSlug)
        .maybeSingle();
        
      if (bookErr || !bookData) {
        console.error('[JOKER-REVEAL] Failed to resolve book slug:', { bookSlug, bookErr });
        return new Response(JSON.stringify({ error: "Book not found" }), { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      actualBookId = bookData.id;
      console.log('[JOKER-REVEAL] Resolved book slug to UUID:', { bookSlug, actualBookId });
    }

    // 1) Consume joker via existing RPC if requested
    if (consume) {
      console.log('[JOKER-REVEAL] Calling use_joker RPC with params:', {
        p_user_id: uid,
        p_book_id: actualBookId,
        p_segment: segment,
      });
      
      const { data: jokerResult, error: rpcErr } = await supabase.rpc("use_joker", {
        p_user_id: uid,
        p_book_id: actualBookId,
        p_segment: segment,
      });
      
      console.log('[JOKER-REVEAL] RPC use_joker result:', { jokerResult, rpcErr });
      
      if (rpcErr) {
        console.error('Joker RPC error:', rpcErr);
        return new Response(JSON.stringify({ error: "use_joker failed", details: rpcErr.message }), { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      // Check if joker usage was successful - handle multiple return formats
      const jr = jokerResult;
      console.log('[JOKER-REVEAL] Analyzing joker result:', { jr, type: typeof jr, isArray: Array.isArray(jr) });
      
      const success = 
        jr === true ||
        (typeof jr === 'object' && jr?.success === true) ||
        (Array.isArray(jr) && (jr[0] === true || jr[0]?.success === true));

      console.log('[JOKER-REVEAL] Joker usage success check:', { success });

      if (!success) {
        console.error('[JOKER-REVEAL] Joker usage failed:', jr);
        return new Response(JSON.stringify({ 
          error: "Joker usage failed", 
          message: JSON.stringify(jr),
          debug: { jr, type: typeof jr }
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
        .eq("book_id", actualBookId)
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
        .eq("book_id", actualBookId)
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
    
    // First, check if validation already exists
    const { data: existingValidation } = await supabase
      .from("reading_validations")
      .select("id")
      .eq("user_id", uid)
      .eq("book_id", actualBookId)
      .eq("segment", segment)
      .maybeSingle();

    if (existingValidation) {
      // Update existing record
      console.log('Updating existing validation record:', existingValidation.id);
      const { error: updateErr } = await supabase
        .from("reading_validations")
        .update({
          correct: true,
          used_joker: true,
          validated_at: now,
          revealed_answer_at: now,
          question_id: questionId || null
        })
        .eq("id", existingValidation.id);
        
      if (updateErr) {
        console.error('Update validation record error:', updateErr);
        return new Response(JSON.stringify({ error: "Failed to update validation record", details: updateErr.message }), { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      console.log('Validation record updated successfully');
    } else {
      // Create new record
      console.log('Creating new validation record');
      const { error: insertErr } = await supabase
        .from("reading_validations")
        .insert({
          user_id: uid,
          book_id: actualBookId,
          segment: segment,
          correct: true,
          used_joker: true,
          validated_at: now,
          revealed_answer_at: now,
          question_id: questionId || null
        });
        
      if (insertErr) {
        console.error('Insert validation record error:', insertErr);
        return new Response(JSON.stringify({ error: "Failed to create validation record", details: insertErr.message }), { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      console.log('Validation record created successfully');
    }

    console.log(`Answer revealed for user ${uid}, segment ${segment}, book ${actualBookId}`);

    return new Response(
      JSON.stringify({
        correctAnswer: answer,
        revealedAt: now,
        segment,
        bookId: actualBookId,
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