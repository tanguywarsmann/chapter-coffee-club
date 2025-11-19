import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FeedbackSubmission, voteFeedback } from "@/services/feedback/feedbackService";
import { ThumbsUp, MessageSquare, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  feedback: FeedbackSubmission;
  onVoteChange?: () => void;
}

const typeConfig = {
  bug: { emoji: '🐛', label: 'Bug', color: 'bg-red-100 text-red-800' },
  feature: { emoji: '✨', label: 'Feature', color: 'bg-blue-100 text-blue-800' },
  idea: { emoji: '💡', label: 'Idée', color: 'bg-yellow-100 text-yellow-800' },
  love: { emoji: '❤️', label: 'J\'adore', color: 'bg-pink-100 text-pink-800' },
  suggestion: { emoji: '📝', label: 'Suggestion', color: 'bg-purple-100 text-purple-800' },
  question: { emoji: '❓', label: 'Question', color: 'bg-gray-100 text-gray-800' }
};

const statusConfig = {
  pending: { label: 'En attente', color: 'bg-gray-100 text-gray-800' },
  in_progress: { label: 'En cours', color: 'bg-blue-100 text-blue-800' },
  done: { label: 'Réalisé', color: 'bg-green-100 text-green-800' },
  rejected: { label: 'Rejeté', color: 'bg-red-100 text-red-800' }
};

export function FeedbackCard({ feedback, onVoteChange }: Props) {
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(feedback.has_voted);
  const [votesCount, setVotesCount] = useState(feedback.votes_count);

  const typeInfo = typeConfig[feedback.type];
  const statusInfo = statusConfig[feedback.status];

  async function handleVote() {
    setIsVoting(true);
    try {
      await voteFeedback(feedback.id);
      setHasVoted(!hasVoted);
      setVotesCount(hasVoted ? votesCount - 1 : votesCount + 1);
      
      if (!hasVoted) {
        toast.success("+2 points gagnés", {
          description: "Vote enregistré ! 🎉"
        });
      }

      onVoteChange?.();
    } catch (error: any) {
      console.error('Error voting:', error);
      toast.error(error.message || "Impossible de voter", {
        description: "Erreur"
      });
    } finally {
      setIsVoting(false);
    }
  }

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="sm:w-24 flex sm:flex-col gap-2">
          <Button
            variant={hasVoted ? "default" : "outline"}
            size="sm"
            className="flex-1 sm:flex-auto flex flex-col items-center justify-center gap-1 py-2"
            onClick={handleVote}
            disabled={isVoting}
          >
            <ThumbsUp className={`h-4 w-4 ${hasVoted ? 'fill-current' : ''}`} />
            <span className="text-xs font-semibold">{votesCount}</span>
          </Button>
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={`${typeInfo.color} whitespace-nowrap`}>
              {typeInfo.emoji} {typeInfo.label}
            </Badge>
            {feedback.category && (
              <Badge variant="outline" className="text-xs break-words">
                {feedback.category}
              </Badge>
            )}
            <Badge className={`${statusInfo.color} whitespace-nowrap`}>
              {statusInfo.label}
            </Badge>
          </div>

          <h3 className="font-semibold text-lg leading-snug break-words">{feedback.title}</h3>
          <p className="text-muted-foreground text-sm break-words">{feedback.description}</p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            {!feedback.is_anonymous && feedback.profiles && (
              <div className="flex items-center gap-2 min-w-0">
                <Avatar className="h-5 w-5 flex-shrink-0">
                  <AvatarImage src={feedback.profiles.avatar_url} />
                  <AvatarFallback>
                    {feedback.profiles.username?.[0]?.toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate max-w-[140px] sm:max-w-none">@{feedback.profiles.username}</span>
              </div>
            )}
            {feedback.is_anonymous && (
              <span className="italic">Anonyme</span>
            )}
            
            <div className="flex items-center gap-1 whitespace-nowrap">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(feedback.created_at), {
                addSuffix: true,
                locale: fr
              })}
            </div>

            {feedback.comments_count > 0 && (
              <div className="flex items-center gap-1 whitespace-nowrap">
                <MessageSquare className="h-3 w-3" />
                {feedback.comments_count}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
