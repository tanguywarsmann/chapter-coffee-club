import { useState } from "react";
import { QuickRating } from "@/components/feedback/QuickRating";
import { FeedbackForm } from "@/components/feedback/FeedbackForm";
import { FeedbackList } from "@/components/feedback/FeedbackList";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AppHeader } from "@/components/layout/AppHeader";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/i18n/LanguageContext";
import { useNavigate } from "react-router-dom";

export default function Feedback() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="max-w-6xl mx-auto px-4 py-10 md:py-16 space-y-12">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-coffee-darker via-coffee-dark to-coffee-light text-white px-6 py-10 md:px-10 shadow-2xl">
          <div className="absolute inset-y-0 right-0 w-1/2 pointer-events-none opacity-40">
            <div className="h-full w-full bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.45),_transparent_65%)]" />
          </div>
          <div className="relative z-10 space-y-6">
            <p className="text-sm uppercase tracking-[0.3em] text-white/70">Bêta Communautaire</p>
            <h1 className="text-3xl md:text-5xl font-serif font-bold leading-tight max-w-3xl">
              {t.feedback.title}
            </h1>
            <p className="text-base md:text-lg text-white/80 max-w-3xl">
              {t.feedback.subtitle}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                onClick={() => {
                  if (!user) {
                    navigate('/auth');
                    return;
                  }
                  setShowForm(true);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-lg shadow-lg shadow-black/10"
              >
                {t.feedback.buttons.give}
              </Button>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => document.getElementById('feedback-list')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-lg bg-white/10 hover:bg-white/20 border-white/20 text-white"
              >
                {t.feedback.buttons.view}
              </Button>
            </div>
            <p className="text-sm text-white/70">
              {t.feedback.realTime}
            </p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="space-y-6">
            <QuickRating />

            <Card className="p-6 border-dashed border-coffee-light bg-coffee-lightest/40">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-coffee-dark uppercase tracking-wide">Pourquoi participer ?</p>
                  <p className="text-muted-foreground text-sm">
                    Chaque retour améliore la roadmap, débloque des points bonus et renforce la voix de la communauté.
                  </p>
                </div>
                <ul className="space-y-2 text-sm text-coffee-darker">
                  <li className="flex items-start gap-2">
                    <span className="text-lg">🏆</span>
                    <span>Classement mis à jour en direct avec vos votes.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-lg">✨</span>
                    <span>Badges spéciaux lorsqu'un feedback passe en production.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-lg">🤝</span>
                    <span>Réponses privilégiées de l'équipe produit VREAD.</span>
                  </li>
                </ul>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            {showForm ? (
              <FeedbackForm
                onSuccess={() => {
                  setShowForm(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onCancel={() => setShowForm(false)}
              />
            ) : (
              <Card className="p-6 h-full flex flex-col gap-6 bg-white/70">
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-coffee-dark uppercase tracking-wide">Envie d'aller plus loin ?</p>
                  <h2 className="text-2xl font-serif text-coffee-darker">Dépose ton feedback détaillé</h2>
                  <p className="text-muted-foreground">
                    Explique ton idée, joins un contexte, gagne davantage de points et suis son statut dans VREAD.
                  </p>
                </div>
                <div className="grid gap-3 text-sm text-muted-foreground">
                  <div className="rounded-2xl border border-coffee-light p-3 bg-white">
                    <p className="font-semibold text-coffee-darker">+15 pts</p>
                    <p>pour une nouvelle idée approuvée</p>
                  </div>
                  <div className="rounded-2xl border border-coffee-light p-3 bg-white">
                    <p className="font-semibold text-coffee-darker">+10 pts</p>
                    <p>pour un bug reproductible</p>
                  </div>
                </div>
                <Button size="lg" onClick={() => setShowForm(true)} className="text-lg">
                  Je rédige mon feedback
                </Button>
              </Card>
            )}
          </div>
        </section>

        <section id="feedback-list" className="scroll-mt-24">
          <FeedbackList />
        </section>
      </main>
    </div>
  );
}
