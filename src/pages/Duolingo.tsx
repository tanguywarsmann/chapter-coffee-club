import { Link } from "react-router-dom";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { SEOHead } from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";

export default function Duolingo() {
  return (
    <PublicLayout>
      <SEOHead
        title="VREAD et Duolingo : Quelle app pour apprendre le français ? | Comparaison 2025"
        description="Comparaison complète entre VREAD et Duolingo pour apprendre le français. Découvrez quelle app correspond le mieux à votre niveau et vos objectifs de lecture."
        canonical="https://www.vread.fr/duolingo"
        ogType="article"
        tags={["duolingo", "apprendre français", "lecture", "comparaison", "application français", "DELF", "DALF"]}
      />

      {/* JSON-LD Structured Data for SEO */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": "VREAD et Duolingo : Comparaison complète pour apprendre le français",
          "description": "Comparaison détaillée entre VREAD et Duolingo pour apprendre le français. Analyse des forces, faiblesses, prix et recommandations selon votre niveau.",
          "url": "https://www.vread.fr/duolingo",
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
          "mainEntityOfPage": "https://www.vread.fr/duolingo",
          "keywords": "duolingo, apprendre français, lecture, comparaison, application français, DELF, DALF, B2, C1, C2"
        })}
      </script>

      <article className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Breadcrumbs */}
        <nav className="text-body-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-foreground transition-colors">Accueil</Link>
          <span className="mx-2">/</span>
          <span>Comparaison Duolingo</span>
        </nav>

        {/* Disclaimer */}
        <div className="bg-muted/50 border border-border rounded-lg p-4 mb-8">
          <p className="text-body-sm text-muted-foreground">
            ℹ️ VREAD n'est pas affilié à Duolingo Inc. Cette comparaison est indépendante et factuelle.
          </p>
        </div>

        {/* Hero Section */}
        <header className="mb-12">
          <h1 className="text-h1 font-serif text-foreground mb-4">
            VREAD et Duolingo : Comparaison complète pour apprendre le français
          </h1>
          <p className="text-h4 text-muted-foreground font-sans">
            Duolingo et VREAD sont deux excellentes apps pour apprendre le français. Mais laquelle choisir selon votre niveau et vos objectifs ?
          </p>
        </header>

        {/* Comparison Table */}
        <section className="mb-16">
          <h2 className="text-h2 font-serif text-foreground mb-6">Comparaison rapide</h2>
          
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="text-left p-4 text-body font-semibold">Critère</th>
                  <th className="text-left p-4 text-body font-semibold">Duolingo</th>
                  <th className="text-left p-4 text-body font-semibold">VREAD</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border bg-muted/20">
                  <td className="p-4 text-body">🎯 Focus principal</td>
                  <td className="p-4 text-body">Vocabulaire + Grammaire</td>
                  <td className="p-4 text-body">Lecture + Compréhension</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-4 text-body">📚 Type de contenu</td>
                  <td className="p-4 text-body">Exercices courts (5-10 min)</td>
                  <td className="p-4 text-body">Livres complets (romans, classiques)</td>
                </tr>
                <tr className="border-b border-border bg-muted/20">
                  <td className="p-4 text-body">🎮 Gamification</td>
                  <td className="p-4 text-body">⭐⭐⭐⭐⭐ Série quotidienne, leagues</td>
                  <td className="p-4 text-body">⭐⭐⭐⭐ Stats de lecture, badges</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-4 text-body">👤 Niveau recommandé</td>
                  <td className="p-4 text-body">Débutant à intermédiaire (A1-B1)</td>
                  <td className="p-4 text-body">Intermédiaire avancé (B2-C2)</td>
                </tr>
                <tr className="border-b border-border bg-muted/20">
                  <td className="p-4 text-body">💰 Prix gratuit</td>
                  <td className="p-4 text-body">Très généreux, presque tout accessible</td>
                  <td className="p-4 text-body">Catalogue complet de classiques</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-4 text-body">💎 Premium</td>
                  <td className="p-4 text-body">Super Duolingo : 6,99€/mois</td>
                  <td className="p-4 text-body">VREAD Premium : 29€ à vie (offre lancement)</td>
                </tr>
                <tr className="border-b border-border bg-muted/20">
                  <td className="p-4 text-body">📱 Disponibilité</td>
                  <td className="p-4 text-body">iOS, Android, Web</td>
                  <td className="p-4 text-body">iOS, Web</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-4 text-body">🌍 Langues disponibles</td>
                  <td className="p-4 text-body">40+ langues</td>
                  <td className="p-4 text-body">Français uniquement (focus spécialisé)</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {[
              { label: "🎯 Focus principal", duolingo: "Vocabulaire + Grammaire", vread: "Lecture + Compréhension" },
              { label: "📚 Type de contenu", duolingo: "Exercices courts (5-10 min)", vread: "Livres complets (romans, classiques)" },
              { label: "🎮 Gamification", duolingo: "⭐⭐⭐⭐⭐ Série quotidienne, leagues", vread: "⭐⭐⭐⭐ Stats de lecture, badges" },
              { label: "👤 Niveau recommandé", duolingo: "Débutant à intermédiaire (A1-B1)", vread: "Intermédiaire avancé (B2-C2)" },
              { label: "💰 Prix gratuit", duolingo: "Très généreux, presque tout accessible", vread: "Catalogue complet de classiques" },
              { label: "💎 Premium", duolingo: "Super Duolingo : 6,99€/mois", vread: "VREAD Premium : 29€ à vie (offre lancement)" },
              { label: "📱 Disponibilité", duolingo: "iOS, Android, Web", vread: "iOS, Web" },
              { label: "🌍 Langues disponibles", duolingo: "40+ langues", vread: "Français uniquement (focus spécialisé)" },
            ].map((row, idx) => (
              <Card key={idx}>
                <CardContent className="p-4">
                  <h3 className="text-body font-semibold mb-3">{row.label}</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-body-sm font-medium text-muted-foreground">Duolingo</p>
                      <p className="text-body">{row.duolingo}</p>
                    </div>
                    <div>
                      <p className="text-body-sm font-medium text-muted-foreground">VREAD</p>
                      <p className="text-body">{row.vread}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Duolingo Section */}
        <section className="mb-16">
          <h2 className="text-h2 font-serif text-foreground mb-6">Duolingo : Pourquoi c'est excellent</h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-body mb-6">
              Duolingo est l'application d'apprentissage des langues la plus populaire au monde, avec plus de 500 millions d'utilisateurs. Et pour cause :
            </p>
            
            <div className="space-y-6 mb-8">
              <div>
                <h3 className="text-h4 font-sans font-semibold text-foreground mb-2">
                  ✅ Parfait pour débuter
                </h3>
                <p className="text-body text-muted-foreground">
                  Si vous n'avez jamais appris le français, Duolingo vous prend par la main avec des exercices progressifs adaptés aux débutants.
                </p>
              </div>

              <div>
                <h3 className="text-h4 font-sans font-semibold text-foreground mb-2">
                  ✅ Gamification addictive
                </h3>
                <p className="text-body text-muted-foreground">
                  Le système de séries quotidiennes (streaks), les leagues et les XP rendent l'apprentissage ludique et motivant.
                </p>
              </div>

              <div>
                <h3 className="text-h4 font-sans font-semibold text-foreground mb-2">
                  ✅ Vocabulaire structuré
                </h3>
                <p className="text-body text-muted-foreground">
                  Vous apprenez le vocabulaire de base dans des contextes simples et pratiques.
                </p>
              </div>

              <div>
                <h3 className="text-h4 font-sans font-semibold text-foreground mb-2">
                  ✅ Gratuit généreux
                </h3>
                <p className="text-body text-muted-foreground">
                  La version gratuite offre accès à presque tout le contenu. Le premium enlève juste les pubs et ajoute des vies illimitées.
                </p>
              </div>
            </div>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6">
                <h3 className="text-h4 font-sans font-semibold text-foreground mb-3">
                  Duolingo est idéal si :
                </h3>
                <ul className="space-y-2 text-body">
                  <li>• Vous débutez le français (niveau A1-A2)</li>
                  <li>• Vous voulez apprendre du vocabulaire quotidien</li>
                  <li>• Vous aimez les exercices courts et gamifiés</li>
                  <li>• Vous apprenez plusieurs langues</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* VREAD Section */}
        <section className="mb-16">
          <h2 className="text-h2 font-serif text-foreground mb-6">VREAD : Une approche complémentaire</h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-body mb-6">
              VREAD prend une approche différente : l'apprentissage par la lecture immersive.
            </p>
            
            <div className="space-y-6 mb-8">
              <div>
                <h3 className="text-h4 font-sans font-semibold text-foreground mb-2">
                  ✅ Vraie littérature
                </h3>
                <p className="text-body text-muted-foreground">
                  Lisez de vrais livres français (Molière, Hugo, Verne, Dumas) et des romans contemporains, pas des exercices artificiels.
                </p>
              </div>

              <div>
                <h3 className="text-h4 font-sans font-semibold text-foreground mb-2">
                  ✅ Compréhension contextuelle
                </h3>
                <p className="text-body text-muted-foreground">
                  Après chaque chapitre, validez votre compréhension avec des questions tirées du texte. Vous ne lisez pas "en pilote automatique".
                </p>
              </div>

              <div>
                <h3 className="text-h4 font-sans font-semibold text-foreground mb-2">
                  ✅ Culture française
                </h3>
                <p className="text-body text-muted-foreground">
                  En lisant la littérature française, vous découvrez la culture, l'histoire et les références culturelles que tout francophone connaît.
                </p>
              </div>

              <div>
                <h3 className="text-h4 font-sans font-semibold text-foreground mb-2">
                  ✅ Stats motivantes
                </h3>
                <p className="text-body text-muted-foreground">
                  Suivez vos pages lues, votre taux de compréhension, vos séries de lecture, comme sur une app de sport.
                </p>
              </div>

              <div>
                <h3 className="text-h4 font-sans font-semibold text-foreground mb-2">
                  ✅ Demandez n'importe quel livre
                </h3>
                <p className="text-body text-muted-foreground">
                  Avec Premium, demandez l'ajout de n'importe quel livre français (ajouté en 48h).
                </p>
              </div>
            </div>

            <Card className="bg-secondary/10 border-secondary/30">
              <CardContent className="p-6">
                <h3 className="text-h4 font-sans font-semibold text-foreground mb-3">
                  VREAD est idéal si :
                </h3>
                <ul className="space-y-2 text-body">
                  <li>• Vous avez déjà un niveau B2+ en français</li>
                  <li>• Vous voulez lire de vrais livres, pas juste des exercices</li>
                  <li>• Vous cherchez à comprendre la culture française en profondeur</li>
                  <li>• Vous aimez suivre votre progression comme sur Strava</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Recommendation Section */}
        <section className="mb-16">
          <Card className="bg-accent/10 border-accent/30">
            <CardContent className="p-8">
              <h2 className="text-h2 font-serif text-foreground mb-6">
                Notre recommandation : Utilisez les deux !
              </h2>
              <p className="text-body mb-6">
                VREAD et Duolingo ne sont pas concurrents, ils sont <strong>complémentaires</strong> :
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-h4 font-sans font-semibold text-foreground mb-3">
                      🏃 Le matin : Duolingo (15 min)
                    </h3>
                    <ul className="space-y-2 text-body">
                      <li>• Révisez votre vocabulaire</li>
                      <li>• Faites vos exercices de grammaire</li>
                      <li>• Maintenez votre série quotidienne</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-h4 font-sans font-semibold text-foreground mb-3">
                      📚 Le soir : VREAD (30 min)
                    </h3>
                    <ul className="space-y-2 text-body">
                      <li>• Lisez un chapitre de votre livre en cours</li>
                      <li>• Validez votre compréhension</li>
                      <li>• Progressez dans la vraie littérature française</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <p className="text-h4 font-sans font-semibold text-foreground">
                <strong>Résultat :</strong> Une progression rapide et complète en français, avec à la fois les bases solides (Duolingo) et la pratique immersive (VREAD).
              </p>
            </CardContent>
          </Card>
        </section>

        {/* FAQ Section */}
        <section className="mb-16">
          <h2 className="text-h2 font-serif text-foreground mb-6">Questions fréquentes</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-left text-body font-semibold">
                VREAD peut-il remplacer Duolingo ?
              </AccordionTrigger>
              <AccordionContent className="text-body text-muted-foreground">
                Non, ils servent des objectifs différents. Duolingo est excellent pour le vocabulaire de base et la grammaire. VREAD se concentre sur la lecture et la compréhension de textes authentiques.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left text-body font-semibold">
                Peut-on utiliser VREAD en tant que débutant ?
              </AccordionTrigger>
              <AccordionContent className="text-body text-muted-foreground">
                VREAD est optimisé pour les niveaux B2 et plus. Si vous êtes débutant (A1-A2), nous vous recommandons de commencer par Duolingo pendant 6-12 mois, puis d'ajouter VREAD quand vous serez à l'aise avec les bases.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left text-body font-semibold">
                Lequel est le meilleur pour passer le DELF/DALF ?
              </AccordionTrigger>
              <AccordionContent className="text-body text-muted-foreground">
                Pour le DELF B1-B2 : Duolingo + VREAD. Pour le DALF C1-C2 : VREAD est plus adapté car vous devez lire des textes complexes.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* CTA Section */}
        <section className="text-center mb-16">
          <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="p-12">
              <h2 className="text-h2 font-serif text-foreground mb-4">
                Prêt à commencer avec VREAD ?
              </h2>
              <p className="text-body text-muted-foreground mb-8">
                Gratuit • iPhone & Web • Catalogue de classiques inclus
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="text-body">
                  <Link to="/auth">Essayer VREAD gratuitement</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-body">
                  <Link to="/a-propos">En savoir plus sur VREAD</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Footer Disclaimer */}
        <footer className="border-t border-border pt-8">
          <p className="text-caption text-muted-foreground">
            Cette page a été créée à titre informatif. Duolingo® est une marque déposée de Duolingo Inc. VREAD n'est pas affilié, associé, autorisé, approuvé par, ou de quelque manière que ce soit officiellement lié à Duolingo Inc.
          </p>
        </footer>
      </article>
    </PublicLayout>
  );
}
