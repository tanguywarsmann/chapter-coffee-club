import { useState, useEffect } from "react";
import { FeedbackCard } from "./FeedbackCard";
import { getFeedbacks, FeedbackSubmission, FeedbackFilters } from "@/services/feedback/feedbackService";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function FeedbackList() {
  const [feedbacks, setFeedbacks] = useState<FeedbackSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<FeedbackFilters>({
    sortBy: 'votes'
  });

  useEffect(() => {
    loadFeedbacks();
  }, [filters]);

  async function loadFeedbacks() {
    setIsLoading(true);
    try {
      const data = await getFeedbacks(filters);
      setFeedbacks(data);
    } catch (error) {
      console.error('Error loading feedbacks:', error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h2 className="text-2xl font-bold">👥 Suggestions de la communauté</h2>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filters.sortBy === 'votes' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilters({ ...filters, sortBy: 'votes' })}
          >
            🔥 Top votes
          </Button>
          <Button
            variant={filters.sortBy === 'recent' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilters({ ...filters, sortBy: 'recent' })}
          >
            🆕 Récent
          </Button>
        </div>
      </div>

      {feedbacks.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          Aucun feedback pour le moment. Sois le premier ! 🌱
        </p>
      ) : (
        <div className="space-y-3">
          {feedbacks.map(feedback => (
            <FeedbackCard
              key={feedback.id}
              feedback={feedback}
              onVoteChange={loadFeedbacks}
            />
          ))}
        </div>
      )}
    </div>
  );
}
