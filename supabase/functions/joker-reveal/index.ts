import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface JokerRevealPayload {
  bookId?: string;
  bookSlug?: string;
  segment: number;
  questionId?: string;
  consume?: boolean;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Create client with user auth for security checks
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: req.headers.get('Authorization') ?? '' },
      },
    });

    // Create service role client for privileged operations
    const supabaseService = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    let body: JokerRevealPayload;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('[JOKER-REVEAL] Request body:', body);

    // Validate required parameters
    if (!body.segment) {
      return new Response(JSON.stringify({ error: 'Missing segment parameter' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!body.bookId && !body.bookSlug) {
      return new Response(JSON.stringify({ error: 'Missing bookId or bookSlug' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('[JOKER-REVEAL] Auth error:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('[JOKER-REVEAL] Authenticated user:', user.id);

    // Resolve bookId from slug if needed
    let resolvedBookId = body.bookId;
    if (!resolvedBookId && body.bookSlug) {
      const { data: bookData, error: bookError } = await supabaseService
        .from('books')
        .select('id')
        .eq('slug', body.bookSlug)
        .maybeSingle();

      if (bookError || !bookData) {
        console.error('[JOKER-REVEAL] Book lookup error:', bookError);
        return new Response(JSON.stringify({ error: 'Book not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      resolvedBookId = bookData.id;
    }

    console.log('[JOKER-REVEAL] Resolved bookId:', resolvedBookId);

    // Get question and correct answer
    let questionData;
    if (body.questionId) {
      // Get specific question by ID
      const { data, error } = await supabaseService
        .from('reading_questions')
        .select('id, answer, segment, book_id')
        .eq('id', body.questionId)
        .maybeSingle();

      if (error || !data) {
        console.error('[JOKER-REVEAL] Question lookup error:', error);
        return new Response(JSON.stringify({ error: 'Question not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      questionData = data;
    } else {
      // Get question by book and segment
      const { data, error } = await supabaseService
        .from('reading_questions')
        .select('id, answer, segment, book_id')
        .eq('book_id', resolvedBookId)
        .eq('segment', body.segment)
        .maybeSingle();

      if (error || !data) {
        console.error('[JOKER-REVEAL] Question lookup by segment error:', error);
        return new Response(JSON.stringify({ error: 'Question not found for this segment' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      questionData = data;
    }

    console.log('[JOKER-REVEAL] Found question:', questionData.id);

    // Check if joker can be used (only if consume is true)
    if (body.consume !== false) {
      try {
        const { data: jokerResult, error: jokerError } = await supabaseService.rpc('use_joker', {
          p_book_id: resolvedBookId,
          p_user_id: user.id,
          p_segment: body.segment
        });

        console.log('[JOKER-REVEAL] Joker check result:', jokerResult);

        if (jokerError) {
          console.error('[JOKER-REVEAL] Joker RPC error:', jokerError);
          return new Response(JSON.stringify({ error: jokerError.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        if (!jokerResult?.[0]?.success) {
          const message = jokerResult?.[0]?.message || 'Cannot use joker';
          console.warn('[JOKER-REVEAL] Joker usage failed:', message);
          return new Response(JSON.stringify({ error: message }), {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      } catch (error) {
        console.error('[JOKER-REVEAL] Joker validation error:', error);
        return new Response(JSON.stringify({ error: 'Failed to validate joker usage' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Create validation record with joker usage
    const { data: validation, error: validationError } = await supabaseService
      .from('reading_validations')
      .insert({
        user_id: user.id,
        book_id: resolvedBookId,
        question_id: questionData.id,
        segment: questionData.segment,
        answer: questionData.answer,
        used_joker: true,
        correct: true,
        revealed_answer_at: new Date().toISOString()
      })
      .select()
      .single();

    if (validationError) {
      console.error('[JOKER-REVEAL] Validation insert error:', validationError);
      // Don't fail completely, just log the error
      console.warn('[JOKER-REVEAL] Could not create validation record, continuing...');
    } else {
      console.log('[JOKER-REVEAL] Created validation:', validation.id);
    }

    // Return the correct answer
    const response = {
      correctAnswer: questionData.answer,
      revealedAt: new Date().toISOString(),
      segment: questionData.segment,
      bookId: resolvedBookId,
      validationSaved: !validationError,
      jokerRecorded: true,
      questionId: questionData.id
    };

    console.log('[JOKER-REVEAL] Success response:', response);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[JOKER-REVEAL] Unexpected error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error', 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});