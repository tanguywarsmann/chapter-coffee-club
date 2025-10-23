import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

type Payload = { bookId?: string; questionId: string; userId?: string; consume?: boolean };

const cors = (origin: string | null) => ({
  "Access-Control-Allow-Origin": origin ?? "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
});

const json = (obj: unknown, init: ResponseInit = {}, origin: string | null = null) =>
  new Response(JSON.stringify(obj), {
    ...init,
    headers: { "content-type": "application/json", ...cors(origin), ...(init.headers ?? {}) },
  });

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  try {
    if (req.method === "OPTIONS") return new Response("ok", { headers: cors(origin) });
    if (req.method !== "POST") return json({ error: "Method not allowed" }, { status: 405 }, origin);

    let body: Payload;
    try { body = await req.json(); } catch { return json({ error: "Invalid JSON body" }, { status: 400 }, origin); }
    if (!body?.questionId) return json({ error: "Missing questionId" }, { status: 400 }, origin);

    // Auth
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } } }
    );
    const { data: me, error: meErr } = await supabase.auth.getUser();
    if (meErr || !me?.user) return json({ error: "Unauthorized" }, { status: 401 }, origin);
    const userId = body.userId ?? me.user.id;
    const wantConsume = body.consume !== false; // default: consume

    // 1) Résoudre question -> book + answer
    const { data: qrow, error: qErr } = await supabase
      .from("reading_questions")
      .select("book_id, answer")
      .eq("id", body.questionId)
      .single();
    if (qErr || !qrow?.book_id) return json({ error: "Question not found" }, { status: 404 }, origin);

    const bookId = body.bookId ?? (qrow.book_id as string);
    const questionAnswer = qrow.answer ?? "";

    // 2) Règles serveur (min segments)
    const { data: bookInfo, error: bookErr } = await supabase
      .from("books")
      .select("expected_segments")
      .eq("id", bookId)
      .single();
    if (bookErr || !bookInfo) return json({ error: "Book not found" }, { status: 404 }, origin);

    const JOKER_MIN_SEGMENTS = parseInt(Deno.env.get("JOKER_MIN_SEGMENTS") ?? "3", 10);
    if (bookInfo.expected_segments < JOKER_MIN_SEGMENTS && wantConsume) {
      return json({ error: "Jokers indisponibles: livre trop court (moins de 3 segments)" }, { status: 403 }, origin);
    }

    // 3) Quota simple
    const jokersAllowed = Math.floor((bookInfo.expected_segments ?? 0) / 10) + 1;

    // 4) Décompte utilisé (sans dépendre de progress_id)
    const { count: jokersUsed, error: countErr } = await supabase
      .from("reading_validations")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("book_id", bookId)
      .eq("used_joker", true);
    if (countErr) return json({ error: "Error checking joker usage" }, { status: 500 }, origin);

    const remainingBefore = Math.max(0, (jokersAllowed ?? 0) - (jokersUsed ?? 0));
    if (remainingBefore <= 0 && wantConsume) {
      return json({ error: "Plus aucun joker disponible pour ce livre" }, { status: 403 }, origin);
    }

    // 5) Consommation idempotente via RPC (fallback safe si absente)
    let meta: Record<string, unknown> | undefined;
    if (wantConsume) {
      const { error: rpcErr } = await supabase.rpc("force_validate_segment_beta", {
        p_book_id: bookId,            // TEXT (compat)
        p_question_id: body.questionId,
        p_answer: "",                 // on ne valide pas la réponse ici
        p_user_id: userId,
        p_used_joker: true,
        p_correct: true,
      });

      if (rpcErr) {
        // Compat: ne casse pas l'UI. Renvoie 200 + meta.conflict
        meta = { conflict: true, reason: rpcErr.message ?? "RPC error" };

        // Fallback “soft” UNIQUEMENT si la RPC n’existe pas (ex: 42883)
        if ((rpcErr as any).message?.includes("does not exist")) {
          const { error: legacyErr } = await supabase
            .from("reading_validations")
            .insert({
              user_id: userId,
              book_id: bookId,
              question_id: body.questionId,
              answer: questionAnswer,
              used_joker: true,
              correct: true,
              revealed_answer_at: new Date().toISOString(),
            });
          if (legacyErr) meta = { ...meta, legacyInsertFailed: true, legacyReason: legacyErr.message };
        }
      }
    }

    // 6) Réponse (toujours 200 pour compat)
    const remainingAfter = wantConsume ? Math.max(0, remainingBefore - 1) : remainingBefore;
    return json(
      {
        answer: questionAnswer,               // ← champ attendu par l’UI actuelle
        jokers: { allowed: jokersAllowed, used: (jokersUsed ?? 0) + (wantConsume ? 1 : 0), remaining: remainingAfter },
        ...(meta ? { meta } : {}),
      },
      { status: 200 },
      origin
    );
  } catch (e) {
    console.error("[joker-reveal] fatal:", e);
    return json({ error: "Internal error" }, { status: 500 }, origin);
  }
});
