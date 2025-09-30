import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

type Payload = {
  bookId?: string;
  questionId: string;
  userId?: string;
  consume?: boolean;
};

const cors = (origin: string | null) => ({
  "Access-Control-Allow-Origin": origin ?? "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
});

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(origin) });

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "content-type": "application/json", ...cors(origin) },
    });
  }

  let body: Payload;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400, headers: { "content-type": "application/json", ...cors(origin) },
    });
  }
  if (!body?.questionId) {
    return new Response(JSON.stringify({ error: "Missing questionId" }), {
      status: 400, headers: { "content-type": "application/json", ...cors(origin) },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
  });

  const { data: me, error: meErr } = await supabase.auth.getUser();
  if (meErr || !me?.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { "content-type": "application/json", ...cors(origin) },
    });
  }
  const userId = body.userId ?? me.user.id;

  console.log('[JOKER-REVEAL] Request body:', body);
  console.log('[JOKER-REVEAL] Authenticated user:', me.user.id);

  // Si bookId manque, on le déduit via questionId
  let bookId = body.bookId;
  let questionAnswer = "";
  
  if (!bookId) {
    const { data: qrow, error: qErr } = await supabase
      .from("reading_questions")
      .select("id, book_id, answer")
      .eq("id", body.questionId)
      .single();
    if (qErr || !qrow?.book_id) {
      console.error('[JOKER-REVEAL] Question not found:', qErr);
      return new Response(JSON.stringify({ error: "Question not found" }), {
        status: 404, headers: { "content-type": "application/json", ...cors(origin) },
      });
    }
    bookId = qrow.book_id as string;
    questionAnswer = qrow.answer;
    console.log('[JOKER-REVEAL] Resolved bookId from question:', bookId);
  } else {
    // Récupère la bonne réponse
    const { data: q, error: ansErr } = await supabase
      .from("reading_questions")
      .select("answer")
      .eq("id", body.questionId)
      .single();
    if (ansErr || !q?.answer) {
      console.error('[JOKER-REVEAL] Answer not found:', ansErr);
      return new Response(JSON.stringify({ error: "Answer not found" }), {
        status: 404, headers: { "content-type": "application/json", ...cors(origin) },
      });
    }
    questionAnswer = q.answer;
  }

  // Vérif quota joker - SANS le RPC use_joker qui fait la déduction
  // On vérifie juste si on PEUT utiliser un joker
  const { data: bookInfo, error: bookErr } = await supabase
    .from("books")
    .select("expected_segments")
    .eq("id", bookId)
    .single();
  
  if (bookErr || !bookInfo) {
    console.error('[JOKER-REVEAL] Book not found:', bookErr);
    return new Response(JSON.stringify({ error: "Book not found" }), {
      status: 404, headers: { "content-type": "application/json", ...cors(origin) },
    });
  }

  // Calculer les jokers autorisés
  const jokersAllowed = Math.floor(bookInfo.expected_segments / 10) + 1;
  
  // Compter les jokers déjà utilisés
  const { data: progressData, error: progressErr } = await supabase
    .from("reading_progress")
    .select("id")
    .eq("user_id", userId)
    .eq("book_id", bookId)
    .single();

  if (progressErr || !progressData) {
    console.error('[JOKER-REVEAL] Progress not found:', progressErr);
    return new Response(JSON.stringify({ error: "Reading progress not found" }), {
      status: 404, headers: { "content-type": "application/json", ...cors(origin) },
    });
  }

  const { data: validations, error: validErr } = await supabase
    .from("reading_validations")
    .select("id")
    .eq("progress_id", progressData.id)
    .eq("used_joker", true);

  if (validErr) {
    console.error('[JOKER-REVEAL] Error counting jokers:', validErr);
    return new Response(JSON.stringify({ error: "Error checking joker usage" }), {
      status: 500, headers: { "content-type": "application/json", ...cors(origin) },
    });
  }

  const jokersUsed = validations?.length || 0;
  const jokersRemaining = jokersAllowed - jokersUsed;

  console.log('[JOKER-REVEAL] Joker check:', {
    expected_segments: bookInfo.expected_segments,
    jokersAllowed,
    jokersUsed,
    jokersRemaining
  });

  if (jokersRemaining <= 0 && body.consume !== false) {
    return new Response(JSON.stringify({ error: "Plus aucun joker disponible pour ce livre" }), {
      status: 403, headers: { "content-type": "application/json", ...cors(origin) },
    });
  }

  // Marquer l'usage du joker si demandé (créer une validation avec used_joker: true)
  if (body.consume !== false) {
    const { error: markErr } = await supabase
      .from("reading_validations")
      .insert({
        user_id: userId,
        book_id: bookId,
        progress_id: progressData.id,
        question_id: body.questionId,
        answer: questionAnswer,
        used_joker: true,
        correct: true,
        revealed_answer_at: new Date().toISOString()
      });
    
    if (markErr) {
      console.error('[JOKER-REVEAL] Error marking joker usage:', markErr);
      return new Response(JSON.stringify({ error: markErr.message }), {
        status: 400, headers: { "content-type": "application/json", ...cors(origin) },
      });
    }
    console.log('[JOKER-REVEAL] Joker usage recorded successfully');
  }

  return new Response(JSON.stringify({ answer: questionAnswer }), {
    status: 200, headers: { "content-type": "application/json", ...cors(origin) },
  });
});