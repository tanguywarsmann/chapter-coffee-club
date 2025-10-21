import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import LogoVreadPng from "@/components/brand/LogoVreadPng";
import { useState, useEffect } from "react";

// Composant Confettis
function Confetti({ trigger }: { trigger: boolean }) {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    color: string;
    rotation: number;
    velocity: { x: number; y: number };
  }>>([]);

  useEffect(() => {
    if (!trigger) return;

    // Générer 30 confettis
    const colors = ['#EEDCC8', '#F5E6D3', '#FFD700', '#FFA500', '#FF6B35', '#FFFFFF'];
    const newParticles = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      x: 50, // Centre
      y: 50, // Centre
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      velocity: {
        x: (Math.random() - 0.5) * 8,
        y: (Math.random() - 0.5) * 8 - 4, // Bias vers le haut
      },
    }));

    setParticles(newParticles);

    // Nettoyer après animation
    const timeout = setTimeout(() => setParticles([]), 2000);
    return () => clearTimeout(timeout);
  }, [trigger]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 md:w-3 md:h-3"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            backgroundColor: particle.color,
            animation: `confettiFall 2s ease-out forwards`,
            transform: `rotate(${particle.rotation}deg)`,
            '--velocity-x': `${particle.velocity.x * 20}px`,
            '--velocity-y': `${particle.velocity.y * 20}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

export default function Landing() {
  const [revealed, setRevealed] = useState(false);

  const handleReveal = () => {
    if (!revealed) setRevealed(true);
  };

  return (
    <>
      <Helmet>
        <title>VREAD — Si ce n'est pas sur VREAD, tu ne l'as pas lu</title>
        <meta name="description" content="Sur 10 livres achetés, seulement 2 sont finis." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-reed-primary to-reed-secondary flex flex-col items-center justify-center px-6 py-12">
        
        <div className="w-full max-w-2xl space-y-16 text-center">
          
          {/* Logo */}
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full animate-pulse" />
            <LogoVreadPng size={96} className="relative" />
          </div>
          
          {/* Titre */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl text-white font-light px-4 leading-relaxed">
            Sur 10 livres achetés,
            <br />
            seulement
          </h1>
          
          {/* Pile de livres ultra-compacte */}
          <div className="py-12 relative">
            <Confetti trigger={revealed} />
            
            <div 
              className="relative cursor-pointer select-none"
              onClick={handleReveal}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleReveal()}
              aria-label="Cliquer pour révéler les livres terminés"
            >
              {/* Container pile ultra-compact */}
              <div className="relative mx-auto w-16 h-48 md:w-20 md:h-56">
                
                {/* Pile de 10 livres */}
                {Array.from({ length: 10 }).map((_, i) => {
                  const isFinished = i === 1 || i === 7;
                  const stackIndex = 9 - i;
                  
                  return (
                    <div
                      key={i}
                      className="absolute left-1/2 -translate-x-1/2 transition-all duration-700"
                      style={{
                        bottom: revealed 
                          ? (isFinished ? `${(i === 1 ? 0 : 28)}px` : '-80px')
                          : `${stackIndex * 19}px`,
                        opacity: revealed ? (isFinished ? 1 : 0) : 0.92 - (stackIndex * 0.04),
                        zIndex: 10 - stackIndex,
                        transform: revealed && !isFinished 
                          ? `translateX(${-50 + (i * 30 - 150)}%) translateY(80px) rotate(${i * 20 - 90}deg) scale(0.7)`
                          : 'translateX(-50%)',
                      }}
                    >
                      {/* Livre */}
                      <div className={`
                        w-16 h-5 md:w-20 md:h-6
                        rounded-sm
                        transition-all duration-700
                        ${isFinished 
                          ? 'bg-gradient-to-br from-white via-amber-50 to-white shadow-[0_4px_24px_rgba(238,220,200,0.8),0_0_32px_rgba(238,220,200,0.5),0_0_2px_rgba(255,255,255,1)] border border-amber-100/60' 
                          : 'bg-gradient-to-br from-slate-700 to-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.4)] border border-white/8'
                        }
                      `}>
                        {/* Détails minimalistes */}
                        <div className={`
                          absolute inset-y-0.5 left-1 right-1 
                          border-l border-r 
                          ${isFinished ? 'border-amber-200/30' : 'border-white/5'}
                        `} />
                        
                        {/* Checkmark discret */}
                        {isFinished && revealed && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <svg className="w-3 h-3 text-reed-primary/50" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        
                        {/* Shine */}
                        {isFinished && (
                          <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent rounded-sm" />
                        )}
                      </div>
                      
                      {/* Tranche */}
                      <div className={`
                        absolute top-0 -right-0.5 w-0.5 h-5 md:h-6
                        ${isFinished ? 'bg-amber-100/90' : 'bg-slate-900/90'}
                        rounded-r-sm
                      `} />
                    </div>
                  );
                })}
                
              </div>
              
              {/* Prompt élégant */}
              {!revealed && (
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-white/50 text-xs animate-bounce whitespace-nowrap">
                  Touche la pile
                </div>
              )}
              
            </div>
            
            {/* Reset discret */}
            {revealed && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setRevealed(false);
                }}
                className="mt-6 text-white/60 hover:text-white/90 text-xs underline underline-offset-4 transition-colors"
              >
                Recommencer
              </button>
            )}
          </div>
          
          {/* Texte final */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl text-white font-light px-4 leading-relaxed">
            sont finis.
          </h2>
          
          {/* CTA */}
          <div className="pt-8">
            <Button 
              size="lg"
              className="bg-white hover:bg-white/95 text-reed-primary px-14 py-7 text-2xl md:text-3xl font-bold rounded-full shadow-2xl hover:scale-105 transition-all duration-300"
              asChild
            >
              <Link to="/auth">Finir mes livres</Link>
            </Button>
          </div>
          
          {/* Slogan */}
          <div className="pt-12 px-4">
            <p className="text-xl md:text-2xl lg:text-3xl text-white/90 font-serif italic leading-relaxed">
              Si ce n'est pas sur VREAD,
              <br />
              tu ne l'as pas lu.
            </p>
          </div>
          
        </div>
      </div>

      <style>{`
        @keyframes confettiFall {
          0% {
            transform: translate(0, 0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translate(var(--velocity-x), calc(var(--velocity-y) + 300px)) rotate(720deg);
            opacity: 0;
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
