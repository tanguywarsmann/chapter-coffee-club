import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { submitQuickRating, getQuickRatingsStats } from "@/services/feedback/feedbackService";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const emojis = [
  { rating: 5, emoji: "😍", label: "Génial" },
  { rating: 4, emoji: "😊", label: "Bien" },
  { rating: 3, emoji: "😐", label: "Correct" },
  { rating: 2, emoji: "😕", label: "Bof" },
  { rating: 1, emoji: "😤", label: "Frustrant" }
];

export function QuickRating() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [stats, setStats] = useState<number[]>([0, 0, 0, 0, 0]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const data = await getQuickRatingsStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }

  async function handleRating(rating: number) {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Connecte-toi pour donner ton avis !",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await submitQuickRating(rating);
      setSelectedRating(rating);
      
      const confetti = document.createElement('div');
      confetti.textContent = '+5 pts ✨';
      confetti.className = 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl font-bold text-green-600 animate-bounce z-50';
      document.body.appendChild(confetti);
      setTimeout(() => confetti.remove(), 1500);

      toast({
        title: "Merci ! 🌱",
        description: "Tu viens de gagner 5 points"
      });

      await loadStats();
    } catch (error: any) {
      console.error('Error submitting rating:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'envoyer ton avis",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-2">⚡ Feedback Express</h2>
      <p className="text-muted-foreground mb-6">
        Comment était ton expérience aujourd'hui ?
      </p>

      <div className="flex justify-between gap-2 mb-4">
        {emojis.map(({ rating, emoji, label }) => (
          <Button
            key={rating}
            variant="outline"
            className={`flex-1 flex flex-col gap-2 h-auto py-4 transition-all ${
              selectedRating === rating ? 'border-primary border-2 scale-105' : ''
            }`}
            onClick={() => handleRating(rating)}
            disabled={isLoading || selectedRating !== null}
          >
            <span className="text-4xl">{emoji}</span>
            <span className="text-xs">{label}</span>
            {stats[rating - 1] > 0 && (
              <span className="text-xs text-muted-foreground">
                {stats[rating - 1]}
              </span>
            )}
          </Button>
        ))}
      </div>

      {selectedRating && (
        <p className="text-center text-sm text-green-600 font-medium animate-in fade-in">
          ✨ +5 pts • Ton vote compte !
        </p>
      )}
    </Card>
  );
}
