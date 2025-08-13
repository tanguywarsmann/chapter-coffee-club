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
import LogoVreadPng from "@/components/brand/LogoVreadPng";

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
          VREAD — L'appli qui t'accompagne dans ta lecture, page après page
        </title>
        <meta
          name="description"
          content="VREAD vous aide à reprendre goût à la lecture avec une approche progressive. Découvrez des livres classiques, suivez vos progrès et rejoignez une communauté de lecteurs passionnés."
        />
        <meta
          property="og:title"
          content="VREAD — L'appli qui t'accompagne dans ta lecture, page après page"
        />
        <meta
          property="og:description"
          content="VREAD vous aide à reprendre goût à la lecture avec une approche progressive. Découvrez des livres classiques, suivez vos progrès et rejoignez une communauté de lecteurs passionnés."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.vread.fr/landing" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="VREAD — L'appli qui t'accompagne dans ta lecture, page après page"
        />
        <meta
          name="twitter:description"
          content="VREAD vous aide à reprendre goût à la lecture avec une approche progressive."
        />
        <link rel="canonical" href="https://www.vread.fr/landing" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-reed-primary via-reed-primary to-reed-secondary">
        {/* Hero Section */}
        <section className="relative py-20 px-4" role="banner">
          <div className="mx-auto flex max-w-screen-xl flex-col items-center gap-12 px-4 text-center">
            <div className="mb-12 flex justify-center">
              <div className="p-8 rounded-3xl shadow-2xl border-4 border-[#EEDCC8] bg-transparent">
                <LogoVreadPng size={96} className="h-24 w-24" />
              </div>
            </div>

            <h1 className="hero-title mb-8 font-serif font-bold leading-tight text-white sm:text-6xl md:text-7xl lg:text-8xl">
              L'appli qui <span className="whitespace-nowrap">t'accompagne</span>
              <br /> dans ta lecture,
              <br /> <span className="text-reed-light">page après page</span>
            </h1>

            <p className="mx-auto mb-12 max-w-3xl text-lg font-light leading-relaxed text-white/95 md:text-2xl">
              Relevez des défis, suivez vos progrès, lisez à votre rythme. Redécouvrez
              le plaisir de la lecture avec une approche moderne et bienveillante.
            </p>

            <div
              className="mb-16 flex flex-col gap-6 sm:flex-row sm:justify-center"
              role="group"
              aria-label="Actions principales"
            >
              <Button
                size="lg"
                className="bg-reed-light px-12 py-6 text-xl font-bold text-reed-darker shadow-xl transition-all duration-300 hover:scale-105 hover:bg-reed-secondary hover:shadow-2xl focus:ring-4 focus:ring-reed-light/50 focus:ring-offset-2 focus:ring-offset-reed-primary"
                asChild
              >
                <Link to="/auth" aria-label="Commencer votre parcours de lecture avec read">
                  Commencer
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-3 border-white px-12 py-6 text-xl font-bold text-white transition-all duration-300 hover:scale-105 hover:bg-white hover:text-reed-primary focus:ring-4 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-reed-primary"
                asChild
              >
                <Link to="/blog" aria-label="Découvrir le blog VREAD">
                  Découvrir le blog
                </Link>
              </Button>
            </div>

            <ArrowDown
              className="h-8 w-8 animate-bounce text-white/70"
              aria-hidden="true"
            />
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-white/15 backdrop-blur-sm py-20 px-4">
          <div className="mx-auto w-full max-w-screen-xl px-4 text-center">
            <header className="mb-16 space-y-6">
              <h2 className="text-4xl font-serif font-bold text-white md:text-5xl">
                Une nouvelle façon de lire
              </h2>
              <p className="mx-auto max-w-4xl text-xl text-white/90">
                VREAD transforme votre expérience de lecture en un parcours engageant et personnalisé
              </p>
            </header>

            <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2 lg:grid-cols-4" role="list">
              {features.map(({ icon: Icon, title, description }, i) => (
                <Card
                  key={i}
                  className="bg-white/20 backdrop-blur-md shadow-xl transition-all duration-300 hover:scale-105 hover:bg-white/25 focus-within:ring-2 focus-within:ring-white/50"
                  role="listitem"
                >
                  <CardHeader className="pb-6 text-center">
                    <div className="mb-6 flex justify-center">
                      <div className="bg-reed-light/20 rounded-full p-4">
                        <Icon className="h-12 w-12 text-reed-light" aria-hidden="true" />
                      </div>
                    </div>
                    <CardTitle className="text-xl font-semibold text-white">
                      {title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed text-white/95">
                      {description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4" role="region" aria-labelledby="cta-heading">
          <div className="mx-auto flex max-w-screen-md flex-col items-center gap-12 px-4 text-center">
            <div>
              <h2
                id="cta-heading"
                className="mb-8 font-serif text-4xl font-bold text-white md:text-5xl"
              >
                Prêt à recommencer à lire ?
              </h2>
              <p className="mx-auto max-w-2xl text-xl font-light leading-relaxed text-white/95 md:text-2xl">
                Rejoignez des milliers de lecteurs qui ont redécouvert le plaisir de la lecture avec read.
              </p>
            </div>

            <Button
              size="lg"
              className="bg-reed-light px-12 py-6 text-xl font-bold text-reed-darker shadow-xl transition-all duration-300 hover:scale-105 hover:bg-reed-secondary hover:shadow-2xl focus:ring-4 focus:ring-reed-light/50 focus:ring-offset-2 focus:ring-offset-reed-primary"
              asChild
            >
                <Link to="/auth" aria-label="Créer votre compte VREAD gratuit maintenant">
                  Créer mon compte gratuit
                </Link>
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
