// chapter-coffee-club/src/services/reading/validationService.ts

import { toast } from "sonner";
import { ValidateReadingRequest, ValidateReadingResponse } from "@/types/reading";
import { getQuestionForBookSegment } from "../questionService";
import { checkUserSession } from "./validationSessionUtils";
import { handleBadgeAndQuestWorkflow } from "./badgeAndQuestWorkflow";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type ReadingProgressStatus = Database['public']['Enums']['reading_status'];

/**
 * Valide un segment de lecture via la RPC atomique côté serveur.
 * - Évite tout roll-back (upsert OR sur used_joker/correct).
 * - Verrouille (advisory lock) pour empêcher les doubles clics concurrents.
 * - Met à jour reading_progress côté DB (monotone).
 */
export const validateReading = async (
  request: ValidateReadingRequest
): Promise<ValidateReadingResponse & { newBadges?: any[]; newQuests?: any[] }> => {
  try {
    await checkUserSession(request.user_id);

    // 1) Infos livre (pour slug & cohérence)
    const { data: bookData, error: bookError } = await supabase
      .from("books_public")
      .select("slug, total_pages")
      .eq("id", request.book_id)
      .maybeSingle();

    if (bookError || !bookData) {
      throw new Error("❌ Impossible de récupérer les informations du livre");
    }

    // 2) Question du segment (nécessaire pour p_question_id)
    //    NB: getQuestionForBookSegment doit renvoyer { id, ... }
    const question = await getQuestionForBookSegment(
      bookData.slug || request.book_id,
      request.segment
    );
    if (!question?.id) {
      throw new Error("❌ Question introuvable pour ce segment");
    }

    // 3) Appel unique à la RPC de validation (idempotente)
    //    - p_used_joker = request.used_joker (par défaut false)
    //    - p_correct    = request.correct ?? true (joker => true)
    const { data: rpcRes, error: rpcErr } = await supabase.rpc(
      "force_validate_segment_beta",
      {
        p_book_id: request.book_id,        // TEXT dans le schéma actuel
        p_question_id: question.id,        // UUID question
        p_answer: (request as any).answer ?? "", // si tu passes une réponse libre côté client
        p_user_id: request.user_id,        // UUID user
        p_used_joker: !!request.used_joker,
        p_correct: request.correct !== undefined ? !!request.correct : true,
      }
    );

    if (rpcErr) {
      console.error("[validateReading] RPC error:", rpcErr);
      throw new Error(rpcErr.message || "Échec validation (RPC)");
    }

    // Normalisation: supporte jsonb (objet) ET table (array de rows)
    const row: any = Array.isArray(rpcRes) ? rpcRes[0] : (rpcRes ?? {});
    const progressId: string | undefined =
      row.progress_id ?? row.progressId ?? row.progress ?? row.data?.progress_id ?? undefined;
    const action: string | undefined = row.action ?? row.data?.action ?? undefined;

    // 4) Lire le progress ACTUEL depuis la DB (source de vérité)
    let currentPage = 0;
    if (progressId) {
      const { data: progress, error: progressErr } = await supabase
        .from("reading_progress")
        .select("current_page, status")
        .eq("id", progressId)
        .maybeSingle();
      
      if (!progressErr && progress) {
        currentPage = progress.current_page ?? 0;
      }
    } else {
      // Fallback si la RPC ne renvoie pas progress_id
      const { data: progress, error: progressErr } = await supabase
        .from("reading_progress")
        .select("current_page, status")
        .eq("user_id", request.user_id)
        .eq("book_id", request.book_id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!progressErr && progress) {
        currentPage = progress.current_page ?? 0;
      }
    }

    // 5) Déterminer si le segment était déjà validé (idempotence)
    let alreadyValidated = action === "updated";
    if (!alreadyValidated) {
      const { data: existing, error: existingErr } = await supabase
        .from("reading_validations")
        .select("id")
        .eq("user_id", request.user_id)
        .eq("book_id", request.book_id)
        .eq("segment", request.segment)
        .limit(1);
      if (!existingErr) alreadyValidated = (existing?.length ?? 0) > 0;
    }

    // 6) Workflow badges / quêtes (utilise les valeurs réelles)
    const nextSegmentNumber = request.segment + 1;
    const workflowResult = await handleBadgeAndQuestWorkflow(
      request,               // payload initial
      progressId || null,    // progress id
      currentPage,           // page courante post-RPC
      nextSegmentNumber,     // prochain segment (indice humain)
      request.book_id,       // book
      request.user_id,       // user
      question               // question qui vient d'être validée
    ).catch((e) => {
      console.warn("[validateReading] badge workflow failed (non bloquant):", e);
      return { newBadges: undefined, newQuests: undefined };
    });

    // 7) Réponse compatible avec l'existant
    return {
      message: alreadyValidated ? "Segment déjà validé (idempotent)" : "Segment validé avec succès",
      current_page: currentPage,
      already_validated: alreadyValidated,
      next_segment_question: null, // si besoin, à remplir via getQuestionForBookSegment ailleurs
      ...(workflowResult?.newBadges ? { newBadges: workflowResult.newBadges } : {}),
      ...(workflowResult?.newQuests ? { newQuests: workflowResult.newQuests } : {}),
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erreur inconnue";
    console.error("[validateReading] failure:", error);
    toast.error(`Échec de la validation: ${msg}`);
    throw new Error(msg);
  }
};
