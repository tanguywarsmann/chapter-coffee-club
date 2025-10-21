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

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleReveal = () => {
    if (!revealed) {
      setRevealed(true);
      
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
        setTimeout(() => setConfetti([]), 5000);
      }
    }
  };

  const letters = ['D', 'E', 'U', 'X', 'L', 'I', 'V', 'R', 'E', 'S'];
  
  const bookColors = [
    { from: '#8B4513', to: '#5C2E0F' },
    { from: '#A0522D', to: '#6B3410' },
    { from: '#8B7355', to: '#5C4A37' },
    { from: '#996633', to: '#6B4423' },
    { from: '#8B6F47', to: '#5C4A2F' },
    { from: '#704214', to: '#4A2C0E' },
    { from: '#9C6644', to: '#6B4430' },
    { from: '#A67B5B', to: '#70533D' },
    { from: '#8B6F47', to: '#5C4A2F' },
    { from: '#B85C38', to: '#8B4513' },
  ];

  return (
    <>
      <Helmet>
        <title>VREAD — Si ce n'est pas sur VREAD, tu ne l'as pas lu</title>
        <meta name="description" content="Sur 10 livres achetés, seulement 2 sont finis." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-reed-primary to-reed-secondary flex flex-col">
        
        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="w-full max-w-2xl space-y-6 text-center">
            
            {/* Logo */}
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-radial from-white/30 via-white/10 to-transparent blur-3xl scale-150 animate-pulse" />
              <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-[2rem] p-10 border-2 border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
                <LogoVreadPng size={140} />
              </div>
            </div>
            
            {/* Titre - ESPACE RÉDUIT */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl text-white font-light px-4 leading-relaxed pt-4">
              Sur 10 livres achetés,
              <br />
              seulement
            </h1>
            
            {/* Pile avec animation - ESPACE RÉDUIT */}
            <div className="py-4 relative">
              
              {/* Confettis mobile */}
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
              
              {/* Container pile */}
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
                aria-label="Cliquer pour voir les livres terminés"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <div className="relative mx-auto w-28 h-52 md:w-36 md:h-64">
                  
                  {/* 10 livres empilés */}
                  {Array.from({ length: 10 }).map((_, i) => {
                    const isFinished = i === 8 || i === 9; // Les 2 derniers livres
                    const stackIndex = 9 - i;
                    const colorPalette = bookColors[i];
                    const letter = letters[i];
                    
                    // Calculer quelle lettre tombe où
                    // D(0),E(1),U(2),X(3) → livre 8
                    // L(4),I(5),V(6),R(7),E(8),S(9) → livre 9
                    const letterGoesToFirstBook = i <= 3; // D,E,U,X
                    const targetBookIndex = letterGoesToFirstBook ? 8 : 9;
                    
                    return (
                      <div
                        key={i}
                        className="absolute left-1/2 -translate-x-1/2"
                        style={{
                          bottom: revealed 
                            ? (isFinished ? `${i === 8 ? 0 : 34}px` : '-100px')
                            : `${stackIndex * 16}px`,
                          zIndex: 10 - stackIndex,
                        }}
                      >
                        {/* Livre (disparaît si pas fini) */}
                        <div 
                          className={`
                            w-28 h-8 md:w-36 md:h-10
                            rounded-md
                            relative
                            transition-all duration-700
                            ${isFinished && revealed
                              ? 'bg-gradient-to-br from-white via-amber-50 to-white shadow-[0_6px_30px_rgba(238,220,200,0.9),0_0_40px_rgba(238,220,200,0.6)] border-2 border-amber-100/70' 
                              : 'shadow-[0_3px_12px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.15)] border border-white/15'
                            }
                          `}
                          style={{
                            background: isFinished && revealed 
                              ? undefined 
                              : `linear-gradient(135deg, ${colorPalette.from} 0%, ${colorPalette.to} 100%)`,
                            opacity: revealed && !isFinished ? 0 : 1,
                            transform: revealed && !isFinished ? 'scale(0.8)' : 'scale(1)',
                          }}
                        >
                          {/* Détails livres non finis */}
                          {(!isFinished || !revealed) && (
                            <>
                              <div className="absolute inset-y-1.5 left-2 right-2 border-l border-r border-white/10" />
                              <div className="absolute top-2 left-2 right-2 h-px bg-white/10" />
                              <div className="absolute bottom-2 left-2 right-2 h-px bg-white/10" />
                            </>
                          )}
                          
                          {/* Shine sur livres finis */}
                          {isFinished && revealed && (
                            <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-transparent rounded-md" />
                          )}
                        </div>
                        
                        {/* LETTRE qui tombe */}
                        <div
                          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                          style={{
                            transform: revealed 
                              ? `translate(-50%, ${(targetBookIndex - i) * 16 * 6.25}px)` // Tombe vers le livre cible
                              : 'translate(-50%, -50%)',
                            transition: 'transform 800ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 600ms',
                            transitionDelay: revealed ? `${i * 50}ms` : '0ms',
                            opacity: revealed && !isFinished ? 0 : 1,
                          }}
                        >
                          <span 
                            className={`
                              text-4xl md:text-5xl font-black
                              ${isFinished && revealed 
                                ? 'text-reed-primary/70' 
                                : 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]'
                              }
                            `}
                          >
                            {letter}
                          </span>
                        </div>
                        
                        {/* Texte final sur livres terminés */}
                        {isFinished && revealed && (
                          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                            <span 
                              className="text-xl md:text-2xl font-black text-reed-primary/70"
                              style={{
                                animation: 'fadeIn 400ms ease-out 800ms both',
                                letterSpacing: '-1px',
                              }}
                            >
                              {i === 8 ? 'DEUX' : 'LIVRES'}
                            </span>
                          </div>
                        )}
                        
                        {/* Tranche */}
                        <div 
                          className={`
                            absolute top-0 -right-1 w-1 h-8 md:h-10
                            rounded-r-md
                            transition-all duration-700
                          `}
                          style={{
                            background: isFinished && revealed 
                              ? 'linear-gradient(180deg, #fff 0%, #F5E6D3 100%)' 
                              : `linear-gradient(180deg, ${colorPalette.to} 0%, ${colorPalette.from} 100%)`,
                            opacity: revealed && !isFinished ? 0 : 1,
                          }}
                        />
                      </div>
                    );
                  })}
                  
                </div>
                
                {!revealed && (
                  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-white/50 text-xs animate-bounce whitespace-nowrap pointer-events-none">
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
                  className="mt-8 text-white/60 hover:text-white/90 text-xs underline underline-offset-4 transition-colors"
                >
                  Recommencer
                </button>
              )}
            </div>
            
            {/* "sont finis" - ESPACE RÉDUIT */}
            <h2 className="text-3xl md:text-4xl lg:text-5xl text-white font-light px-4 leading-relaxed">
              sont finis.
            </h2>
            
            <div className="pt-6">
              <Button 
                size="lg"
                className="bg-white hover:bg-white/95 text-reed-primary px-14 py-7 text-2xl md:text-3xl font-bold rounded-full shadow-2xl hover:scale-105 transition-all duration-300"
                asChild
              >
                <Link to="/auth">Finir mes livres</Link>
              </Button>
            </div>
            
            <div className="pt-10 px-4">
              <p className="text-xl md:text-2xl lg:text-3xl text-white/90 font-serif italic leading-relaxed">
                Si ce n'est pas sur VREAD,
                <br />
                tu ne l'as pas lu.
              </p>
            </div>
            
          </div>
        </div>
        
        {/* Footer */}
        <footer className="py-8 px-6 border-t border-white/10">
          <div className="max-w-2xl mx-auto">
            <nav className="flex items-center justify-center gap-8 text-sm">
              <Link to="/blog" className="text-white/50 hover:text-white/90 transition-colors duration-200 font-light">
                Blog
              </Link>
              <span className="text-white/20">·</span>
              <Link to="/press" className="text-white/50 hover:text-white/90 transition-colors duration-200 font-light">
                Presse
              </Link>
              <span className="text-white/20">·</span>
              <Link to="/about" className="text-white/50 hover:text-white/90 transition-colors duration-200 font-light">
                Contact
              </Link>
            </nav>
          </div>
        </footer>
        
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
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
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
