import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Sparkles } from "lucide-react";

interface CorrectAnswerRevealProps {
  correctAnswer: string;
  segment: number;
  revealedAt: string;
  onContinue: () => void;
}

export function CorrectAnswerReveal({ 
  correctAnswer, 
  segment, 
  revealedAt, 
  onContinue 
}: CorrectAnswerRevealProps) {
  return (
    <div
      className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 shadow-sm"
      role="status"
      aria-live="polite"
      data-testid="correct-answer-reveal"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-full bg-amber-200">
          <Sparkles className="h-5 w-5 text-amber-600" />
        </div>
        <div>
          <h3 className="font-semibold text-amber-800">
            Bonne réponse révélée
          </h3>
          <p className="text-sm text-amber-700">
            Segment {segment} validé avec un Joker
          </p>
        </div>
      </div>

      <div className="mb-4 p-4 bg-white rounded-lg border">
        <p className="text-sm text-muted-foreground mb-2">
          La bonne réponse était :
        </p>
        <p 
          className="text-lg font-semibold text-foreground" 
          data-testid="revealed-answer-text"
        >
          {correctAnswer || "Réponse introuvable (vérifier answer en base et questionId/slug/segment)."}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-amber-600">
          Révélé le {new Date(revealedAt).toLocaleString('fr-FR')}
        </p>
        
        <Button
          onClick={onContinue}
          className="bg-amber-600 hover:bg-amber-700 text-white"
          data-testid="continue-after-reveal"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Continuer la lecture
        </Button>
      </div>
    </div>
  );
}