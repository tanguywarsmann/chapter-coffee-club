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

  // Couleurs des livres - palette VREAD harmonieuse
  const bookColors = [
    { from: '#B85C38', to: '#8B4513' },    // Terracotta → Marron
    { from: '#D2691E', to: '#A0522D' },    // Chocolat → Sienna
    { from: '#CD853F', to: '#8B7355' },    // Tan → Beige foncé
    { from: '#DEB887', to: '#D2B48C' },    // Beige → Tan clair
    { from: '#C19A6B', to: '#996633' },    // Caramel → Marron moyen
    { from: '#B8956A', to: '#8B7355' },    // Sable → Beige
    { from: '#A0826D', to: '#704214' },    // Taupe → Marron foncé
    { from: '#BC987E', to: '#9C6644' },    // Beige rosé → Terre
    { from: '#C9A875', to: '#A67B5B' },    // Biscuit → Caramel foncé
    { from: '#B0926A', to: '#8B6F47' },    // Sable doré → Marron clair
  ];

  return (
    <>
      <Helmet>
        <title>VREAD — Si ce n'est pas sur VREAD, tu ne l'as pas lu</title>
        <meta name="description" content="Sur 10 livres achetés, seulement 2 sont finis." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-reed-primary to-reed-secondary flex flex-col">
        
        {/* Contenu principal */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-2xl space-y-20 text-center">
            
            {/* Logo premium avec cadre élégant */}
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-radial from-white/30 via-white/10 to-transparent blur-3xl scale-150 animate-pulse" />
              <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-[2rem] p-10 border-2 border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
                <LogoVreadPng size={140} />
              </div>
            </div>
            
            {/* Titre */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl text-white font-light px-4 leading-relaxed">
              Sur 10 livres achetés,
              <br />
              seulement
            </h1>
            
            {/* Pile + Confettis */}
            <div className="py-8 relative">
              
              {/* Confettis mobile only */}
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
                {/* Container pile compact */}
                <div className="relative mx-auto w-20 h-36 md:w-24 md:h-40">
                  
                  {/* 10 livres avec couleurs harmonieuses */}
                  {Array.from({ length: 10 }).map((_, i) => {
                    const isFinished = i === 1 || i === 7;
                    const stackIndex = 9 - i;
                    const colorPalette = bookColors[i];
                    
                    return (
                      <div
                        key={i}
                        className="absolute left-1/2 -translate-x-1/2 transition-all duration-700"
                        style={{
                          bottom: revealed 
                            ? (isFinished ? `${(i === 1 ? 0 : 32)}px` : '-100px')
                            : `${stackIndex * 12}px`, // Réduit de 19px à 12px
                          opacity: revealed ? (isFinished ? 1 : 0) : 0.95 - (stackIndex * 0.03),
                          zIndex: 10 - stackIndex,
                          transform: revealed && !isFinished 
                            ? `translateX(${-50 + (i * 30 - 150)}%) translateY(100px) rotate(${i * 20 - 90}deg) scale(0.7)`
                            : 'translateX(-50%)',
                        }}
                      >
                        <div className={`
                          w-20 h-6 md:w-24 md:h-7
                          rounded-md
                          transition-all duration-700
                          relative
                          ${isFinished && revealed
                            ? 'bg-gradient-to-br from-white via-amber-50 to-white shadow-[0_6px_30px_rgba(238,220,200,0.9),0_0_40px_rgba(238,220,200,0.6),0_0_3px_rgba(255,255,255,1)] border-2 border-amber-100/70' 
                            : `shadow-[0_3px_12px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.1)] border border-white/10`
                          }
                        `}
                        style={{
                          background: isFinished && revealed 
                            ? undefined 
                            : `linear-gradient(135deg, ${colorPalette.from} 0%, ${colorPalette.to} 100%)`
                        }}
                        >
                          {/* Détails du dos de livre */}
                          <div className={`
                            absolute inset-y-1 left-1.5 right-1.5 
                            border-l border-r 
                            ${isFinished && revealed ? 'border-amber-200/40' : 'border-white/10'}
                          `} />
                          
                          {/* Lignes horizontales décoratives */}
                          <div className={`absolute top-1.5 left-1.5 right-1.5 h-px ${isFinished && revealed ? 'bg-amber-200/30' : 'bg-white/10'}`} />
                          <div className={`absolute bottom-1.5 left-1.5 right-1.5 h-px ${isFinished && revealed ? 'bg-amber-200/30' : 'bg-white/10'}`} />
                          
                          {/* Checkmark sur livres finis */}
                          {isFinished && revealed && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <svg className="w-4 h-4 text-reed-primary/60" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                          
                          {/* Shine effect sur livres finis */}
                          {isFinished && revealed && (
                            <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent rounded-md" />
                          )}
                        </div>
                        
                        {/* Tranche du livre */}
                        <div 
                          className={`
                            absolute top-0 -right-1 w-1 h-6 md:h-7
                            rounded-r-md
                            transition-all duration-700
                            ${isFinished && revealed ? 'bg-amber-100/90' : ''}
                          `}
                          style={{
                            background: isFinished && revealed 
                              ? undefined 
                              : `linear-gradient(180deg, ${colorPalette.to} 0%, ${colorPalette.from} 100%)`
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
        
        {/* Footer discret et élégant */}
        <footer className="py-8 px-6 border-t border-white/10">
          <div className="max-w-2xl mx-auto">
            <nav className="flex items-center justify-center gap-8 text-sm">
              <Link 
                to="/blog" 
                className="text-white/50 hover:text-white/90 transition-colors duration-200 font-light"
              >
                Blog
              </Link>
              <span className="text-white/20">·</span>
              <Link 
                to="/press" 
                className="text-white/50 hover:text-white/90 transition-colors duration-200 font-light"
              >
                Presse
              </Link>
              <span className="text-white/20">·</span>
              <Link 
                to="/about" 
                className="text-white/50 hover:text-white/90 transition-colors duration-200 font-light"
              >
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
