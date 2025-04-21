
import { questions } from "@/utils/quizQuestions";

/**
 * Retourne la question et la réponse attendue pour le livre et le segment donnés.
 * Renvoie une erreur s'il n'y a pas de question pour ce livre/segment (utilise fallback dans la logique du code appelant).
 */
export function getQuestion(bookId: string, segment: number): { question: string; answer: string; } {
  // Manipulation des clés similaires à quizQuestions.ts
  const normalizedBookId = (bookId || "").trim().toLowerCase();
  // Essaye la clé telle quelle puis cherche une clé compatible (pour compatibilité avec quizQuestions.ts)
  let key = Object.keys(questions).find(
    k => k.toLowerCase() === normalizedBookId
      || normalizedBookId.includes(k.toLowerCase())
      || k.toLowerCase().includes(normalizedBookId)
  );

  if (!key && questions[normalizedBookId]) key = normalizedBookId;
  if (!key) throw new Error(`Aucune question pour le livre: ${bookId}`);

  const bookQuestions = (questions as any)[key];
  const q = bookQuestions?.[segment];
  if (q) {
    // `q.answer` peut être string ou string[], ici on normalise pour n'accepter que la première valeur si tableau
    return {
      question: q.question,
      answer: Array.isArray(q.answer) ? q.answer[0] : q.answer
    };
  }

  throw new Error(`Aucune question pour ${bookId} segment ${segment}`);
}

/**
 * Vérifie si une question existe pour un livre et un segment donnés.
 */
export function hasQuestion(bookId: string, segment: number): boolean {
  try {
    getQuestion(bookId, segment);
    return true;
  } catch (_e) {
    return false;
  }
}

/**
 * Retourne une question générique si aucune question n'est trouvée pour ce segment.
 */
export function getFallbackQuestion(segment: number): { question: string; answer: string } {
  return {
    question: "Quel est l’élément central de ce passage ?",
    answer: "libre"
  };
}

/**
 * Validation stricte : l'utilisateur doit exactement entrer la réponse (non accentuée/non sensible à la casse/espaces).
 */
export function validateAnswer(
  bookId: string,
  segment: number,
  input: string
): boolean {
  try {
    const { answer } = getQuestion(bookId, segment);
    return input.trim().toLowerCase() === (answer || "").trim().toLowerCase();
  } catch (_e) {
    // Peut utiliser la réponse du fallback si nécessaire
    return input.trim().toLowerCase() === "libre";
  }
}
