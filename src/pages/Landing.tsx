import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import LogoVreadPng from "@/components/brand/LogoVreadPng";
import { ArrowRight, Check } from "lucide-react";

export default function Landing() {
  return (
    <>
      <Helmet>
        <title>VREAD — Si c'est pas sur VREAD, tu l'as pas lu</title>
        <meta name="description" content="Tu finis 2 livres sur 10. VREAD change ça." />
      </Helmet>

      <div className="bg-black">
        
        {/* HERO */}
        <section className="relative min-h-screen flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-gradient-radial from-reed-primary/20 to-black" />
          
          <div className="relative z-10 max-w-7xl mx-auto text-center space-y-16">
            
            <div className="inline-block bg-black/40 backdrop-blur-sm border border-white/10 rounded-3xl p-6">
              <LogoVreadPng size={72} />
            </div>
            
            <h1 className="text-7xl md:text-9xl lg:text-[11rem] font-serif font-black text-white leading-[0.85] tracking-tight">
              Tu l'as
              <br />
              <span className="bg-gradient-to-r from-amber-200 via-reed-light to-amber-400 bg-clip-text text-transparent">
                vraiment
              </span>
              <br />
              lu ?
            </h1>
            
            <p className="text-2xl md:text-3xl text-white/60 font-light">
              Spoiler : probablement pas.
            </p>
            
            <Button 
              size="lg"
              className="bg-white hover:bg-white text-black px-12 py-8 text-2xl font-bold rounded-2xl shadow-2xl hover:scale-105 transition-all"
              asChild
            >
              <Link to="/auth" className="flex items-center gap-3">
                Prouver que je lis
                <ArrowRight className="w-6 h-6" />
              </Link>
            </Button>
            
            <div className="flex items-center justify-center gap-6 text-white/40 text-sm pt-8">
              <span>370 lecteurs</span>
              <span>•</span>
              <span>Gratuit</span>
            </div>
            
          </div>
        </section>

        {/* STAT SECTION */}
        <section className="relative py-32 px-4 bg-gradient-to-b from-black via-reed-primary/10 to-black">
          <div className="max-w-6xl mx-auto">
            
            <div className="text-center mb-16 space-y-6">
              <h2 className="text-4xl md:text-6xl font-serif text-white/90 font-bold">
                Combien de livres tu as
                <br />
                <span className="line-through text-white/30">achetés</span>
                {" "}vraiment terminés ?
              </h2>
            </div>
            
            <div className="relative bg-gradient-to-br from-zinc-900 to-black border-2 border-white/10 rounded-3xl p-16 text-center">
              <div className="space-y-8">
                <div className="text-[15rem] md:text-[20rem] lg:text-[25rem] font-black leading-none bg-gradient-to-br from-red-400 via-orange-400 to-amber-300 bg-clip-text text-transparent">
                  2/10
                </div>
                
                <p className="text-3xl md:text-4xl text-white/80 font-light">
                  En moyenne, tu finis 2 livres sur 10
                </p>
                
                <div className="w-24 h-1 bg-gradient-to-r from-transparent via-reed-light to-transparent mx-auto my-12" />
                
                <p className="text-5xl md:text-6xl font-serif font-bold text-white">
                  VREAD change ça.
                </p>
              </div>
            </div>
            
          </div>
        </section>

        {/* COMMENT ÇA MARCHE */}
        <section className="py-32 px-4 bg-black">
          <div className="max-w-6xl mx-auto space-y-16">
            
            <div className="text-center space-y-6">
              <h2 className="text-5xl md:text-7xl font-serif font-bold text-white">
                Simple. Efficace. Prouvé.
              </h2>
            </div>
            
            <div className="space-y-8">
              
              {/* Étape 1 */}
              <div className="bg-gradient-to-r from-zinc-900 to-black border-l-4 border-reed-light rounded-2xl p-8 md:p-12">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-reed-light to-amber-400 rounded-2xl flex items-center justify-center text-4xl font-black text-black">
                    1
                  </div>
                  <div className="space-y-2 flex-1">
                    <h3 className="text-3xl font-bold text-white">Choisis ton livre</h3>
                    <p className="text-xl text-white/70">
                      Classiques gratuits ou demande n'importe quel livre. On l'ajoute en 48h.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Étape 2 */}
              <div className="bg-gradient-to-r from-zinc-900 to-black border-l-4 border-amber-400 rounded-2xl p-8 md:p-12">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-4xl font-black text-black">
                    2
                  </div>
                  <div className="space-y-2 flex-1">
                    <h3 className="text-3xl font-bold text-white">Lis et valide</h3>
                    <p className="text-xl text-white/70">
                      Tous les 30 pages, réponds à une question. Ça prouve que tu lis vraiment.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Étape 3 */}
              <div className="bg-gradient-to-r from-zinc-900 to-black border-l-4 border-green-400 rounded-2xl p-8 md:p-12">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center text-4xl font-black text-black">
                    3
                  </div>
                  <div className="space-y-2 flex-1">
                    <h3 className="text-3xl font-bold text-white">Progresse</h3>
                    <p className="text-xl text-white/70">
                      Stats, streak, badges. Comme Duolingo, mais pour la lecture.
                    </p>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </section>

        {/* SLOGAN FINAL */}
        <section className="py-32 px-4 bg-gradient-to-b from-black via-reed-primary/20 to-black">
          <div className="max-w-6xl mx-auto text-center space-y-16">
            
            <h2 className="text-6xl md:text-8xl lg:text-9xl font-serif font-black leading-[0.9] tracking-tight">
              <span className="text-white">Si c'est pas</span>
              <br />
              <span className="text-white">sur </span>
              <span className="text-reed-light">VREAD</span>
              <span className="text-white">,</span>
              <br />
              <span className="text-white/40">tu l'as pas lu.</span>
            </h2>
            
            <Button 
              size="lg"
              className="bg-gradient-to-r from-reed-light to-amber-400 hover:from-reed-secondary hover:to-amber-500 text-black px-20 py-10 text-3xl font-black rounded-2xl shadow-2xl hover:scale-105 transition-all"
              asChild
            >
              <Link to="/auth" className="flex items-center gap-4">
                Commencer maintenant
                <ArrowRight className="w-8 h-8" />
              </Link>
            </Button>
            
            <div className="pt-12 flex flex-wrap justify-center gap-12 text-white/50">
              <div className="text-center">
                <div className="text-4xl font-bold text-reed-light mb-2">370</div>
                <div className="text-sm uppercase">Lecteurs</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-reed-light mb-2">1.2K</div>
                <div className="text-sm uppercase">Validations</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-reed-light mb-2">26</div>
                <div className="text-sm uppercase">Livres/sem</div>
              </div>
            </div>
            
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-white/5 py-12 px-4 bg-black">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-4">
                <LogoVreadPng size={32} className="opacity-60" />
                <span className="text-white/40 text-sm">© 2025 VREAD</span>
              </div>
              <div className="flex gap-8 text-sm text-white/40">
                <Link to="/about" className="hover:text-white transition-colors">À propos</Link>
                <Link to="/blog" className="hover:text-white transition-colors">Blog</Link>
                <Link to="/press" className="hover:text-white transition-colors">Presse</Link>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
