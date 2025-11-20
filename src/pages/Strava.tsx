import { Link } from "react-router-dom";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { SEOHead } from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Strava() {
  return (
    <PublicLayout>
      <SEOHead
        title="Le Strava de la lecture : VREAD | Suivez votre progression comme un runner"
        description="Vous aimez Strava pour le running ? Découvrez VREAD, qui applique la même approche de tracking et motivation à la lecture de livres français."
        canonical="https://www.vread.fr/strava"
        ogType="article"
        tags={["strava", "lecture", "tracking", "progression", "stats", "gamification", "habitude lecture"]}
      />

      {/* JSON-LD Structured Data for SEO */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": "VREAD : Le Strava de la lecture",
          "description": "Découvrez comment VREAD applique les principes de tracking et gamification de Strava à la lecture de livres français. Stats, séries, badges et progression.",
          "url": "https://www.vread.fr/strava",
          "author": {
            "@type": "Organization",
            "name": "VREAD"
          },
          "publisher": {
            "@type": "Organization",
            "name": "VREAD",
            "logo": {
              "@type": "ImageObject",
              "url": "https://www.vread.fr/logo.png"
            }
          },
          "datePublished": "2025-01-15",
          "dateModified": new Date().toISOString().split('T')[0],
          "mainEntityOfPage": "https://www.vread.fr/strava",
          "keywords": "strava lecture, tracking lecture, stats lecture, progression lecture, gamification, habitude lecture, séries lecture"
        })}
      </script>

      <article className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Breadcrumbs */}
        <nav className="text-body-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-foreground transition-colors">Accueil</Link>
          <span className="mx-2">/</span>
          <span>Le Strava de la lecture</span>
        </nav>

        {/* Disclaimer */}
        <div className="bg-muted/50 border border-border rounded-lg p-4 mb-8">
          <p className="text-body-sm text-muted-foreground">
            ℹ️ VREAD n'est pas affilié à Strava Inc. Nous utilisons Strava comme référence pour expliquer notre approche de la lecture.
          </p>
        </div>

        {/* Hero Section */}
        <header className="mb-12">
          <h1 className="text-h1 font-serif text-foreground mb-4">
            VREAD : Le Strava de la lecture
          </h1>
          <p className="text-h4 text-muted-foreground font-sans">
            Vous adorez Strava pour tracker vos runs et battre vos records ? Imaginez la même chose... mais pour la lecture.
          </p>
        </header>

        {/* Hook Section */}
        <section className="mb-16">
          <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="p-8">
              <p className="text-body mb-4">
                Si vous utilisez Strava pour vos courses, vous connaissez cette sensation :
              </p>
              <ul className="space-y-3 text-body mb-6">
                <li>📊 Voir vos kilomètres s'accumuler semaine après semaine</li>
                <li>🏆 Battre votre record personnel</li>
                <li>🔥 Maintenir votre série de jours consécutifs</li>
                <li>📈 Observer votre progression sur des graphiques motivants</li>
              </ul>
              <p className="text-h3 font-serif text-foreground font-semibold">
                Et si vous pouviez avoir la même chose pour la lecture ?
              </p>
              <p className="text-h4 font-sans text-foreground mt-4">
                C'est exactement ce que fait VREAD.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Comparison Section */}
        <section className="mb-16">
          <h2 className="text-h2 font-serif text-foreground mb-6">
            Strava pour le running, VREAD pour la lecture
          </h2>

          {/* Desktop Comparison */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="text-left p-4 text-body font-semibold">STRAVA (Running) 🏃</th>
                  <th className="text-left p-4 text-body font-semibold">VREAD (Lecture) 📚</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Tu cours des kilomètres", "Tu lis des pages"],
                  ["Tu bats tes records de temps", "Tu améliores ton taux de compréhension"],
                  ["Tu vois ton évolution sur 30j", "Tu vois tes pages lues sur 30j"],
                  ["Tu maintiens ta série de runs", "Tu maintiens ta série de lecture"],
                  ["Tu partages tes exploits", "Tu débloques des badges de lecture"],
                  ["Tu fixes des objectifs (20km)", "Tu fixes des objectifs (100 pages)"],
                  ["Tu analyses tes performances", "Tu analyses ta compréhension"],
                  ["Tu rejoins des challenges", "Tu progresses dans des quêtes"],
                ].map((row, idx) => (
                  <tr key={idx} className={`border-b border-border ${idx % 2 === 0 ? 'bg-muted/20' : ''}`}>
                    <td className="p-4 text-body">{row[0]}</td>
                    <td className="p-4 text-body">{row[1]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Comparison */}
          <div className="md:hidden space-y-4">
            {[
              ["Tu cours des kilomètres", "Tu lis des pages"],
              ["Tu bats tes records de temps", "Tu améliores ton taux de compréhension"],
              ["Tu vois ton évolution sur 30j", "Tu vois tes pages lues sur 30j"],
              ["Tu maintiens ta série de runs", "Tu maintiens ta série de lecture"],
              ["Tu partages tes exploits", "Tu débloques des badges de lecture"],
              ["Tu fixes des objectifs (20km)", "Tu fixes des objectifs (100 pages)"],
              ["Tu analyses tes performances", "Tu analyses ta compréhension"],
              ["Tu rejoins des challenges", "Tu progresses dans des quêtes"],
            ].map((row, idx) => (
              <Card key={idx}>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div>
                      <p className="text-body-sm font-medium text-muted-foreground">Strava 🏃</p>
                      <p className="text-body">{row[0]}</p>
                    </div>
                    <div>
                      <p className="text-body-sm font-medium text-muted-foreground">VREAD 📚</p>
                      <p className="text-body">{row[1]}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Why it works Section */}
        <section className="mb-16">
          <h2 className="text-h2 font-serif text-foreground mb-6">
            Pourquoi Strava fonctionne (et VREAD aussi)
          </h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-body mb-6">
              Strava a révolutionné le running en appliquant un principe simple : <strong>ce qui est mesuré est amélioré</strong>.
            </p>
            
            <p className="text-body mb-6">
              Quand vous voyez vos stats, trois choses se produisent :
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="text-4xl mb-3">🎯</div>
                  <h3 className="text-h4 font-sans font-semibold text-foreground mb-2">
                    Motivation
                  </h3>
                  <p className="text-body text-muted-foreground">
                    Vous voulez battre votre record
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="text-4xl mb-3">🔥</div>
                  <h3 className="text-h4 font-sans font-semibold text-foreground mb-2">
                    Habitude
                  </h3>
                  <p className="text-body text-muted-foreground">
                    Vous ne voulez pas casser votre série
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="text-4xl mb-3">📈</div>
                  <h3 className="text-h4 font-sans font-semibold text-foreground mb-2">
                    Progression
                  </h3>
                  <p className="text-body text-muted-foreground">
                    Vous voyez concrètement que vous progressez
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-accent/10 border-accent/30">
              <CardContent className="p-8">
                <p className="text-h4 font-sans font-semibold text-foreground mb-4">
                  VREAD applique exactement la même psychologie à la lecture.
                </p>
                <p className="text-body mb-4">
                  Au lieu de lire "passivement" un livre sans savoir si vous comprenez vraiment, VREAD vous permet de :
                </p>
                <ul className="space-y-2 text-body">
                  <li>• Valider votre compréhension après chaque chapitre</li>
                  <li>• Voir vos stats de lecture (pages, taux de compréhension, série)</li>
                  <li>• Suivre votre progression comme un athlète suit ses entraînements</li>
                  <li>• Rester motivé grâce aux badges et objectifs</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="mb-16">
          <h2 className="text-h2 font-serif text-foreground mb-6">
            Ce que disent les utilisateurs Strava qui utilisent VREAD
          </h2>
          <div className="space-y-6">
            <Card className="border-l-4 border-l-primary">
              <CardContent className="p-6">
                <p className="text-body italic mb-4">
                  "En tant que runner qui check Strava tous les jours, j'adore avoir la même chose pour mes livres. Je vois enfin combien de pages je lis par semaine."
                </p>
                <p className="text-body-sm text-muted-foreground">
                  — Marie, 34 ans, utilisatrice Strava et VREAD
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-secondary">
              <CardContent className="p-6">
                <p className="text-body italic mb-4">
                  "Le principe de série de jours consécutifs fonctionne aussi bien pour la lecture que pour le running. J'en suis à 47 jours de lecture !"
                </p>
                <p className="text-body-sm text-muted-foreground">
                  — Thomas, 28 ans, marathonien
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-16">
          <h2 className="text-h2 font-serif text-foreground mb-6">
            Les features qui vous rappelleront Strava
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-4xl mb-3">📊</div>
                <h3 className="text-h4 font-sans font-semibold text-foreground mb-2">
                  Dashboard de stats
                </h3>
                <p className="text-body text-muted-foreground">
                  Comme votre dashboard Strava, voyez d'un coup d'œil : pages lues cette semaine, taux de compréhension moyen, série actuelle
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-4xl mb-3">🔥</div>
                <h3 className="text-h4 font-sans font-semibold text-foreground mb-2">
                  Séries quotidiennes
                </h3>
                <p className="text-body text-muted-foreground">
                  Exactement comme votre streak Strava. Lisez au moins 10 pages par jour pour maintenir votre série.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-4xl mb-3">📈</div>
                <h3 className="text-h4 font-sans font-semibold text-foreground mb-2">
                  Graphiques de progression
                </h3>
                <p className="text-body text-muted-foreground">
                  Graphiques sur 7j, 30j, 12 mois. Voyez votre évolution exactement comme sur Strava.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-4xl mb-3">🏆</div>
                <h3 className="text-h4 font-sans font-semibold text-foreground mb-2">
                  Badges d'accomplissement
                </h3>
                <p className="text-body text-muted-foreground">
                  Débloquez des badges : Premier livre terminé, 1000 pages lues, Série de 30 jours...
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-4xl mb-3">🎯</div>
                <h3 className="text-h4 font-sans font-semibold text-foreground mb-2">
                  Objectifs personnalisés
                </h3>
                <p className="text-body text-muted-foreground">
                  Fixez-vous un objectif : 500 pages ce mois, 1 livre par semaine, 15 min de lecture quotidienne.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-4xl mb-3">🏅</div>
                <h3 className="text-h4 font-sans font-semibold text-foreground mb-2">
                  Niveaux et XP
                </h3>
                <p className="text-body text-muted-foreground">
                  Comme les niveaux Strava, progressez de Lecteur Débutant à Lecteur Expert.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Target Audience Section */}
        <section className="mb-16">
          <Card className="bg-secondary/10 border-secondary/30">
            <CardContent className="p-8">
              <h2 className="text-h2 font-serif text-foreground mb-6">
                Pour qui ?
              </h2>
              <p className="text-body mb-4">
                VREAD est parfait si :
              </p>
              <ul className="space-y-3 text-body">
                <li>✅ Vous utilisez Strava (ou une app de fitness tracking)</li>
                <li>✅ Vous aimez les stats et la gamification</li>
                <li>✅ Vous voulez lire plus mais manquez de motivation</li>
                <li>✅ Vous avez un niveau B2+ en français</li>
                <li>✅ Vous voulez transformer la lecture en habitude, comme le running</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* CTA Section */}
        <section className="text-center mb-16">
          <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="p-12">
              <h2 className="text-h2 font-serif text-foreground mb-4">
                Commencer comme sur Strava
              </h2>
              <p className="text-body text-muted-foreground mb-8">
                Gratuit • iPhone & Web • Catalogue de classiques inclus
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="text-body text-white bg-primary hover:bg-primary/90">
                  <Link to="/auth">Essayer VREAD gratuitement</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-body border-primary text-primary hover:bg-primary/10">
                  <Link to="/a-propos">En savoir plus sur VREAD</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Footer Disclaimer */}
        <footer className="border-t border-border pt-8">
          <p className="text-caption text-muted-foreground">
            Cette page a été créée à titre informatif pour expliquer l'approche de tracking de VREAD. Strava® est une marque déposée de Strava Inc. VREAD n'est pas affilié, associé, autorisé, approuvé par, ou de quelque manière que ce soit officiellement lié à Strava Inc. Nous utilisons Strava comme référence pour illustrer notre philosophie de suivi de progression appliquée à la lecture.
          </p>
        </footer>
      </article>
    </PublicLayout>
  );
}
