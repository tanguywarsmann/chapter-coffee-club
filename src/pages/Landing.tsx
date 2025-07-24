import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BookOpen,
  Users,
  Trophy,
  TrendingUp,
  ArrowDown,
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import Image from "@/components/ui/image";

export default function Landing() {
  const features = [
    {
      icon: BookOpen,
      title: "Lecture progressive",
      description:
        "Reprenez goût à la lecture avec des segments courts et des validations régulières.",
    },
    {
      icon: Users,
      title: "Communauté",
      description:
        "Rejoignez une communauté de lecteurs passionnés et partagez vos découvertes.",
    },
    {
      icon: Trophy,
      title: "Accomplissements",
      description:
        "Débloquez des badges et suivez vos progrès de lecture au fil du temps.",
    },
    {
      icon: TrendingUp,
      title: "Statistiques",
      description:
        "Analysez vos habitudes de lecture et visualisez votre évolution.",
    },
  ];

  return (
    <>
      <Helmet>
        <title>
          READ — L'appli qui t'accompagne dans ta lecture, page après page
        </title>
        <meta
          name="description"
          content="READ vous aide à reprendre goût à la lecture avec une approche progressive. Découvrez des livres classiques, suivez vos progrès et rejoignez une communauté de lecteurs passionnés."
        />
        <meta
          property="og:title"
          content="READ — L'appli qui t'accompagne dans ta lecture, page après page"
        />
        <meta
          property="og:description"
          content="READ vous aide à reprendre goût à la lecture avec une approche progressive. Découvrez des livres classiques, suivez vos progrès et rejoignez une communauté de lecteurs passionnés."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://vread.fr/landing" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="READ — L'appli qui t'accompagne dans ta lecture, page après page"
        />
        <meta
          name="twitter:description"
          content="READ vous aide à reprendre goût à la lecture avec une approche progressive."
        />
        <link rel="canonical" href="https://vread.fr/landing" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-reed-primary via-reed-primary to-reed-secondary">
        {/* Hero Section */}
        <section className="relative py-20 px-4" role="banner">
          {/* WRAPPER CENTRÉ */}
          <div className="mx-auto max-w-5xl px-4 text-center">
            {/* Logo */}
            <div className="mb-12 flex justify-center">
              <div className="bg-reed-primary/80 p-8 rounded-3xl shadow-2xl border-4 border-reed-light/30">
                <Image
                  src="/READ-logo.png"
                  alt="READ - Application de lecture progressive"
                  className="h-24 w-24 mx-auto"
                  priority={true}
                />
              </div>
            </div>

            <h1 className="hero-title text-5xl md:text-7xl font-serif font-bold text-white mb-8 leading-tight">
              L'appli qui <span className="whitespace-nowrap">t'accompagne</span>
              <br />
              dans ta lecture,
              <br />
              <span className="text-reed-light">page après page</span>
            </h1>

            <p className="text-xl md:text-2xl text-white/95 mb-12 leading-relaxed font-light mx-auto max-w-3xl">
              Relevez des défis, suivez vos progrès, lisez à votre rythme. Redécouvrez
              le plaisir de la lecture avec une approche moderne et bienveillante.
            </p>

            <div
              className="flex flex-col sm:flex-row gap-6 justify-center mb-16"
              role="group"
              aria-label="Actions principales"
            >
              <Button
                size="lg"
                className="bg-reed-light hover:bg-reed-secondary text-reed-darker font-bold text-xl px-12 py-6 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 transform focus:ring-4 focus:ring-reed-light/50 focus:ring-offset-2 focus:ring-offset-reed-primary"
                asChild
              >
                <Link to="/auth" aria-label="Commencer votre parcours de lecture avec read">
                  Commencer
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-3 border-white text-white hover:bg-white hover:text-reed-primary font-bold text-xl px-12 py-6 rounded-full transition-all duration-300 hover:scale-105 transform focus:ring-4 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-reed-primary"
                asChild
              >
                <Link to="/blog" aria-label="Découvrir le blog READ">
                  Découvrir le blog
                </Link>
              </Button>
            </div>

            {/* Scroll indicator */}
            <div className="flex justify-center" role="presentation">
              <ArrowDown className="h-8 w-8 text-white/70 animate-bounce" aria-hidden="true" />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 bg-white/15 backdrop-blur-sm">
          <div className="mx-auto max-w-6xl px-4 text-center">
            <header className="mb-16">
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">Une nouvelle façon de lire</h2>
              <p className="text-xl text-white/90 mx-auto max-w-3xl">
                READ transforme votre expérience de lecture en un parcours engageant et personnalisé
              </p>
            </header>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8" role="list">
              {features.map(({ icon: Icon, title, description }, index) => (
                <Card
                  key={index}
                  className="bg-white/20 border-white/40 backdrop-blur-md hover:bg-white/25 transition-all duration-300 hover:scale-105 transform shadow-xl focus-within:ring-2 focus-within:ring-white/50"
                  role="listitem"
                >
                  <CardHeader className="text-center pb-6">
                    <div className="mb-6 flex justify-center">
                      <div className="bg-reed-light/20 p-4 rounded-full" role="presentation">
                        <Icon className="h-12 w-12 text-reed-light" aria-hidden="true" />
                      </div>
                    </div>
                    <CardTitle className="text-white text-xl font-semibold">{title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-white/95 text-center leading-relaxed text-base mx-auto max-w-xs">
                      {description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Finale */}
        <section className="py-20 px-4" role="region" aria-labelledby="cta-heading">
          <div className="mx-auto max-w-5xl px-4 text-center">
            <h2 id="cta-heading" className="text-4xl md:text-5xl font-serif font-bold text-white mb-8">
              Prêt à recommencer à lire ?
            </h2>
            <p className="text-xl md:text-2xl text-white/95 mb-12 leading-relaxed font-light mx-auto max-w-3xl">
              Rejoignez des milliers de lecteurs qui ont redécouvert le plaisir de la lecture avec read.
            </p>
            <Button
              size="lg"
              className="bg-reed-light hover:bg-reed-secondary text-reed-darker font-bold text-xl px-12 py-6 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 transform focus:ring-4 focus:ring-reed-light/50 focus:ring-offset-2 focus:ring-offset-reed-primary"
              asChild
            >
              <Link to="/auth" aria-label="Créer votre compte READ gratuit maintenant">
                Créer mon compte gratuit
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
