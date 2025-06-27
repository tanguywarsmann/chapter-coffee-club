
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Trophy, TrendingUp } from "lucide-react";
import { Helmet } from "react-helmet-async";

export default function PublicHome() {
  const features = [
    {
      icon: BookOpen,
      title: "Lecture progressive",
      description: "Reprenez goût à la lecture avec des segments courts et des validations régulières."
    },
    {
      icon: Users,
      title: "Communauté",
      description: "Rejoignez une communauté de lecteurs passionnés et partagez vos découvertes."
    },
    {
      icon: Trophy,
      title: "Accomplissements",
      description: "Débloquez des badges et suivez vos progrès de lecture au fil du temps."
    },
    {
      icon: TrendingUp,
      title: "Statistiques",
      description: "Analysez vos habitudes de lecture et visualisez votre évolution."
    }
  ];

  return (
    <>
      <Helmet>
        <title>READ — Reprends goût à la lecture, page après page</title>
        <meta name="description" content="READ vous aide à reprendre goût à la lecture avec une approche progressive. Découvrez des livres classiques, suivez vos progrès et rejoignez une communauté de lecteurs passionnés." />
        <meta property="og:title" content="READ — Reprends goût à la lecture, page après page" />
        <meta property="og:description" content="READ vous aide à reprendre goût à la lecture avec une approche progressive. Découvrez des livres classiques, suivez vos progrès et rejoignez une communauté de lecteurs passionnés." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://vread.fr/" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="READ — Reprends goût à la lecture, page après page" />
        <meta name="twitter:description" content="READ vous aide à reprendre goût à la lecture avec une approche progressive." />
        <link rel="canonical" href="https://vread.fr/" />
        
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "READ",
            "description": "Application pour reprendre goût à la lecture avec une approche progressive",
            "url": "https://vread.fr",
            "applicationCategory": "EducationalApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "EUR"
            }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-logo-background via-logo-background to-coffee-light">
        {/* Hero Section */}
        <section className="relative py-20 px-4">
          <div className="container mx-auto text-center max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6">
              Reprends goût à la lecture,<br />
              <span className="text-logo-accent">page après page</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
              READ transforme la lecture en une expérience progressive et gratifiante. 
              Redécouvrez les classiques littéraires avec une approche moderne.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-logo-accent hover:bg-logo-accent/90 text-logo-background font-semibold" asChild>
                <Link to="/auth">Commencer à lire</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-logo-background" asChild>
                <Link to="/blog">Découvrir le blog</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4 bg-white/5 backdrop-blur">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-serif font-bold text-center text-white mb-12">
              Une nouvelle façon de lire
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="bg-white/10 border-white/20 backdrop-blur">
                  <CardHeader className="text-center">
                    <feature.icon className="h-12 w-12 text-logo-accent mx-auto mb-4" />
                    <CardTitle className="text-white">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-white/80 text-center">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto text-center max-w-3xl">
            <h2 className="text-3xl font-serif font-bold text-white mb-6">
              Prêt à recommencer à lire ?
            </h2>
            <p className="text-lg text-white/90 mb-8">
              Rejoignez des milliers de lecteurs qui ont redécouvert le plaisir de la lecture avec READ.
            </p>
            <Button size="lg" className="bg-logo-accent hover:bg-logo-accent/90 text-logo-background font-semibold" asChild>
              <Link to="/auth">Créer mon compte gratuit</Link>
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
