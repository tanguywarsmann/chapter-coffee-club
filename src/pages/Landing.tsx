import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import LogoVreadPng from "@/components/brand/LogoVreadPng";
import { useState } from "react";

export default function Landing() {
  const [revealed, setRevealed] = useState(false);
  
  // Indices des 2 livres terminés (positions 1 et 7 pour équilibre visuel)
  const finishedBooks = [1, 7];

  return (
    <>
      <Helmet>
        <title>VREAD — Si ce n'est pas sur VREAD, tu ne l'as pas lu</title>
        <meta name="description" content="Sur 10 livres achetés, seulement 2 sont finis." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-reed-primary to-reed-secondary flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
        
        {/* Grain texture subtil */}
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PC9maWx0ZXI+PHBhdGggZD0iTTAgMGgzMDB2MzAwSDB6IiBmaWx0ZXI9InVybCgjYSkiIG9wYWNpdHk9Ii4wNSIvPjwvc3ZnPg==')]" />
        </div>

        <div className="relative z-10 w-full max-w-4xl space-y-16 text-center">
          
          {/* Logo avec glow */}
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full scale-150 animate-pulse" />
            <div className="relative">
              <LogoVreadPng size={120} />
            </div>
          </div>
          
          {/* Texte principal */}
          <div className="space-y-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl text-white font-light leading-relaxed">
              Sur 10 livres achetés,
              <br />
              seulement
            </h1>
            
            {/* Bibliothèque interactive */}
            <div className="py-12">
              <div 
                className="relative cursor-pointer group"
                onClick={() => setRevealed(true)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setRevealed(true)}
                aria-label="Cliquer pour révéler les livres terminés"
              >
                {/* Étagère */}
                <div className="relative mx-auto max-w-2xl">
                  
                  {/* Planche d'étagère */}
                  <div className="absolute -bottom-2 left-0 right-0 h-3 bg-gradient-to-b from-amber-900/40 to-amber-950/60 rounded-sm shadow-lg" />
                  
                  {/* Livres */}
                  <div className="flex justify-center items-end gap-3 pb-4 px-4">
                    {Array.from({ length: 10 }).map((_, i) => {
                      const isFinished = finishedBooks.includes(i);
                      const bookColors = [
                        'from-slate-700 to-slate-800',
                        'from-slate-600 to-slate-700',
                        'from-slate-700 to-slate-800',
                        'from-slate-650 to-slate-750',
                        'from-slate-700 to-slate-800',
                        'from-slate-600 to-slate-700',
                        'from-slate-700 to-slate-800',
                        'from-slate-650 to-slate-750',
                        'from-slate-700 to-slate-800',
                        'from-slate-600 to-slate-700',
                      ];
                      
                      return (
                        <div 
                          key={i}
                          className="relative"
                          style={{
                            animation: revealed && isFinished 
                              ? `bookPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.1}s both`
                              : 'none'
                          }}
                        >
                          {/* Livre non terminé */}
                          <div className={`
                            w-8 h-32 md:w-10 md:h-40 lg:w-12 lg:h-48
                            bg-gradient-to-br ${bookColors[i]}
                            rounded-sm
                            shadow-[0_2px_8px_rgba(0,0,0,0.3)]
                            border-l-2 border-white/5
                            relative
                            transition-all duration-300
                            ${!revealed ? 'group-hover:-translate-y-2' : ''}
                          `}>
                            {/* Détails du dos de livre */}
                            <div className="absolute inset-y-2 left-1 right-1 border-l border-r border-white/5" />
                            <div className="absolute top-4 left-1 right-1 h-px bg-white/5" />
                            <div className="absolute bottom-4 left-1 right-1 h-px bg-white/5" />
                          </div>
                          
                          {/* Livre terminé (overlay) */}
                          {isFinished && revealed && (
                            <div className={`
                              absolute inset-0
                              w-8 h-32 md:w-10 md:h-40 lg:w-12 lg:h-48
                              bg-gradient-to-br from-white via-amber-50 to-amber-100
                              rounded-sm
                              shadow-[0_4px_20px_rgba(238,220,200,0.6),0_0_40px_rgba(238,220,200,0.3)]
                              border-l-2 border-amber-200
                              transform
                            `}>
                              {/* Détails dorés */}
                              <div className="absolute inset-y-2 left-1 right-1 border-l border-r border-amber-300/30" />
                              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                <div className="w-4 h-4 text-reed-primary opacity-70">
                                  <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                                  </svg>
                                </div>
                              </div>
                              {/* Shine effect */}
                              <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent rounded-sm" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Prompt de clic */}
                  {!revealed && (
                    <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-white/60 text-sm animate-bounce">
                      Clique sur les livres ↑
                    </div>
                  )}
                  
                </div>
              </div>
              
              {/* Légende */}
              <div className="flex items-center justify-center gap-6 mt-12 text-white/80 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-8 bg-gradient-to-br from-slate-700 to-slate-800 rounded-sm border-l-2 border-white/5" />
                  <span>Achetés</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-8 bg-gradient-to-br from-white to-amber-100 rounded-sm border-l-2 border-amber-200 shadow-lg" />
                  <span>Terminés</span>
                </div>
              </div>
              
              {/* Reset button */}
              {revealed && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setRevealed(false);
                  }}
                  className="mt-6 text-white/70 hover:text-white text-sm underline underline-offset-4 transition-colors"
                >
                  Rejouer
                </button>
              )}
            </div>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl text-white font-light">
              sont finis.
            </h2>
          </div>
          
          {/* CTA */}
          <div className="pt-8">
            <Button 
              size="lg"
              className="bg-white hover:bg-white/95 text-reed-primary px-16 py-8 text-3xl font-bold rounded-full shadow-2xl hover:scale-105 transition-all duration-300"
              asChild
            >
              <Link to="/auth">Finir mes livres</Link>
            </Button>
          </div>
          
          {/* Slogan */}
          <div className="pt-8">
            <p className="text-2xl md:text-3xl text-white/90 font-serif italic">
              Si ce n'est pas sur VREAD,
              <br />
              tu ne l'as pas lu.
            </p>
            
            <p className="text-white/60 text-sm mt-8">
              370 lecteurs · Gratuit
            </p>
          </div>
          
        </div>
      </div>

      {/* Animations CSS */}
      <style>{`
        @keyframes bookPop {
          0% {
            transform: translateY(20px) scale(0.9);
            opacity: 0;
          }
          50% {
            transform: translateY(-8px) scale(1.05);
          }
          100% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          * {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </>
  );
}
