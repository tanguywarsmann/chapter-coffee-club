import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import LogoVreadPng from "@/components/brand/LogoVreadPng";
import { useState, useEffect } from "react";

export default function Landing() {
  const [revealed, setRevealed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [confetti, setConfetti] = useState<Array<{
    id: number;
    left: number;
    top: number;
    width: number;
    height: number;
    color: string;
    rotation: number;
    velocityX: number;
    velocityY: number;
    duration: number;
    shape: 'square' | 'rectangle' | 'circle';
  }>>([]);

  // Détecter si mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint Tailwind
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleReveal = () => {
    if (!revealed) {
      setRevealed(true);
      
      // Confettis UNIQUEMENT sur mobile
      if (isMobile) {
        const colors = [
          '#FFD700', '#FFA500', '#FF6B35', '#EEDCC8', '#FFFFFF',
          '#F5E6D3', '#FFE4B5', '#FFDAB9', '#FFB6C1', '#87CEEB',
        ];
        
        const newConfetti = Array.from({ length: 250 }).map((_, i) => {
          const angle = (Math.random() * 360) * (Math.PI / 180);
          const velocity = Math.random() * 100 + 80;
          const shapes: Array<'square' | 'rectangle' | 'circle'> = ['square', 'rectangle', 'circle'];
          const shape = shapes[Math.floor(Math.random() * shapes.length)];
          const size = Math.random() * 20 + 10;
          
          return {
            id: i,
            left: 50,
            top: 45,
            width: shape === 'rectangle' ? size * 1.5 : size,
            height: shape === 'rectangle' ? size * 0.6 : size,
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * 360,
            velocityX: Math.cos(angle) * velocity,
            velocityY: Math.sin(angle) * velocity - 50,
            duration: Math.random() * 1.5 + 3,
            shape,
          };
        });
        
        setConfetti(newConfetti);
        
        setTimeout(() => {
          setConfetti([]);
        }, 5000);
      }
    }
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
          
          {/* Pile + Confettis */}
          <div className="py-12 relative">
            
            {/* Container confettis MOBILE ONLY */}
            {isMobile && (
              <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
                {confetti.map((particle) => (
                  <div
                    key={particle.id}
                    className="absolute"
                    style={{
                      left: `${particle.left}%`,
                      top: `${particle.top}%`,
                      width: `${particle.width}px`,
                      height: `${particle.height}px`,
                      backgroundColor: particle.color,
                      borderRadius: particle.shape === 'circle' ? '50%' : particle.shape === 'rectangle' ? '2px' : '4px',
                      transform: `rotate(${particle.rotation}deg)`,
                      animation: `confettiMassive ${particle.duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                      '--velocity-x': `${particle.velocityX}px`,
                      '--velocity-y': `${particle.velocityY}px`,
                      '--final-y': `${particle.velocityY + 800}px`,
                    } as React.CSSProperties}
                  />
                ))}
              </div>
            )}
            
            {/* Pile interactive */}
            <div 
              className="relative cursor-pointer select-none outline-none hover:scale-105 transition-transform"
              onClick={handleReveal}
              onTouchStart={(e) => {
                e.preventDefault();
                handleReveal();
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleReveal();
                }
              }}
              aria-label="Cliquer pour révéler les livres terminés"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {/* Container pile */}
              <div className="relative mx-auto w-16 h-48 md:w-20 md:h-56">
                
                {/* 10 livres */}
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
                      <div className={`
                        w-16 h-5 md:w-20 md:h-6
                        rounded-sm
                        transition-all duration-700
                        ${isFinished 
                          ? 'bg-gradient-to-br from-white via-amber-50 to-white shadow-[0_4px_24px_rgba(238,220,200,0.8),0_0_32px_rgba(238,220,200,0.5)] border border-amber-100/60' 
                          : 'bg-gradient-to-br from-slate-700 to-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.4)] border border-white/8'
                        }
                      `}>
                        <div className={`
                          absolute inset-y-0.5 left-1 right-1 
                          border-l border-r 
                          ${isFinished ? 'border-amber-200/30' : 'border-white/5'}
                        `} />
                        
                        {isFinished && revealed && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <svg className="w-3 h-3 text-reed-primary/50" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        
                        {isFinished && (
                          <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent rounded-sm" />
                        )}
                      </div>
                      
                      <div className={`
                        absolute top-0 -right-0.5 w-0.5 h-5 md:h-6
                        ${isFinished ? 'bg-amber-100/90' : 'bg-slate-900/90'}
                        rounded-r-sm
                      `} />
                    </div>
                  );
                })}
                
              </div>
              
              {!revealed && (
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-white/50 text-xs animate-bounce whitespace-nowrap pointer-events-none">
                  {isMobile ? 'Touche la pile' : 'Clique sur la pile'}
                </div>
              )}
              
            </div>
            
            {revealed && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setRevealed(false);
                  setConfetti([]);
                }}
                className="mt-6 text-white/60 hover:text-white/90 text-xs underline underline-offset-4 transition-colors outline-none focus:outline-none"
              >
                Recommencer
              </button>
            )}
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl text-white font-light px-4 leading-relaxed">
            sont finis.
          </h2>
          
          <div className="pt-8">
            <Button 
              size="lg"
              className="bg-white hover:bg-white/95 text-reed-primary px-14 py-7 text-2xl md:text-3xl font-bold rounded-full shadow-2xl hover:scale-105 transition-all duration-300"
              asChild
            >
              <Link to="/auth">Finir mes livres</Link>
            </Button>
          </div>
          
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
        @keyframes confettiMassive {
          0% {
            transform: translate(0, 0) rotate(0deg) scale(1);
            opacity: 1;
          }
          15% {
            transform: translate(calc(var(--velocity-x) * 0.3), calc(var(--velocity-y) * 0.3)) rotate(180deg) scale(1.1);
            opacity: 1;
          }
          100% {
            transform: translate(var(--velocity-x), var(--final-y)) rotate(1440deg) scale(0.4);
            opacity: 0;
          }
        }
        
        * {
          -webkit-tap-highlight-color: transparent;
        }
        
        button:focus,
        div:focus,
        [role="button"]:focus {
          outline: none !important;
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
