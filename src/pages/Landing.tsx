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
          <div className="w-full max-w-4xl space-y-8 text-center">
            
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
            
            {/* Pile - 10 LIVRES EMPILÉS */}
            <div 
              className="py-8 cursor-pointer"
              onClick={() => setRevealed(true)}
              onTouchStart={(e) => {
                e.preventDefault();
                setRevealed(true);
              }}
            >
              <div className="relative mx-auto" style={{ width: '200px', height: '300px' }}>
                
                {/* 10 livres TOUS empilés au début */}
                {[0,1,2,3,4,5,6,7,8,9].map((i) => {
                  const isBottom = i === 8; // LIVRES
                  const isTop = i === 9;    // DEUX
                  const shouldStay = isBottom || isTop;
                  
                  return (
                    <div
                      key={i}
                      className="absolute left-0 right-0 transition-all duration-700"
                      style={{
                        // AVANT : pile normale de 10 livres
                        // APRÈS : 2 livres aux positions finales, 8 disparaissent
                        bottom: revealed 
                          ? (shouldStay ? (isBottom ? '0px' : '60px') : '-120px')
                          : `${(9-i) * 26}px`, // ✅ Pile de 10 livres espacés de 26px
                        opacity: revealed && !shouldStay ? 0 : 1,
                      }}
                    >
                      {/* Livre */}
                      <div 
                        className="w-full h-14 rounded-xl flex items-center justify-center relative border-2 transition-all duration-700"
                        style={{
                          backgroundColor: shouldStay && revealed ? '#FFFFFF' : bookColors[i],
                          borderColor: shouldStay && revealed ? '#EEDCC8' : 'rgba(255,255,255,0.2)',
                          boxShadow: shouldStay && revealed 
                            ? '0 15px 60px rgba(238,220,200,1), 0 0 100px rgba(238,220,200,0.8)' 
                            : '0 5px 20px rgba(0,0,0,0.4)',
                        }}
                      >
                        {/* Lignes décoratives */}
                        {!revealed && (
                          <>
                            <div className="absolute top-3 left-4 right-4 h-px bg-white/20" />
                            <div className="absolute bottom-3 left-4 right-4 h-px bg-white/20" />
                          </>
                        )}
                        
                        {/* Lettre OU mot final */}
                        <span 
                          className="font-black transition-all duration-700"
                          style={{
                            color: shouldStay && revealed ? '#B85C38' : '#FFFFFF',
                            textShadow: !revealed ? '0 3px 8px rgba(0,0,0,0.7)' : 'none',
                            fontSize: revealed && shouldStay ? '32px' : '56px',
                            letterSpacing: revealed && shouldStay ? '-1px' : '0px',
                          }}
                        >
                          {revealed && shouldStay 
                            ? (isBottom ? 'LIVRES' : 'DEUX')
                            : letters[i]
                          }
                        </span>
                        
                        {/* Shine */}
                        {shouldStay && revealed && (
                          <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-transparent rounded-xl pointer-events-none" />
                        )}
                      </div>
                      
                      {/* Tranche 3D */}
                      <div 
                        className="absolute -right-2.5 top-0 w-2.5 h-14 rounded-r-xl transition-all duration-700"
                        style={{
                          backgroundColor: shouldStay && revealed ? '#F5E6D3' : bookColors[i],
                          opacity: revealed && !shouldStay ? 0 : 1,
                          boxShadow: '3px 0 10px rgba(0,0,0,0.4)',
                        }}
                      />
                    </div>
                  );
                })}
                
              </div>
              
              {!revealed && (
                <p className="text-white/60 text-lg mt-10 animate-bounce font-light">
                  {isMobile ? 'Touche pour révéler' : 'Clique pour révéler'}
                </p>
              )}
              
              {revealed && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setRevealed(false);
                  }}
                  className="text-white/70 hover:text-white text-lg underline underline-offset-4 mt-10 transition-colors font-light"
                >
                  Recommencer
                </button>
              )}
            </div>
            
            {/* Texte final */}
            <h2 className="text-4xl md:text-5xl lg:text-6xl text-white font-light px-4">
              sont finis.
            </h2>
            
            {/* CTA ULTRA-MASSIF */}
            <div className="pt-12">
              <Button 
                size="lg"
                className="group relative bg-white hover:bg-white text-reed-primary px-24 py-12 text-5xl md:text-6xl font-black rounded-full shadow-[0_25px_80px_rgba(0,0,0,0.4)] hover:shadow-[0_30px_100px_rgba(0,0,0,0.5)] hover:scale-110 transition-all duration-300 border-4 border-amber-200"
                asChild
              >
                <Link to="/auth">
                  <span className="relative z-10 drop-shadow-lg">Finir mes livres</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-100 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
                </Link>
              </Button>
            </div>
            
            {/* Slogan ULTRA-VISIBLE */}
            <div className="pt-20 pb-12">
              <div className="relative inline-block max-w-4xl">
                {/* Halo massif */}
                <div className="absolute inset-0 bg-gradient-radial from-white/20 via-white/5 to-transparent blur-3xl scale-[2]" />
                
                {/* Cadre premium */}
                <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-[2rem] px-16 py-14 border-2 border-white/30 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
                  <p className="text-4xl md:text-5xl lg:text-6xl text-white font-serif leading-relaxed">
                    Si ce n'est pas sur{' '}
                    <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-reed-light to-amber-300 drop-shadow-[0_2px_10px_rgba(238,220,200,0.8)]">
                      VREAD
                    </span>
                    ,
                    <br />
                    <span className="text-white/90">tu ne l'as pas lu.</span>
                  </p>
                </div>
              </div>
            </div>
            
          </div>
        </div>
        
        {/* Footer */}
        <footer className="py-12 border-t border-white/10">
          <nav className="flex items-center justify-center gap-12 text-lg">
            <Link to="/blog" className="text-white/50 hover:text-white transition-colors font-light">
              Blog
            </Link>
            <span className="text-white/30 text-2xl">·</span>
            <Link to="/press" className="text-white/50 hover:text-white transition-colors font-light">
              Presse
            </Link>
            <span className="text-white/30 text-2xl">·</span>
            <Link to="/about" className="text-white/50 hover:text-white transition-colors font-light">
              Contact
            </Link>
          </nav>
        </footer>
        
      </div>
    </>
  );
}
