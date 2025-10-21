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

  // Lettres initiales désordonnées
  const letters = ['D', 'E', 'U', 'X', 'L', 'I', 'V', 'R', 'E', 'S'];
  
  // Couleurs riches et variées pour livres reconnaissables
  const bookColors = [
    { from: '#8B2500', to: '#5C1800', spine: '#6B1E00' },     // Rouge brique
    { from: '#CD7F32', to: '#8B5A2B', spine: '#A0683C' },     // Bronze
    { from: '#2F4F4F', to: '#1C3030', spine: '#254040' },     // Vert forêt
    { from: '#8B4513', to: '#5C2E0F', spine: '#6B3410' },     // Marron chocolat
    { from: '#4A5D23', to: '#2F3B17', spine: '#3A4C1D' },     // Olive
    { from: '#800020', to: '#5C0017', spine: '#6B001B' },     // Bordeaux
    { from: '#6B4423', to: '#4A2F18', spine: '#56391D' },     // Caramel foncé
    { from: '#556B2F', to: '#3A4720', spine: '#475927' },     // Vert olive foncé
    { from: '#704214', to: '#4A2C0E', spine: '#5A3411' },     // Terre de sienne
    { from: '#8B6914', to: '#5C4609', spine: '#6B560E' },     // Or antique
  ];

  // Positions initiales désordonnées (chaos)
  const initialPositions = [
    { x: -30, y: -20, rotation: -35, scale: 0.85 },
    { x: 25, y: -15, rotation: 48, scale: 0.92 },
    { x: -18, y: 18, rotation: -62, scale: 0.88 },
    { x: 32, y: 12, rotation: 25, scale: 0.95 },
    { x: -25, y: -8, rotation: 72, scale: 0.90 },
    { x: 15, y: 22, rotation: -18, scale: 0.87 },
    { x: -35, y: 15, rotation: 45, scale: 0.93 },
    { x: 28, y: -18, rotation: -55, scale: 0.89 },
    { x: -12, y: 25, rotation: 38, scale: 0.91 },
    { x: 20, y: -25, rotation: -42, scale: 0.86 },
  ];

  return (
    <>
      <Helmet>
        <title>VREAD — Si ce n'est pas sur VREAD, tu ne l'as pas lu</title>
        <meta name="description" content="Sur 10 livres achetés, seulement 2 sont finis." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-reed-primary to-reed-secondary flex flex-col">
        
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-3xl space-y-12 text-center">
            
            {/* Logo */}
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
            
            {/* Zone magique avec livres */}
            <div className="py-8 relative">
              
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
              
              {/* Zone interactive magique */}
              <div 
                className="relative cursor-pointer select-none outline-none transition-transform hover:scale-[1.02]"
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
                aria-label="Cliquer pour réorganiser les livres"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                {/* Container central */}
                <div className="relative mx-auto w-full h-96 md:h-[28rem] flex items-center justify-center">
                  
                  {/* 10 livres avec effet magique */}
                  {Array.from({ length: 10 }).map((_, i) => {
                    const isFinished = i === 3 || i === 7; // Livres qui restent
                    const colorPalette = bookColors[i];
                    const letter = letters[i];
                    const initialPos = initialPositions[i];
                    
                    // Texte final après reveal
                    const finalText = revealed && isFinished 
                      ? (i === 3 ? '2' : 'LIVRES')
                      : letter;
                    
                    return (
                      <div
                        key={i}
                        className="absolute transition-all duration-[1200ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                        style={{
                          left: revealed ? '50%' : `calc(50% + ${initialPos.x}%)`,
                          top: revealed 
                            ? (isFinished ? (i === 3 ? '55%' : '40%') : '50%')
                            : `calc(50% + ${initialPos.y}%)`,
                          transform: revealed
                            ? (isFinished 
                                ? 'translate(-50%, -50%) rotate(0deg) scale(1)' 
                                : `translate(-50%, -50%) rotate(${initialPos.rotation * 2}deg) scale(0) translateY(200px)`)
                            : `translate(-50%, -50%) rotate(${initialPos.rotation}deg) scale(${initialPos.scale})`,
                          opacity: revealed ? (isFinished ? 1 : 0) : 0.95,
                          zIndex: revealed && isFinished ? 20 : 10 - i,
                        }}
                      >
                        {/* Livre en 3D */}
                        <div className="relative">
                          {/* Corps du livre */}
                          <div 
                            className={`
                              w-48 h-16 md:w-56 md:h-20
                              rounded-lg
                              transition-all duration-1000
                              relative
                              flex items-center justify-center
                              ${isFinished && revealed
                                ? 'bg-gradient-to-br from-white via-amber-50 to-white shadow-[0_12px_50px_rgba(238,220,200,1),0_0_80px_rgba(238,220,200,0.9),0_0_6px_rgba(255,255,255,1)] border-3 border-amber-200' 
                                : 'shadow-[0_6px_20px_rgba(0,0,0,0.4),inset_0_3px_0_rgba(255,255,255,0.2),inset_0_-2px_0_rgba(0,0,0,0.3)] border-2 border-white/20'
                              }
                            `}
                            style={{
                              background: isFinished && revealed 
                                ? undefined 
                                : `linear-gradient(135deg, ${colorPalette.from} 0%, ${colorPalette.to} 100%)`,
                            }}
                          >
                            {/* Détails du livre (rainures) */}
                            <div className={`absolute inset-y-3 left-4 right-4 border-l-2 border-r-2 ${isFinished && revealed ? 'border-amber-300/30' : 'border-white/15'}`} />
                            <div className={`absolute top-4 left-4 right-4 h-px ${isFinished && revealed ? 'bg-amber-300/30' : 'bg-white/20'}`} />
                            <div className={`absolute bottom-4 left-4 right-4 h-px ${isFinished && revealed ? 'bg-amber-300/30' : 'bg-white/20'}`} />
                            
                            {/* LETTRE ou TEXTE FINAL */}
                            <div 
                              className={`
                                font-black
                                transition-all duration-1000
                                ${isFinished && revealed 
                                  ? 'text-reed-primary/70' 
                                  : 'text-white drop-shadow-[0_3px_6px_rgba(0,0,0,0.6)]'
                                }
                              `}
                              style={{
                                fontSize: revealed && isFinished 
                                  ? (i === 3 ? '72px' : '28px') 
                                  : '56px',
                                letterSpacing: revealed && isFinished && finalText.length > 1 ? '-1px' : '0px',
                              }}
                            >
                              {finalText}
                            </div>
                            
                            {/* Effet brillance livre terminé */}
                            {isFinished && revealed && (
                              <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-transparent to-transparent rounded-lg pointer-events-none" />
                            )}
                          </div>
                          
                          {/* Tranche 3D (épaisseur) */}
                          <div 
                            className={`
                              absolute top-0 -right-3 w-3 h-16 md:h-20
                              rounded-r-lg
                              transition-all duration-1000
                            `}
                            style={{
                              background: isFinished && revealed 
                                ? 'linear-gradient(180deg, #fff 0%, #F5E6D3 100%)' 
                                : `linear-gradient(180deg, ${colorPalette.spine} 0%, ${colorPalette.to} 100%)`,
                              boxShadow: '3px 0 12px rgba(0,0,0,0.3)',
                            }}
                          />
                          
                          {/* Tranche bas (effet 3D) */}
                          <div 
                            className={`
                              absolute -bottom-2 left-0 right-0 h-2
                              rounded-b-lg
                              transition-all duration-1000
                            `}
                            style={{
                              background: isFinished && revealed 
                                ? 'linear-gradient(90deg, #F5E6D3 0%, #EEDCC8 100%)' 
                                : `linear-gradient(90deg, ${colorPalette.to} 0%, ${colorPalette.from} 50%, ${colorPalette.to} 100%)`,
                              boxShadow: '0 4px 8px rgba(0,0,0,0.4)',
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  
                </div>
                
                {!revealed && (
                  <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 text-white/50 text-sm animate-bounce whitespace-nowrap pointer-events-none">
                    {isMobile ? 'Touche pour réorganiser' : 'Clique pour réorganiser'}
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
                  className="mt-12 text-white/60 hover:text-white/90 text-sm underline underline-offset-4 transition-colors"
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
