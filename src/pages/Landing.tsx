import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import LogoVreadPng from "@/components/brand/LogoVreadPng";
import { useState, useEffect, useRef } from "react";
import confetti from 'canvas-confetti';
import { useTranslation } from "@/i18n/LanguageContext";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { ValueSection } from "@/components/landing/ValueSection";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function Landing() {
  const { t } = useTranslation();
  const [revealed, setRevealed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Magnetic CTA effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!ctaRef.current) return;
      const rect = ctaRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const distance = Math.sqrt(x * x + y * y);
      
      if (distance < 150) {
        const strength = (150 - distance) / 150;
        setMousePos({ x: x * strength * 0.15, y: y * strength * 0.15 });
      } else {
        setMousePos({ x: 0, y: 0 });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
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
      <style>{`
        @keyframes gradient-shift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
      `}</style>
      
      <Helmet>
        <title>{t.landing.title}</title>
        <meta name="description" content={t.landing.description} />
      </Helmet>

      {/* Container principal - overflow différent mobile/desktop */}
      <div className="min-h-screen bg-gradient-to-br from-reed-primary to-reed-secondary flex flex-col overflow-x-hidden md:overflow-x-visible">
        
        {/* Language toggle in top right */}
        <div className="absolute top-4 right-4 z-50">
          <LanguageToggle />
        </div>
        
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
              {t.landing.heroTitle1}
              <br />
              {t.landing.heroTitle2}
              <br />
              {t.landing.heroTitle3}
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
                            ? '0 15px 60px rgba(166,123,91,0.6), 0 0 100px rgba(166,123,91,0.4)' 
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
                            ? (isBottom ? t.landing.twoBooks.split(' ')[1] : t.landing.twoBooks.split(' ')[0])
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
                  {isMobile ? t.landing.touchToReveal : t.landing.clickToReveal}
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
                  {t.landing.restart}
                </button>
              )}
            </div>
            
            {/* Texte final */}
            <h2 className="text-hero text-white font-serif text-center w-full">
              {t.landing.finalTitle1}
              <br />
              {t.landing.finalTitle2}
            </h2>
            
            {/* CTA Magnétique */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="pt-16 w-full flex flex-col items-center gap-6"
            >
              <Link 
                ref={ctaRef}
                to="/auth" 
                className="relative inline-flex items-center gap-3 px-16 py-6 text-2xl font-serif font-bold text-white rounded-full overflow-hidden group transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#A67B5B]/20 focus:ring-offset-4"
                style={{
                  background: 'linear-gradient(135deg, #A67B5B, #8B6F47, #A67B5B)',
                  backgroundSize: '200% 200%',
                  animation: 'gradient-shift 3s ease infinite',
                  boxShadow: `
                    0 20px 60px rgba(166,123,91,0.4),
                    0 10px 30px rgba(166,123,91,0.3)
                  `,
                  transform: `translate(${mousePos.x}px, ${mousePos.y}px)`,
                  textShadow: '0 2px 8px rgba(0,0,0,0.2)'
                }}
              >
                <span className="relative z-10">{t.landing.cta}</span>
                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <ArrowRight className="w-6 h-6 relative z-10" />
                </motion.div>
                
                {/* Overlay hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Particles effect on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-white rounded-full"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0],
                        x: [0, Math.cos(i * 45 * Math.PI / 180) * 40],
                        y: [0, Math.sin(i * 45 * Math.PI / 180) * 40],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.1,
                      }}
                      style={{
                        left: '50%',
                        top: '50%',
                      }}
                    />
                  ))}
                </div>
              </Link>
            </motion.div>
            
            {/* Section Valeur VREAD */}
            <ValueSection />
            
            {/* Slogan 3D avec blob organique */}
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="pt-32 pb-20 w-full flex justify-center px-4 relative"
            >
              {/* Blob organique animé en arrière-plan */}
              <motion.div 
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, 0],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{
                  filter: 'blur(60px)',
                }}
              >
                <div 
                  className="w-[600px] h-[400px]"
                  style={{
                    background: 'radial-gradient(circle, rgba(166,123,91,0.15), transparent)',
                    borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
                  }}
                />
              </motion.div>

              {/* Texte 3D */}
              <motion.h2 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative text-6xl md:text-7xl font-extrabold text-center leading-tight max-w-5xl"
                style={{
                  background: 'linear-gradient(135deg, #FFFFFF, #E8DCC8)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textShadow: `
                    0 1px 0 #C4A287,
                    0 2px 0 #B5977D,
                    0 3px 0 #A67B5B,
                    0 6px 12px rgba(0,0,0,0.15),
                    0 12px 24px rgba(0,0,0,0.1)
                  `,
                }}
              >
                <span className="block">{t.landing.sloganPart1} <span className="font-black">{t.landing.sloganPart2}</span></span>
                <span className="block">{t.landing.sloganPart3}</span>
                <span className="block">{t.landing.sloganPart4}</span>
              </motion.h2>
            </motion.div>
            
          </div>
        </div>
        
        {/* Footer */}
        <footer className="py-12 border-t border-white/10 w-full">
          <nav className="flex flex-wrap items-center justify-center gap-6 md:gap-12 text-body-sm px-4">
            <Link to="/blog" className="text-white/50 hover:text-white transition-colors">
              {t.nav.blog}
            </Link>
            <span className="text-white/30 text-xl md:text-2xl">·</span>
            <Link to="/press" className="text-white/50 hover:text-white transition-colors">
              {t.nav.press}
            </Link>
            <span className="text-white/30 text-xl md:text-2xl">·</span>
            <Link to="/about" className="text-white/50 hover:text-white transition-colors">
              {t.nav.contact}
            </Link>
          </nav>
        </footer>
        
      </div>
    </>
  );
}
