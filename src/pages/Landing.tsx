import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import LogoVreadPng from "@/components/brand/LogoVreadPng";

export default function Landing() {
  return (
    <>
      <Helmet>
        <title>VREAD — Si ce n'est pas sur VREAD, tu ne l'as pas lu</title>
        <meta name="description" content="Sur 10 livres achetés, seulement 2 sont finis. VREAD change ça." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-reed-primary via-reed-primary to-reed-secondary flex items-center justify-center px-6">
        <div className="max-w-4xl w-full space-y-16 text-center">
          
          {/* Logo avec animation pulse subtile */}
          <div className="animate-pulse-slow">
            <div className="inline-block bg-white/10 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-2 border-white/20">
              <LogoVreadPng size={96} />
            </div>
          </div>
          
          {/* Stat + Texte alignés */}
          <div className="space-y-6">
            <h1 className="text-3xl md:text-4xl lg:text-5xl text-white font-light leading-relaxed">
              Sur 10 livres achetés,
              <br />
              seulement <span className="font-black text-6xl md:text-8xl lg:text-9xl block mt-4 mb-4">2</span>
              sont finis.
            </h1>
          </div>
          
          {/* CTA massif */}
          <div className="pt-8">
            <Button 
              size="lg"
              className="bg-white hover:bg-white/95 text-reed-primary px-20 py-10 text-3xl md:text-4xl font-black rounded-full shadow-2xl hover:scale-105 transition-all duration-300"
              asChild
            >
              <Link to="/auth">Finir mes livres</Link>
            </Button>
          </div>
          
          {/* Slogan */}
          <div className="pt-12">
            <p className="text-xl md:text-2xl lg:text-3xl text-white/90 font-serif italic">
              Si ce n'est pas sur VREAD,
              <br />
              tu ne l'as pas lu.
            </p>
          </div>
          
          {/* Stats minimalistes */}
          <div className="pt-8">
            <p className="text-white/60 text-sm">
              +400 lecteurs · Gratuit
            </p>
          </div>
          
        </div>
      </div>

      {/* Style personnalisé pour l'animation pulse lente */}
      <style>{`
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.95;
            transform: scale(1.02);
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
