
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Trophy, TrendingUp, ArrowDown } from "lucide-react";
import { Helmet } from "react-helmet-async";

export default function Landing() {
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
        <title>READ — L'appli qui t'accompagne dans ta lecture, page après page</title>
        <meta name="description" content="READ vous aide à reprendre goût à la lecture avec une approche progressive. Découvrez des livres classiques, suivez vos progrès et rejoignez une communauté de lecteurs passionnés." />
        <meta property="og:title" content="READ — L'appli qui t'accompagne dans ta lecture, page après page" />
        <meta property="og:description" content="READ vous aide à reprendre goût à la lecture avec une approche progressive. Découvrez des livres classiques, suivez vos progrès et rejoignez une communauté de lecteurs passionnés." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://vread.fr/landing" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="READ — L'appli qui t'accompagne dans ta lecture, page après page" />
        <meta name="twitter:description" content="READ vous aide à reprendre goût à la lecture avec une approche progressive." />
        <link rel="canonical" href="https://vread.fr/landing" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-reed-primary via-reed-primary to-reed-secondary">
        {/* Hero Section avec Logo */}
        <section className="relative py-20 px-4">
          <div className="container mx-auto text-center max-w-5xl">
            {/* Logo READ mis en avant */}
            <div className="mb-12 flex justify-center">
              <div className="bg-reed-primary/80 p-8 rounded-3xl shadow-2xl border-4 border-reed-light/30">
                <img 
                  src="/READ-logo.png" 
                  alt="READ Logo" 
                  className="h-24 w-24 mx-auto"
                />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-8 leading-tight">
              L'appli qui t'accompagne<br />
              dans ta lecture,<br />
              <span className="text-reed-light">page après page</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/95 mb-12 leading-relaxed max-w-4xl mx-auto font-light">
              Relevez des défis, suivez vos progrès, lisez à votre rythme. 
              Redécouvrez le plaisir de la lecture avec une approche moderne et bienveillante.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Button 
                size="lg" 
                className="bg-reed-light hover:bg-reed-secondary text-reed-darker font-bold text-xl px-12 py-6 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 transform" 
                asChild
              >
                <Link to="/auth">Commencer</Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-3 border-white text-white hover:bg-white hover:text-reed-primary font-bold text-xl px-12 py-6 rounded-full transition-all duration-300 hover:scale-105 transform" 
                asChild
              >
                <Link to="/blog">Découvrir le blog</Link>
              </Button>
            </div>

            {/* Scroll indicator */}
            <div className="flex justify-center">
              <ArrowDown className="h-8 w-8 text-white/70 animate-bounce" />
            </div>
          </div>
        </section>

        {/* Features Section - Bloc secondaire avec visuel */}
        <section className="py-20 px-4 bg-white/15 backdrop-blur-sm">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">
                Une nouvelle façon de lire
              </h2>
              <p className="text-xl text-white/90 max-w-3xl mx-auto">
                READ transforme votre expérience de lecture en un parcours engageant et personnalisé
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="bg-white/20 border-white/40 backdrop-blur-md hover:bg-white/25 transition-all duration-300 hover:scale-105 transform shadow-xl">
                  <CardHeader className="text-center pb-6">
                    <div className="mb-6 flex justify-center">
                      <div className="bg-reed-light/20 p-4 rounded-full">
                        <feature.icon className="h-12 w-12 text-reed-light" />
                      </div>
                    </div>
                    <CardTitle className="text-white text-xl font-semibold">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-white/95 text-center leading-relaxed text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section finale */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center max-w-4xl">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-8">
              Prêt à recommencer à lire ?
            </h2>
            <p className="text-xl md:text-2xl text-white/95 mb-12 leading-relaxed font-light">
              Rejoignez des milliers de lecteurs qui ont redécouvert le plaisir de la lecture avec READ.
            </p>
            <Button 
              size="lg" 
              className="bg-reed-light hover:bg-reed-secondary text-reed-darker font-bold text-xl px-12 py-6 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 transform" 
              asChild
            >
              <Link to="/auth">Créer mon compte gratuit</Link>
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
