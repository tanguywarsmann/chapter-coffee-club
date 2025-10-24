import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import LogoVreadPng from "@/components/brand/LogoVreadPng";
import { useState, useEffect } from "react";
import confetti from 'canvas-confetti';

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

  const triggerConfetti = () => {
    confetti({
      particleCount: 200,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#3b82f6', '#f59e0b']
    });
    
    if (window.confetti) {
      setTimeout(() => {
        window.confetti({
          particleCount: 100,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
      }, 500);
    }
  };

  return (
    <>
      <Helmet>
        <title>VREAD — Si ce n'est pas sur VREAD, tu ne l'as pas lu</title>
        <meta name="description" content="En moyenne, sur 10 livres achetés, on finit seulement 2 livres." />
      </Helmet>

      {/* Container principal - overflow différent mobile/desktop */}
      <div className="min-h-screen bg-gradient-to-br from-reed-primary to-reed-secondary flex flex-col overflow-x-hidden md:overflow-x-visible">
        
        <div className="flex-1 flex items-center justify-center px-4 md:px-6 py-8 w-full">
          <div className="w-full max-w-4xl space-y-8 text-center flex flex-col items-center">
            
            {/* Logo */}
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-white/20 blur-3xl animate-pulse" />
              <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-8 md:p-10 border-2 border-white/20 shadow-2xl">
                <LogoVreadPng size={120} className="md:w-[140px]" />
              </div>
            </div>
            
            {/* Titre */}
            <h1 className="text-hero text-white font-serif text-center w-full">
              En moyenne,
              <br />
              sur dix livres achetés,
              <br />
              on finit seulement
            </h1>
            
            {/* Pile */}
            <div 
              className="py-8 cursor-pointer flex flex-col items-center w-full"
              onClick={() => {
                setRevealed(true);
                triggerConfetti();
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                setRevealed(true);
                triggerConfetti();
              }}
            >
              <div className="relative mx-auto" style={{ width: '200px', height: '300px' }}>
                
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
                          ? (shouldStay ? (isBottom ? '0px' : '60px') : '-120px')
                          : `${(9-i) * 26}px`,
                        opacity: revealed && !shouldStay ? 0 : 1,
                      }}
                    >
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
                        {!revealed && (
                          <>
                            <div className="absolute top-3 left-4 right-4 h-px bg-white/20" />
                            <div className="absolute bottom-3 left-4 right-4 h-px bg-white/20" />
                          </>
                        )}
                        
                        <span
                          className="font-bold transition-all duration-700"
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
                        
                        {shouldStay && revealed && (
                          <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-transparent rounded-xl pointer-events-none" />
                        )}
                      </div>
                      
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
                <p className="text-white/60 text-body-sm mt-10 animate-bounce text-center w-full">
                  {isMobile ? 'Touche pour révéler' : 'Clique pour révéler'}
                </p>
              )}

              {revealed && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setRevealed(false);
                  }}
                  className="text-white/70 hover:text-white text-body-sm underline underline-offset-4 mt-10 transition-colors"
                >
                  Recommencer
                </button>
              )}
            </div>
            
            {/* Texte final */}
            <h2 className="text-hero text-white font-serif text-center w-full">
              Avec Vread,
              <br />
              tu les finis tous.
            </h2>
            
            {/* CTA - ÉLARGI SUR MOBILE */}
            <div className="pt-16 w-full flex flex-col items-center gap-6">
         <Button
  size="lg"
  className="group relative bg-[#E8DCC8] hover:bg-[#E8DCC8] text-[#6B4423] px-12 sm:px-20 md:px-28 lg:px-36 py-7 sm:py-8 md:py-10 lg:py-11 text-xl sm:text-3xl md:text-5xl lg:text-5xl font-bold rounded-full shadow-[0_25px_80px_rgba(0,0,0,0.4)] hover:shadow-[0_30px_100px_rgba(0,0,0,0.5)] hover:scale-105 transition-all duration-300 border-2 border-[#D4C4B0] whitespace-nowrap w-[90%] sm:w-auto max-w-full"
  asChild
>
  <Link to="/auth" className="flex items-center justify-center">
    <span className="relative z-10">Commence gratuitement</span>
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
  </Link>
</Button>
            </div>
            
            {/* Slogan */}
            <div className="pt-20 pb-12 w-full flex justify-center px-4">
              <div className="relative inline-block w-full max-w-4xl">
                <div className="absolute inset-0 bg-reed-primary/30 blur-3xl scale-150" />
                
                <div className="relative bg-gradient-to-br from-reed-primary/80 to-reed-secondary/80 backdrop-blur-sm rounded-2xl md:rounded-[2rem] px-8 md:px-16 py-10 md:py-14 border-2 border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
                  <p className="text-h2 font-serif text-center">
                    <span className="text-white/95">Si ce n'est pas sur</span>{' '}
                    <span className="text-white font-bold">Vread</span>
                    <span className="text-white/95">,</span>
                    <br />
                    <span className="text-white/95">tu ne l'as pas lu.</span>
                  </p>
                </div>
              </div>
            </div>
            
          </div>
        </div>
        
        {/* Footer */}
        <footer className="py-12 border-t border-white/10 w-full">
          <nav className="flex flex-wrap items-center justify-center gap-6 md:gap-12 text-body-sm px-4">
            <Link to="/blog" className="text-white/50 hover:text-white transition-colors">
              Blog
            </Link>
            <span className="text-white/30 text-xl md:text-2xl">·</span>
            <Link to="/press" className="text-white/50 hover:text-white transition-colors">
              Presse
            </Link>
            <span className="text-white/30 text-xl md:text-2xl">·</span>
            <Link to="/about" className="text-white/50 hover:text-white transition-colors">
              Contact
            </Link>
          </nav>
        </footer>
        
      </div>
    </>
  );
}
