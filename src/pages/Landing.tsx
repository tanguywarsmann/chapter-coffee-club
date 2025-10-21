import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import LogoVreadPng from "@/components/brand/LogoVreadPng";

export default function Landing() {
  return (
    <>
      <Helmet>
        <title>VREAD — Si ce n'est pas sur VREAD, tu ne l'as pas lu</title>
        <meta name="description" content="Sur 10 livres achetés, tu n'en finis que 2. VREAD change ça." />
      </Helmet>

      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="max-w-5xl w-full space-y-24 text-center">
          
          {/* Logo discret */}
          <div className="opacity-40">
            <LogoVreadPng size={48} className="mx-auto" />
          </div>
          
          {/* Stat choc */}
          <div className="space-y-8">
            <h1 className="text-4xl md:text-5xl text-white/80 font-light leading-tight">
              Sur 10 livres achetés,
              <br />
              tu n'en finis que
            </h1>
            
            <div className="text-[12rem] md:text-[18rem] lg:text-[22rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-400 to-amber-400 leading-none">
              2
            </div>
          </div>
          
          {/* CTA */}
          <Button 
            size="lg"
            className="bg-white hover:bg-gray-100 text-black px-20 py-10 text-3xl font-bold rounded-full shadow-2xl hover:scale-105 transition-all"
            asChild
          >
            <Link to="/auth">Finir mes livres</Link>
          </Button>
          
          {/* Slogan */}
          <p className="text-2xl md:text-3xl text-white/50 font-light pt-12">
            Si ce n'est pas sur VREAD,
            <br />
            tu ne l'as pas lu.
          </p>
          
          {/* Mini footer */}
          <p className="text-white/30 text-sm pt-8">
            370 lecteurs · Gratuit
          </p>
          
        </div>
      </div>
    </>
  );
}
