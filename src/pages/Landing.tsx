import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, Users, Trophy } from "lucide-react";
import { Helmet } from "react-helmet-async";
import LogoVreadPng from "@/components/brand/LogoVreadPng";
import AppFooter from "@/components/layout/AppFooter";

export default function Landing() {
  const features = [
    {
      icon: BookOpen,
      title: "Segments validés",
      description: "Lis par étapes courtes. Valide chaque avancée.",
    },
    {
      icon: Trophy,
      title: "Récompenses",
      description: "Garde la motivation. Débloque des badges.",
    },
    {
      icon: Users,
      title: "Ensemble",
      description: "Partage tes progrès. Découvre des idées.",
    },
  ];

  return (
    <>
      <Helmet>
        <title>Vread — Si ce n'est pas sur Vread, tu ne l'as pas lu.</title>
        <meta
          name="description"
          content="Lis mieux, chaque jour. Segments de 10 000 mots, question de validation, preuves de lecture."
        />
        <meta property="og:title" content="Vread — Lis mieux, chaque jour" />
        <meta
          property="og:description"
          content="Segments, validations, récompenses. Ta lecture devient une habitude mesurable."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.vread.fr/" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Vread — Lis mieux, chaque jour" />
        <meta
          name="twitter:description"
          content="Segments, validations, récompenses. Ta lecture devient une habitude mesurable."
        />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-reed-primary via-reed-primary to-reed-secondary">
        {/* HERO */}
        <section className="relative px-4 py-20">
          <div className="mx-auto flex max-w-screen-xl flex-col items-center gap-10 text-center">
            <div className="flex justify-center">
              <div className="rounded-3xl border-4 border-[#EEDCC8] p-6 shadow-2xl">
                <LogoVreadPng size={96} className="h-20 w-20 sm:h-24 sm:w-24" />
              </div>
            </div>

            <h1 className="hero-title font-serif text-white sm:text-6xl md:text-7xl lg:text-8xl">
              Lis mieux, chaque jour
            </h1>
            <p className="max-w-2xl text-white/95 md:text-xl">
              Segments. Validation. Preuve de lecture. Vread transforme ta lecture en progrès concrets.
            </p>

            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:justify-center" role="group" aria-label="Actions principales">
              {/* Bouton plein crème */}
              <Button
                size="lg"
                className="bg-reed-light px-10 py-6 text-lg font-bold text-reed-darker shadow-xl transition-all duration-200 hover:scale-105 hover:bg-reed-secondary hover:text-white focus:ring-4 focus:ring-reed-light/50 focus:ring-offset-2 focus:ring-offset-reed-primary"
                asChild
              >
                <Link to="/auth" aria-label="Commencer avec Vread">Commencer</Link>
              </Button>

              {/* Bouton plein blanc (non transparent) */}
              <Button
                size="lg"
                className="bg-white px-10 py-6 text-lg font-bold text-reed-primary shadow-xl transition-all duration-200 hover:scale-105 hover:bg-reed-light hover:text-reed-darker focus:ring-4 focus:ring-white/60 focus:ring-offset-2 focus:ring-offset-reed-primary"
                asChild
              >
                <Link to="/blog" aria-label="Découvrir le blog Vread">Découvrir le blog</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* FEATURES */}
          <section className="px-4 py-16" role="region" aria-labelledby="cta-heading">
          <div className="mx-auto flex max-w-screen-md flex-col items-center gap-6 text-center">
            <h2 id="cta-heading" className="font-serif text-3xl font-bold text-white md:text-4xl">
              Si c'est pas sur Vread, tu ne l'as pas lu.
            </h2>

            <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3" role="list">
              {features.map(({ icon: Icon, title, description }, i) => (
                <Card
                  key={i}
                  className="bg-white/20 backdrop-blur-md shadow-xl transition-transform duration-200 hover:scale-[1.02] focus-within:ring-2 focus-within:ring-white/50"
                  role="listitem"
                >
                  <CardHeader className="pb-4">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-reed-light/20">
                      <Icon className="h-8 w-8 text-reed-light" aria-hidden="true" />
                    </div>
                    <CardTitle className="text-lg font-semibold text-white">{title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-foreground/95 text-base text-white/95">
                      {description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="px-4 py-16" role="region" aria-labelledby="cta-heading">
          <div className="mx-auto flex max-w-screen-md flex-col items-center gap-6 text-center">
            <h2 id="cta-heading" className="font-serif text-3xl font-bold text-white md:text-4xl">
              Prêt à démarrer ?
            </h2>
            <p className="max-w-xl text-white/90">
              Crée ton compte gratuit et reprends ta lecture avec des objectifs clairs.
            </p>
            <Button
              size="lg"
              className="bg-reed-light px-10 py-6 text-lg font-bold text-reed-darker shadow-xl transition-all duration-200 hover:scale-105 hover:bg-reed-secondary hover:text-white focus:ring-4 focus:ring-reed-light/50 focus:ring-offset-2 focus:ring-offset-reed-primary"
              asChild
            >
              <Link to="/auth" aria-label="Créer votre compte Vread gratuit maintenant">
                Créer mon compte gratuit
              </Link>
            </Button>
          </div>
        </section>
      </div>

      <AppFooter />
    </>
  );
}

