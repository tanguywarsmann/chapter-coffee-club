import AppFooter from "@/components/layout/AppFooter";
import { SEOHead } from "@/components/seo/SEOHead";
import { Link } from "react-router-dom";

export default function About() {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "VREAD",
    "url": "https://www.vread.fr/",
    "logo": "https://www.vread.fr/branding/vread-logo-512.png",
    "description": "VREAD est la première application qui gamifie la lecture de vrais livres grâce à un système de segments, de validation par question et de progression type Strava.",
    "foundingDate": "2024",
    "sameAs": [
      "https://apps.apple.com/fr/app/v-read/id6752836822",
      "https://play.google.com/store/apps/details?id=com.vread.app"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "contact@vread.fr",
      "contactType": "customer support",
      "availableLanguage": ["French", "English"]
    }
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://www.vread.fr/" },
      { "@type": "ListItem", "position": 2, "name": "À propos", "item": "https://www.vread.fr/a-propos" }
    ]
  };

  return (
    <div className="flex flex-col min-h-screen">
      <SEOHead
        title="VREAD · À propos — L'application qui transforme votre lecture"
        description="Découvrez VREAD, l'application révolutionnaire qui gamifie votre lecture grâce à des questions IA, un système de progression motivant et une communauté de lecteurs passionnés. Transformez chaque page en succès !"
        canonical="https://www.vread.fr/a-propos"
        tags={["lecture", "application", "motivation", "communauté", "livres", "gamification"]}
      />

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <main className="container mx-auto px-4 py-10 max-w-4xl flex-1">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted-foreground mb-8" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-foreground transition-colors">Accueil</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">À propos</span>
        </nav>

        <article className="prose prose-neutral max-w-none">
          <h1 className="text-4xl font-bold mb-6">VREAD : Révolutionnez votre façon de lire</h1>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">Notre mission</h2>
            <p className="text-lg leading-relaxed text-muted-foreground">
              VREAD est né d'un constat simple : beaucoup de gens veulent lire plus, mais abandonnent faute de suivi et de motivation. 
              Nous avons créé VREAD pour transformer la lecture en une habitude durable, en appliquant les mécanismes qui ont fait le succès 
              des applications de sport comme Strava : <strong>tracking, progression visible, validation et gamification</strong>.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">Comment ça marche ?</h2>
            <p className="text-muted-foreground mb-4">
              VREAD découpe chaque livre en <strong>segments</strong> (environ 30 pages chacun). À la fin de chaque segment, 
              vous répondez à une question tirée du texte — en un mot — pour valider votre compréhension. 
              C'est un checkpoint, pas un examen.
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li>📖 <strong>Lisez sur votre support préféré</strong> — papier, liseuse, audio. VREAD ne remplace pas le livre.</li>
              <li>✅ <strong>Validez votre lecture</strong> — une question par segment, réponse en un mot.</li>
              <li>📊 <strong>Suivez votre progression</strong> — pages lues, séries, taux de compréhension.</li>
              <li>🏆 <strong>Gagnez des badges et XP</strong> — débloquez des accomplissements à chaque étape.</li>
              <li>👥 <strong>Rejoignez une communauté</strong> — partagez vos lectures, suivez vos amis.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">Pourquoi VREAD ?</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-muted/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">🎯 Motivation durable</h3>
                <p className="text-muted-foreground text-sm">
                  Les séries quotidiennes et les badges créent une boucle de motivation qui vous pousse à lire régulièrement.
                </p>
              </div>
              <div className="bg-muted/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">📈 Progression visible</h3>
                <p className="text-muted-foreground text-sm">
                  Voyez concrètement combien de pages vous lisez par semaine, par mois. Ce qui est mesuré est amélioré.
                </p>
              </div>
              <div className="bg-muted/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">🧠 Compréhension validée</h3>
                <p className="text-muted-foreground text-sm">
                  Les questions de validation vous empêchent de lire en "pilote automatique" et ancrent la lecture en mémoire.
                </p>
              </div>
              <div className="bg-muted/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">📚 Vraie littérature</h3>
                <p className="text-muted-foreground text-sm">
                  Lisez de vrais livres — classiques français et romans contemporains — pas des résumés ou des exercices artificiels.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">Disponibilité</h2>
            <p className="text-muted-foreground">
              VREAD est disponible sur <strong>iPhone</strong> (App Store), <strong>Android</strong> (Google Play) et en <strong>web-app</strong> sur vread.fr. 
              La version gratuite donne accès à un catalogue complet de classiques. 
              VREAD Premium débloque des fonctionnalités avancées et la demande de livres personnalisés.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">Contact</h2>
            <p className="text-muted-foreground">
              Pour toute question, suggestion ou partenariat : <a href="mailto:contact@vread.fr" className="text-primary hover:underline">contact@vread.fr</a>
            </p>
          </section>

          <div className="bg-primary text-primary-foreground p-8 rounded-lg text-center mt-12">
            <h3 className="text-2xl font-bold mb-4">Prêt à transformer votre lecture ?</h3>
            <p className="mb-6 text-lg opacity-90">
              Rejoignez des milliers de lecteurs qui ont déjà révolutionné leurs habitudes de lecture avec VREAD.
            </p>
            <Link
              to="/auth"
              onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}
              className="inline-block bg-white text-primary hover:bg-white/90 px-8 py-4 rounded-lg font-bold text-lg transition-colors shadow-lg"
            >
              Créer mon compte gratuitement
            </Link>
          </div>
        </article>
      </main>

      <AppFooter />
    </div>
  );
}
