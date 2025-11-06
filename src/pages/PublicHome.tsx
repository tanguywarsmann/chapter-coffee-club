import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Trophy, TrendingUp, Sparkles, ArrowRight } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "@/i18n/LanguageContext";

export default function PublicHome() {
  const { t } = useTranslation();

  const features = [
    {
      icon: BookOpen,
      title: t.publicHome.features.progressive.title,
      description: t.publicHome.features.progressive.description
    },
    {
      icon: Users,
      title: t.publicHome.features.community.title,
      description: t.publicHome.features.community.description
    },
    {
      icon: Trophy,
      title: t.publicHome.features.achievements.title,
      description: t.publicHome.features.achievements.description
    },
    {
      icon: TrendingUp,
      title: t.publicHome.features.statistics.title,
      description: t.publicHome.features.statistics.description
    }
  ];

  return (
    <>
      <Helmet>
        <title>VREAD — L'appli qui t'accompagne dans ta lecture, page après page</title>
        <meta name="description" content="VREAD vous aide à reprendre goût à la lecture avec une approche progressive. Découvrez des livres classiques, suivez vos progrès et rejoignez une communauté de lecteurs passionnés." />
        <meta property="og:title" content="VREAD — L'appli qui t'accompagne dans ta lecture, page après page" />
        <meta property="og:description" content="VREAD vous aide à reprendre goût à la lecture avec une approche progressive. Découvrez des livres classiques, suivez vos progrès et rejoignez une communauté de lecteurs passionnés." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.vread.fr/" />
        <meta property="og:image" content="/branding/vread-logo-512.png" />
        <meta property="og:site_name" content="VREAD" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="VREAD — L'appli qui t'accompagne dans ta lecture, page après page" />
        <meta name="twitter:description" content="VREAD vous aide à reprendre goût à la lecture avec une approche progressive." />
        <link rel="canonical" href="https://www.vread.fr/" />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "VREAD",
            "description": "Application pour reprendre goût à la lecture avec une approche progressive",
            "url": "https://www.vread.fr",
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

      <div className="min-h-screen bg-gradient-to-br from-brand-600 via-brand-500 to-brand-600">
        {/* Hero Section Premium */}
        <section className="relative py-24 md:py-32 px-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700" />

          <div className="relative max-w-6xl mx-auto text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-body-sm font-medium animate-fade-in">
              <Sparkles className="h-4 w-4" />
              Le Strava de la lecture
            </div>

            {/* Titre avec gradient text */}
            <h1 className="text-display font-serif text-white max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: '100ms' }}>
              L'appli qui t'accompagne
              <br />
              <span className="bg-gradient-to-r from-brand-100 to-white bg-clip-text text-transparent">
                dans ta lecture
              </span>
              <br />
              page après page
            </h1>

            {/* Description courte */}
            <p className="text-body-lg text-white/90 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '200ms' }}>
              Relevez des défis, suivez vos progrès, lisez à votre rythme.
            </p>

            {/* CTAs hiérarchisés */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in" style={{ animationDelay: '300ms' }}>
              <Button
                size="lg"
                className="relative group bg-white text-brand-700 hover:bg-brand-50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 min-w-[240px]"
                asChild
              >
                <Link to="/auth">
                  <span className="relative z-10">Commencer gratuitement</span>
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>

              <Button
                size="lg"
                variant="ghost"
                className="border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 min-w-[240px]"
                asChild
              >
                <Link to="/blog">Découvrir le blog</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24 px-6 bg-white/10 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-h1 font-serif font-bold text-center text-white mb-16">
              Une nouvelle façon de lire
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="relative group bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />

                  <CardHeader className="relative text-center pb-4">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                      <feature.icon className="h-7 w-7 text-brand-700" />
                    </div>
                    <CardTitle className="text-h3 text-white">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="relative">
                    <CardDescription className="text-body text-white/80 text-center leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 px-6">
          <div className="max-w-6xl mx-auto text-center space-y-6">
            <h2 className="text-h1 font-serif font-bold text-white">
              Prêt à recommencer à lire ?
            </h2>
            <p className="text-body-lg text-white/90 max-w-2xl mx-auto leading-relaxed">
              Rejoignez des milliers de lecteurs qui ont redécouvert le plaisir de la lecture.
            </p>
            <div className="pt-4">
              <Button
                size="lg"
                className="bg-white text-brand-700 hover:bg-brand-50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 min-w-[280px]"
                asChild
              >
                <Link to="/auth">Créer mon compte gratuit</Link>
              </Button>
            </div>
            <p className="text-body-sm text-white/70 pt-2">
              Gratuit • Sans engagement • Sans carte bancaire
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
