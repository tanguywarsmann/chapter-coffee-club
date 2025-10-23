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
): Promise<ValidateReadingResponse & { newBadges?: any[] }> => {
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

    const rpcRow = Array.isArray(rpcRes) ? rpcRes[0] : rpcRes;
    if (!rpcRow?.progress_id) {
      // Défensif: la RPC doit toujours renvoyer un progress_id
      throw new Error("RPC ok mais progress_id manquant");
    }

    // 4) Lire le progress ACTUEL depuis la DB (source de vérité)
    const { data: progress, error: progressErr } = await supabase
      .from("reading_progress")
      .select("current_page, status")
      .eq("id", rpcRow.progress_id)
      .maybeSingle();

    if (progressErr || !progress) {
      // Fallback minimal si la lecture échoue: on ne bloque pas l'expérience
      console.warn("[validateReading] Progress fetch failed:", progressErr);
    }

    const currentPage = progress?.current_page ?? 0;
    const status = (progress?.status as ReadingProgressStatus) ?? "in_progress";

    // 5) Déterminer si le segment était déjà validé (idempotence)
    //    La RPC renvoie action = 'inserted' | 'updated'
    const alreadyValidated = rpcRow?.action === "updated";

    // 6) Workflow badges / quêtes (utilise les valeurs réelles)
    const nextSegmentNumber = request.segment + 1;
    const newBadges = await handleBadgeAndQuestWorkflow(
      request,               // payload initial
      rpcRow.progress_id,    // progress id
      currentPage,           // page courante post-RPC
      nextSegmentNumber,     // prochain segment (indice humain)
      request.book_id,       // book
      request.user_id,       // user
      question               // question qui vient d'être validée
    ).catch((e) => {
      console.warn("[validateReading] badge workflow failed (non bloquant):", e);
      return undefined;
    });

    // 7) Réponse compatible avec l'existant
    return {
      message: alreadyValidated ? "Segment déjà validé (idempotent)" : "Segment validé avec succès",
      current_page: currentPage,
      already_validated: alreadyValidated,
      next_segment_question: null, // si besoin, à remplir via getQuestionForBookSegment ailleurs
      ...(newBadges ? { newBadges } : {}),
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erreur inconnue";
    console.error("[validateReading] failure:", error);
    toast.error(`Échec de la validation: ${msg}`);
    throw new Error(msg);
  }
};
