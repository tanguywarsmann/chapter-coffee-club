import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import LogoVreadPng from "@/components/brand/LogoVreadPng";
import { useState, useEffect } from "react";

export default function Landing() {
  const [revealed, setRevealed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const letters = ['D', 'E', 'U', 'X', 'L', 'I', 'V', 'R', 'E', 'S'];
  
  const bookColors = [
    '#8B4513', '#A0522D', '#8B7355', '#996633', '#8B6F47',
    '#704214', '#9C6644', '#A67B5B', '#8B6F47', '#B85C38'
  ];

  return (
    <>
      <Helmet>
        <title>VREAD — Si ce n'est pas sur VREAD, tu ne l'as pas lu</title>
        <meta name="description" content="Sur 10 livres achetés, seulement 2 sont finis." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-reed-primary to-reed-secondary flex flex-col">
        
        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="w-full max-w-3xl space-y-8 text-center">
            
            {/* Logo */}
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-white/20 blur-3xl animate-pulse" />
              <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-10 border-2 border-white/20 shadow-2xl">
                <LogoVreadPng size={140} />
              </div>
            </div>
            
            {/* Titre */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl text-white font-light leading-relaxed px-4">
              Sur 10 livres achetés,
              <br />
              seulement
            </h1>
            
            {/* Pile avec lettres pré-alignées */}
            <div 
              className="py-8 cursor-pointer"
              onClick={() => setRevealed(true)}
              onTouchStart={(e) => {
                e.preventDefault();
                setRevealed(true);
              }}
            >
              <div className="relative mx-auto" style={{ width: '180px', height: '120px' }}>
                
                {/* 10 livres avec lettres pré-alignées en hauteur */}
                {[0,1,2,3,4,5,6,7,8,9].map((i) => {
                  const isBottom = i === 8; // LIVRES
                  const isTop = i === 9;    // DEUX
                  const shouldStay = isBottom || isTop;
                  
                  // Déterminer la hauteur finale de chaque lettre
                  // D(0), E(1), U(2), X(3) → hauteur "DEUX" = 54px
                  // L(4), I(5), V(6), R(7), E(8), S(9) → hauteur "LIVRES" = 0px
                  const isInDeux = i <= 3;
                  const finalHeight = isInDeux ? 54 : 0;
                  
                  return (
                    <div
                      key={i}
                      className="absolute left-0 right-0 transition-all duration-700"
                      style={{
                        bottom: revealed 
                          ? (shouldStay ? (isBottom ? '0px' : '54px') : '-100px')
                          : `${finalHeight}px`, // ✅ PRÉ-ALIGNÉ en hauteur
                        opacity: revealed && !shouldStay ? 0 : 1,
                      }}
                    >
                      {/* Livre */}
                      <div 
                        className="w-full h-12 rounded-xl flex items-center justify-center relative border-2 transition-all duration-700"
                        style={{
                          backgroundColor: shouldStay && revealed ? '#FFFFFF' : bookColors[i],
                          borderColor: shouldStay && revealed ? '#EEDCC8' : 'rgba(255,255,255,0.2)',
                          boxShadow: shouldStay && revealed 
                            ? '0 12px 50px rgba(238,220,200,1), 0 0 80px rgba(238,220,200,0.6)' 
                            : '0 4px 16px rgba(0,0,0,0.4)',
                        }}
                      >
                        {/* Lignes décoratives */}
                        {!revealed && (
                          <>
                            <div className="absolute top-2.5 left-4 right-4 h-px bg-white/20" />
                            <div className="absolute bottom-2.5 left-4 right-4 h-px bg-white/20" />
                          </>
                        )}
                        
                        {/* Lettre OU mot final */}
                        <span 
                          className="text-5xl font-black transition-all duration-700"
                          style={{
                            color: shouldStay && revealed ? '#B85C38' : '#FFFFFF',
                            textShadow: !revealed ? '0 3px 6px rgba(0,0,0,0.6)' : 'none',
                            fontSize: revealed && shouldStay ? '26px' : '48px',
                            letterSpacing: revealed && shouldStay ? '-1px' : '0px',
                          }}
                        >
                          {revealed && shouldStay 
                            ? (isBottom ? 'LIVRES' : 'DEUX')
                            : letters[i]
                          }
                        </span>
                        
                        {/* Shine sur livres blancs */}
                        {shouldStay && revealed && (
                          <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent rounded-xl pointer-events-none" />
                        )}
                      </div>
                      
                      {/* Tranche 3D */}
                      <div 
                        className="absolute -right-2 top-0 w-2 h-12 rounded-r-xl transition-all duration-700"
                        style={{
                          backgroundColor: shouldStay && revealed ? '#F5E6D3' : bookColors[i],
                          opacity: revealed && !shouldStay ? 0 : 1,
                          boxShadow: '2px 0 8px rgba(0,0,0,0.3)',
                        }}
                      />
                    </div>
                  );
                })}
                
              </div>
              
              {!revealed && (
                <p className="text-white/60 text-base mt-8 animate-bounce font-light">
                  {isMobile ? 'Touche pour révéler' : 'Clique pour révéler'}
                </p>
              )}
              
              {revealed && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setRevealed(false);
                  }}
                  className="text-white/70 hover:text-white text-base underline underline-offset-4 mt-8 transition-colors font-light"
                >
                  Recommencer
                </button>
              )}
            </div>
            
            {/* Texte final */}
            <h2 className="text-4xl md:text-5xl lg:text-6xl text-white font-light px-4">
              sont finis.
            </h2>
            
            {/* CTA PREMIUM */}
            <div className="pt-10">
              <Button 
                size="lg"
                className="group relative bg-white hover:bg-white text-reed-primary px-20 py-10 text-4xl font-black rounded-full shadow-[0_20px_60px_rgba(0,0,0,0.3)] hover:shadow-[0_25px_80px_rgba(0,0,0,0.4)] hover:scale-105 transition-all duration-300 border-2 border-reed-light/30"
                asChild
              >
                <Link to="/auth">
                  <span className="relative z-10">Finir mes livres</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </Link>
              </Button>
            </div>
            
            {/* Slogan PREMIUM mis en avant */}
            <div className="pt-16 pb-8">
              <div className="relative inline-block">
                {/* Halo lumineux derrière */}
                <div className="absolute inset-0 bg-gradient-radial from-white/10 via-transparent to-transparent blur-2xl scale-150" />
                
                {/* Cadre élégant */}
                <div className="relative bg-white/5 backdrop-blur-sm rounded-3xl px-12 py-10 border border-white/20 shadow-2xl">
                  <p className="text-3xl md:text-4xl lg:text-5xl text-white font-serif leading-relaxed">
                    Si ce n'est pas sur{' '}
                    <span className="font-black text-reed-light">VREAD</span>,
                    <br />
                    tu ne l'as pas lu.
                  </p>
                </div>
              </div>
            </div>
            
          </div>
        </div>
        
        {/* Footer discret */}
        <footer className="py-10 border-t border-white/10">
          <nav className="flex items-center justify-center gap-10 text-base">
            <Link to="/blog" className="text-white/50 hover:text-white/90 transition-colors font-light">
              Blog
            </Link>
            <span className="text-white/30">·</span>
            <Link to="/press" className="text-white/50 hover:text-white/90 transition-colors font-light">
              Presse
            </Link>
            <span className="text-white/30">·</span>
            <Link to="/about" className="text-white/50 hover:text-white/90 transition-colors font-light">
              Contact
            </Link>
          </nav>
        </footer>
        
      </div>
    </>
  );
}
