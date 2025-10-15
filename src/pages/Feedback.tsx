import { useState } from "react";
import { QuickRating } from "@/components/feedback/QuickRating";
import { FeedbackForm } from "@/components/feedback/FeedbackForm";
import { FeedbackList } from "@/components/feedback/FeedbackList";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/layout/AppHeader";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Feedback() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-12 space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold">
          🌱 Fais pousser VREAD avec nous
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Chaque feedback est une graine qui améliore l'expérience de toute la communauté
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            size="lg"
            onClick={() => {
              if (!user) {
                navigate('/auth');
                return;
              }
              setShowForm(true);
            }}
            className="text-lg"
          >
            🚀 Donner mon feedback
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => document.getElementById('feedback-list')?.scrollIntoView({ behavior: 'smooth' })}
          >
            👀 Voir les suggestions
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          🔥 En temps réel • Des centaines de feedbacks partagés
        </p>
      </div>

      {!showForm && (
        <div className="mb-8">
          <QuickRating />
        </div>
      )}

      {showForm && (
        <div className="mb-8">
          <FeedbackForm
            onSuccess={() => {
              setShowForm(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      <div id="feedback-list">
        <FeedbackList />
      </div>
      </div>
    </div>
  );
}
