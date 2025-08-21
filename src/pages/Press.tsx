import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { PublicLayout } from "@/components/layout/PublicLayout";

export default function Press() {
  return (
    <PublicLayout>
      <Helmet>
        <title>Presse | VREAD</title>
        <meta name="description" content="Espace presse VREAD : kit média, logos, visuels, contacts et communiqués." />
        <link rel="canonical" href="https://www.vread.fr/presse" />
        <meta property="og:title" content="Presse | VREAD" />
        <meta property="og:url" content="https://www.vread.fr/presse" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "VREAD",
            "url": "https://www.vread.fr/"
          })}
        </script>
      </Helmet>

      <main className="container mx-auto px-4 py-10 max-w-4xl">
        <div className="prose prose-neutral max-w-none">
          <h1 className="text-h1 text-logo-accent mb-6">VREAD - Espace presse et médias</h1>
          
          <p className="text-body-lg mb-8">
            VREAD est l'application française qui accompagne les lecteurs page après page dans leur parcours littéraire. Nous transformons la lecture en une expérience sociale et motivante grâce à notre plateforme innovante de gamification de la lecture.
          </p>
          
          <h2 className="text-h2 text-foreground mb-4 mt-8">En bref</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
            <div className="bg-muted p-6 rounded-lg text-center">
              <div className="text-3xl font-bold text-logo-accent mb-2">2024</div>
              <div className="text-sm text-muted-foreground">Année de lancement</div>
            </div>
            <div className="bg-muted p-6 rounded-lg text-center">
              <div className="text-3xl font-bold text-logo-accent mb-2">100%</div>
              <div className="text-sm text-muted-foreground">Français</div>
            </div>
            <div className="bg-muted p-6 rounded-lg text-center">
              <div className="text-3xl font-bold text-logo-accent mb-2">Web</div>
              <div className="text-sm text-muted-foreground">Plateforme</div>
            </div>
          </div>
          
          <h2 className="text-h2 text-foreground mb-4 mt-8">Notre proposition unique</h2>
          <ul className="list-disc list-inside space-y-2 mb-6">
            <li>
              <strong>Gamification de la lecture :</strong> Badges, défis et progression pour motiver les lecteurs
            </li>
            <li>
              <strong>Communauté engagée :</strong> Partage d'expériences et découvertes entre lecteurs
            </li>
            <li>
              <strong>Accompagnement personnalisé :</strong> Suivi des progrès et recommandations adaptées
            </li>
            <li>
              <strong>Accessibilité :</strong> Interface simple et intuitive pour tous les niveaux de lecture
            </li>
          </ul>
          
          <h2 className="text-h2 text-foreground mb-4 mt-8">Kit média</h2>
          <div className="bg-muted p-6 rounded-lg mb-6">
            <strong className="block mb-4">Logos et visuels :</strong>
            <div className="space-y-2">
              <a 
                href="/branding/vread-logo.svg" 
                className="block text-logo-accent hover:underline"
                download
              >
                Logo VREAD (SVG)
              </a>
              <a 
                href="/branding/vread-logo-192.png" 
                className="block text-logo-accent hover:underline"
                download
              >
                Logo VREAD (PNG 192px)
              </a>
              <a 
                href="/branding/vread-logo-512.png" 
                className="block text-logo-accent hover:underline"
                download
              >
                Logo VREAD (PNG 512px)
              </a>
              <a 
                href="/branding/vread-logo-1024-q80.webp" 
                className="block text-logo-accent hover:underline"
                download
              >
                Logo VREAD (WebP 1024px)
              </a>
            </div>
          </div>
          
          <h2 className="text-h2 text-foreground mb-4 mt-8">Contact presse</h2>
          <p className="text-body mb-2">
            Pour toute demande d'interview, information complémentaire ou collaboration média, contactez-nous :
          </p>
          <p className="text-body mb-6">
            <strong>Email :</strong> contact@vread.fr
          </p>
          
          <h2 className="text-h2 text-foreground mb-4 mt-8">Communiqués récents</h2>
          <p className="text-body mb-8">
            Consultez notre <Link to="/blog" className="text-logo-accent hover:underline">blog</Link> pour les dernières actualités et annonces de VREAD.
          </p>
          
          <Link 
            to="/auth" 
            className="inline-block bg-logo-accent hover:bg-logo-accent-dark text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Découvrir VREAD
          </Link>
        </div>
      </main>
    </PublicLayout>
  );
}