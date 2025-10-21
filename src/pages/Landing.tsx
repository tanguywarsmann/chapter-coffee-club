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
          <div className="w-full max-w-2xl space-y-6 text-center">
            
            {/* Logo */}
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-white/20 blur-3xl animate-pulse" />
              <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-8 border-2 border-white/20">
                <LogoVreadPng size={120} />
              </div>
            </div>
            
            {/* Titre */}
            <h1 className="text-3xl md:text-5xl text-white font-light leading-relaxed">
              Sur 10 livres achetés, seulement
            </h1>
            
            {/* Pile - SIMPLIFIÉ */}
            <div 
              className="py-6 cursor-pointer"
              onClick={() => setRevealed(true)}
              onTouchStart={(e) => {
                e.preventDefault();
                setRevealed(true);
              }}
            >
              <div className="relative mx-auto" style={{ width: '160px', height: '280px' }}>
                
                {/* 10 livres */}
                {[0,1,2,3,4,5,6,7,8,9].map((i) => {
                  const isBottom = i === 8;
                  const isTop = i === 9;
                  const shouldStay = isBottom || isTop;
                  
                  return (
                    <div
                      key={i}
                      className="absolute left-0 right-0 transition-all duration-700"
                      style={{
                        bottom: revealed 
                          ? (shouldStay ? (isBottom ? '0px' : '42px') : '-100px')
                          : `${(9-i) * 24}px`,
                        opacity: revealed && !shouldStay ? 0 : 1,
                      }}
                    >
                      {/* Livre */}
                      <div 
                        className="w-full h-10 rounded-lg flex items-center justify-center relative border-2"
                        style={{
                          backgroundColor: shouldStay && revealed ? '#FFFFFF' : bookColors[i],
                          borderColor: shouldStay && revealed ? '#EEDCC8' : 'rgba(255,255,255,0.2)',
                          boxShadow: shouldStay && revealed 
                            ? '0 8px 40px rgba(238,220,200,0.8)' 
                            : '0 4px 12px rgba(0,0,0,0.3)',
                        }}
                      >
                        {/* Lignes décoratives */}
                        {!revealed && (
                          <>
                            <div className="absolute top-2 left-3 right-3 h-px bg-white/20" />
                            <div className="absolute bottom-2 left-3 right-3 h-px bg-white/20" />
                          </>
                        )}
                        
                        {/* Lettre AVANT reveal OU texte APRÈS */}
                        <span 
                          className="text-4xl font-black transition-all duration-500"
                          style={{
                            color: shouldStay && revealed ? '#B85C38' : '#FFFFFF',
                            textShadow: !revealed ? '0 2px 4px rgba(0,0,0,0.5)' : 'none',
                          }}
                        >
                          {revealed && shouldStay 
                            ? (isBottom ? 'LIVRES' : 'DEUX')
                            : letters[i]
                          }
                        </span>
                      </div>
                      
                      {/* Tranche */}
                      <div 
                        className="absolute -right-2 top-0 w-2 h-10 rounded-r-lg transition-opacity duration-700"
                        style={{
                          backgroundColor: shouldStay && revealed ? '#F5E6D3' : bookColors[i],
                          opacity: revealed && !shouldStay ? 0 : 1,
                        }}
                      />
                    </div>
                  );
                })}
                
              </div>
              
              {!revealed && (
                <p className="text-white/50 text-sm mt-6 animate-bounce">
                  {isMobile ? 'Touche la pile' : 'Clique sur la pile'}
                </p>
              )}
              
              {revealed && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setRevealed(false);
                  }}
                  className="text-white/60 hover:text-white text-sm underline mt-6"
                >
                  Recommencer
                </button>
              )}
            </div>
            
            {/* Texte final */}
            <h2 className="text-3xl md:text-5xl text-white font-light">
              sont finis.
            </h2>
            
            {/* CTA */}
            <div className="pt-6">
              <Button 
                size="lg"
                className="bg-white hover:bg-white/95 text-reed-primary px-14 py-8 text-3xl font-bold rounded-full shadow-2xl hover:scale-105 transition-all"
                asChild
              >
                <Link to="/auth">Finir mes livres</Link>
              </Button>
            </div>
            
            {/* Slogan */}
            <div className="pt-10">
              <p className="text-2xl md:text-3xl text-white/90 font-serif italic leading-relaxed">
                Si ce n'est pas sur VREAD,
                <br />
                tu ne l'as pas lu.
              </p>
            </div>
            
          </div>
        </div>
        
        {/* Footer */}
        <footer className="py-8 border-t border-white/10">
          <nav className="flex items-center justify-center gap-8 text-sm">
            <Link to="/blog" className="text-white/50 hover:text-white transition-colors">Blog</Link>
            <span className="text-white/20">·</span>
            <Link to="/press" className="text-white/50 hover:text-white transition-colors">Presse</Link>
            <span className="text-white/20">·</span>
            <Link to="/about" className="text-white/50 hover:text-white transition-colors">Contact</Link>
          </nav>
        </footer>
        
      </div>
    </>
  );
}
