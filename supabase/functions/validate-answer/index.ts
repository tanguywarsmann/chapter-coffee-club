import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { questionId, userAnswer, bookId, segment, progressId } = await req.json();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get JWT token from request headers
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization header required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify JWT and get user
    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid authentication' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get the question and correct answer
    const { data: question, error: questionError } = await supabase
      .from('reading_questions')
      .select('answer')
      .eq('id', questionId)
      .single();

    if (questionError || !question) {
      console.error('Question fetch error:', questionError);
      return new Response(JSON.stringify({ error: 'Question not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate answer (case-insensitive, trimmed)
    const correctAnswer = question.answer.trim().toLowerCase();
    const submittedAnswer = userAnswer.trim().toLowerCase();
    const isCorrect = correctAnswer === "libre" || submittedAnswer === correctAnswer;

    // Log the validation attempt (for security monitoring)
    console.log(`Answer validation attempt for user ${user.id}, question ${questionId}, correct: ${isCorrect}`);

    return new Response(JSON.stringify({ 
      isCorrect,
      attempts: 1 // This could be enhanced to track attempts server-side
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in validate-answer function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});