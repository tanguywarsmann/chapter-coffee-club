
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Trophy, TrendingUp } from "lucide-react";
import { Helmet } from "react-helmet-async";
import Image from "@/components/ui/image";

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
        <title>READ — L'appli qui t'accompagne dans ta lecture, page après page</title>
        <meta name="description" content="READ vous aide à reprendre goût à la lecture avec une approche progressive. Découvrez des livres classiques, suivez vos progrès et rejoignez une communauté de lecteurs passionnés." />
        <meta property="og:title" content="READ — L'appli qui t'accompagne dans ta lecture, page après page" />
        <meta property="og:description" content="READ vous aide à reprendre goût à la lecture avec une approche progressive. Découvrez des livres classiques, suivez vos progrès et rejoignez une communauté de lecteurs passionnés." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://vread.fr/" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="READ — L'appli qui t'accompagne dans ta lecture, page après page" />
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

      <div className="min-h-screen bg-gradient-to-br from-reed-primary via-reed-primary to-reed-secondary">
        {/* Hero Section avec Logo */}
        <section className="relative py-16 px-4">
          <div className="container mx-auto text-center max-w-4xl">
            {/* Logo READ mis en avant */}
            <div className="mb-8 flex justify-center">
              <div className="bg-reed-primary p-6 rounded-2xl shadow-lg">
                <Image 
                  src="/lovable-uploads/f8f10dfb-9602-4b38-b705-d6e6f42cce5d.png" 
                  alt="READ Logo" 
                  className="h-20 w-20 mx-auto"
                  priority={true}
                  sizes="80px"
                />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6 leading-tight">
              L'appli qui t'accompagne<br />
              dans ta lecture,<br />
              <span className="text-reed-light">page après page</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed max-w-3xl mx-auto">
              Relevez des défis, suivez vos progrès, lisez à votre rythme. 
              Redécouvrez le plaisir de la lecture avec une approche moderne et bienveillante.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-reed-light hover:bg-reed-secondary text-reed-darker font-semibold text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" 
                asChild
              >
                <Link to="/auth">Commencer à lire</Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-white text-white hover:bg-white hover:text-reed-primary font-semibold text-lg px-8 py-4 rounded-full transition-all duration-300" 
                asChild
              >
                <Link to="/blog">Découvrir le blog</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4 bg-white/10 backdrop-blur-sm">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-center text-white mb-12">
              Une nouvelle façon de lire
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="bg-white/15 border-white/30 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 hover:scale-105">
                  <CardHeader className="text-center pb-4">
                    <feature.icon className="h-12 w-12 text-reed-light mx-auto mb-4" />
                    <CardTitle className="text-white text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-white/90 text-center leading-relaxed">
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
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-6">
              Prêt à recommencer à lire ?
            </h2>
            <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed">
              Rejoignez des milliers de lecteurs qui ont redécouvert le plaisir de la lecture avec read.
            </p>
            <Button 
              size="lg" 
              className="bg-reed-light hover:bg-reed-secondary text-reed-darker font-semibold text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" 
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
