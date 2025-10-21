import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import LogoVreadPng from "@/components/brand/LogoVreadPng";

export default function Landing() {
  return (
    <>
      <Helmet>
        <title>VREAD — Si ce n'est pas sur VREAD, tu ne l'as pas lu</title>
        <meta name="description" content="Sur 10 livres achetés, seulement 2 sont finis." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-reed-primary to-reed-secondary flex flex-col items-center justify-center px-6 py-12">
        
        {/* Logo grand et clean */}
        <div className="mb-16">
          <LogoVreadPng size={120} />
        </div>
        
        {/* Contenu principal centré */}
        <div className="max-w-3xl w-full text-center space-y-12">
          
          {/* Texte aligné */}
          <div className="space-y-4">
            <p className="text-4xl md:text-5xl text-white font-light">
              Sur 10 livres achetés,
              <br />
              seulement
            </p>
            
            <div className="text-[16rem] md:text-[20rem] font-black text-white leading-none -my-8">
              2
            </div>
            
            <p className="text-4xl md:text-5xl text-white font-light">
              sont finis.
            </p>
          </div>
          
          {/* CTA */}
          <div className="pt-8">
            <Button 
              size="lg"
              className="bg-white hover:bg-white/95 text-reed-primary px-16 py-8 text-3xl font-bold rounded-full shadow-2xl hover:scale-105 transition-all"
              asChild
            >
              <Link to="/auth">Finir mes livres</Link>
            </Button>
          </div>
          
        </div>
        
        {/* Slogan en bas */}
        <div className="mt-20 text-center">
          <p className="text-2xl md:text-3xl text-white/90 font-serif">
            Si ce n'est pas sur VREAD,
            <br />
            tu ne l'as pas lu.
          </p>
          
          <p className="text-white/60 text-sm mt-8">
            370 lecteurs · Gratuit
          </p>
        </div>
        
      </div>
    </>
  );
}
