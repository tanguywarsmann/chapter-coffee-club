import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import LogoVreadPng from "@/components/brand/LogoVreadPng";
import { useState } from "react";

export default function Landing() {
  const [revealed, setRevealed] = useState(false);

  return (
    <>
      <Helmet>
        <title>VREAD — Si ce n'est pas sur VREAD, tu ne l'as pas lu</title>
        <meta name="description" content="Sur 10 livres achetés, seulement 2 sont finis." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-reed-primary to-reed-secondary flex flex-col items-center justify-center px-6 py-12">
        
        <div className="w-full max-w-2xl space-y-12 text-center">
          
          {/* Logo */}
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full animate-pulse" />
            <LogoVreadPng size={96} className="relative" />
          </div>
          
          {/* Titre */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl text-white font-light px-4">
            Sur 10 livres achetés,
            <br />
            seulement
          </h1>
          
          {/* Pile de livres verticale */}
          <div className="py-8">
            <div 
              className="relative cursor-pointer select-none"
              onClick={() => setRevealed(true)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setRevealed(true)}
              aria-label="Cliquer pour révéler les livres terminés"
            >
              {/* Container pile */}
              <div className="relative mx-auto w-32 h-96 md:w-40 md:h-[28rem]">
                
                {/* Pile de 10 livres */}
                {Array.from({ length: 10 }).map((_, i) => {
                  const isFinished = i === 1 || i === 7; // 2 livres finis
                  const stackIndex = 9 - i; // Inverse pour empiler du bas vers le haut
                  
                  return (
                    <div
                      key={i}
                      className="absolute left-1/2 -translate-x-1/2 transition-all duration-700"
                      style={{
                        bottom: revealed 
                          ? (isFinished ? `${(isFinished && i === 1 ? 0 : 60)}px` : '-100px')
                          : `${stackIndex * 38}px`,
                        opacity: revealed ? (isFinished ? 1 : 0) : 0.9 - (stackIndex * 0.05),
                        zIndex: 10 - stackIndex,
                        transform: revealed && !isFinished 
                          ? `translateX(${-50 + (i * 20 - 100)}%) translateY(100px) rotate(${i * 15 - 60}deg) scale(0.8)`
                          : 'translateX(-50%)',
                      }}
                    >
                      {/* Livre */}
                      <div className={`
                        w-32 h-10 md:w-40 md:h-12
                        rounded-md
                        transition-all duration-700
                        ${isFinished 
                          ? 'bg-gradient-to-br from-white via-amber-50 to-white shadow-[0_8px_32px_rgba(238,220,200,0.6),0_0_48px_rgba(238,220,200,0.4),0_0_2px_rgba(238,220,200,1)] border-2 border-amber-100/50' 
                          : 'bg-gradient-to-br from-slate-700 to-slate-800 shadow-[0_4px_12px_rgba(0,0,0,0.3)] border border-white/10'
                        }
                      `}>
                        {/* Détails du dos */}
                        <div className={`
                          absolute inset-y-1 left-2 right-2 
                          border-l border-r 
                          ${isFinished ? 'border-amber-200/40' : 'border-white/5'}
                        `} />
                        
                        {/* Lignes horizontales */}
                        <div className={`absolute top-2 left-2 right-2 h-px ${isFinished ? 'bg-amber-200/30' : 'bg-white/5'}`} />
                        <div className={`absolute bottom-2 left-2 right-2 h-px ${isFinished ? 'bg-amber-200/30' : 'bg-white/5'}`} />
                        
                        {/* Checkmark sur livres finis */}
                        {isFinished && revealed && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <svg className="w-6 h-6 text-reed-primary/60" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        
                        {/* Shine effect sur finis */}
                        {isFinished && (
                          <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent rounded-md" />
                        )}
                      </div>
                      
                      {/* Tranche du livre (côté) */}
                      <div className={`
                        absolute top-0 -right-1 w-1 h-10 md:h-12
                        ${isFinished ? 'bg-amber-100/80' : 'bg-slate-900/80'}
                        rounded-r-sm
                      `} />
                    </div>
                  );
                })}
                
              </div>
              
              {/* Compteur géant */}
              <div className="relative -mt-8">
                <div className={`
                  text-8xl md:text-9xl font-black 
                  transition-all duration-1000
                  ${revealed 
                    ? 'text-white opacity-100 scale-100' 
                    : 'text-white/30 opacity-50 scale-90'
                  }
                `}>
                  {revealed ? '2' : '10'}
                </div>
              </div>
              
              {/* Prompt */}
              {!revealed && (
                <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 text-white/60 text-sm animate-bounce whitespace-nowrap">
                  Touche la pile ↑
                </div>
              )}
              
            </div>
            
            {/* Reset */}
            {revealed && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setRevealed(false);
                }}
                className="mt-8 text-white/70 hover:text-white text-sm underline underline-offset-4 transition-colors"
              >
                Recommencer
              </button>
            )}
          </div>
          
          {/* Texte final */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl text-white font-light px-4">
            sont finis.
          </h2>
          
          {/* CTA */}
          <div className="pt-8">
            <Button 
              size="lg"
              className="bg-white hover:bg-white/95 text-reed-primary px-12 py-7 text-2xl md:text-3xl font-bold rounded-full shadow-2xl hover:scale-105 transition-all duration-300"
              asChild
            >
              <Link to="/auth">Finir mes livres</Link>
            </Button>
          </div>
          
          {/* Slogan */}
          <div className="pt-12 px-4">
            <p className="text-xl md:text-2xl text-white/90 font-serif italic leading-relaxed">
              Si ce n'est pas sur VREAD,
              <br />
              tu ne l'as pas lu.
            </p>
            
            <p className="text-white/60 text-sm mt-6">
              370 lecteurs · Gratuit
            </p>
          </div>
          
        </div>
      </div>

      <style>{`
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
