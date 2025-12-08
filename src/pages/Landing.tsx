import LogoVreadPng from "@/components/brand/LogoVreadPng";
import { CertificationDemo } from "@/components/landing/CertificationDemo";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { SocialProof } from "@/components/landing/SocialProof";
import { ValueSection } from "@/components/landing/ValueSection";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/i18n/LanguageContext";
import { getDisplayName } from "@/services/user/userProfileService";
import { isIOSNative } from "@/utils/platform";

import { motion } from "framer-motion";
import { ArrowRight, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Landing() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [displayName, setDisplayName] = useState<string>("");

  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS

  // Calculate display name
  useEffect(() => {
    if (user) {
      const name = getDisplayName(
        (user as any).user_metadata?.username || (user as any).username,
        user.email,
        user.id
      );
      setDisplayName(name);
    }
  }, [user]);

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


  // NATIVE IOS ENTRY - conditional return AFTER all hooks
  if (isIOSNative()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-reed-primary to-reed-secondary flex flex-col items-center justify-center p-6 overflow-hidden relative">
        {/* Background Texture */}
        <div className="fixed inset-0 opacity-[0.02] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIvPjwvc3ZnPg==')] bg-repeat" />

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-sm"
        >
          <Card className="border-0 bg-white/10 backdrop-blur-xl shadow-2xl p-8 text-center flex flex-col gap-6 ring-1 ring-white/20 rounded-3xl">
            <div className="space-y-2">
              <h1 className="text-2xl font-serif font-bold text-white leading-tight">
                {t.onboardingIOS.title}
              </h1>
              <p className="text-white/80 text-body">
                {t.onboardingIOS.subtitle}
              </p>
            </div>

            <div className="flex flex-col gap-4 pt-2">
              <Link to="/auth?mode=signup" className="w-full">
                <Button className="w-full bg-white text-reed-primary hover:bg-white/90 font-bold py-6 text-lg shadow-lg transition-transform active:scale-95 rounded-xl">
                  {t.onboardingIOS.primaryCta}
                </Button>
              </Link>
              
              <Link to="/auth?mode=login" className="block w-full">
                <button className="text-white/60 text-sm hover:text-white transition-colors py-2">
                  J'ai déjà un compte
                </button>
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Main web rendering
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
        <div className="absolute top-[calc(1rem+env(safe-area-inset-top))] right-4 z-50">
          <LanguageToggle />
        </div>

        {/* Logged in badge in top left */}
        {user && (
          <Link to="/home" className="absolute top-[calc(1rem+env(safe-area-inset-top))] left-4 z-50">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 shadow-lg hover:bg-white/20 transition-colors">
              <User className="w-4 h-4 text-white" />
              <span className="text-sm font-bold text-white tracking-wide truncate max-w-[150px]">
                {displayName}
              </span>
            </div>
          </Link>
        )}

        <div className="flex-1 flex items-center justify-center px-4 md:px-6 py-8 w-full">
          <div className="w-full max-w-4xl space-y-8 text-center flex flex-col items-center">

            {/* Logo */}
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-white/20 blur-3xl animate-pulse" />
              <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-6 md:p-8 border-2 border-white/20 shadow-2xl">
                <LogoVreadPng size={100} className="md:w-[120px]" />
              </div>
            </div>

            {/* Badge Strava */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-6"
              style={{
                background: 'rgba(255,255,255,0.12)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
              }}
            >
              <span className="text-white/90 font-medium tracking-wide">
                {t.landing.stravaBadge}
              </span>
            </motion.div>

            {/* Slogan Principal (HERO) */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-center w-full leading-tight"
              style={{
                color: 'white',
                textShadow: '0 4px 20px rgba(0,0,0,0.3)'
              }}
            >
              <span className="block">{t.landing.heroSlogan}</span>
              <span className="block">{t.landing.heroSlogan2}</span>
            </motion.h1>

            {/* Sous-titre + Social Proof */}
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-white/90 text-lg md:text-xl mt-6 max-w-lg mx-auto leading-relaxed font-medium"
              style={{ textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
            >
              {t.landing.heroSubtitle}
              <br />
              <span className="text-white/70">{t.landing.socialProof}</span>
            </motion.p>


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
                to={user ? "/home" : "/auth"}
                onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}
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
                <span className="relative z-10">{user ? "CONTINUER MA LECTURE" : t.landing.cta}</span>
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

              {/* CTA Subtext */}
              <p className="text-white/60 text-sm mt-3">
                {t.landing.ctaSubtext}
              </p>
            </motion.div>

            {/* Animation Certification en Direct */}
            <CertificationDemo />

            {/* Section Comment ça marche */}
            <HowItWorks />

            {/* Section Valeur VREAD */}
            <ValueSection />

            {/* Section Social Proof */}
            <SocialProof />

          </div>
        </div>

        {/* Footer */}
        <footer className="py-12 border-t border-white/10 w-full">
          <nav className="flex flex-wrap items-center justify-center gap-6 md:gap-12 text-body-sm px-4">
            <Link to="/blog" className="text-white/70 hover:text-white transition-colors">
              {t.nav.blog}
            </Link>
            <span className="text-white/40 text-xl md:text-2xl">·</span>
            <Link to="/press" className="text-white/70 hover:text-white transition-colors">
              {t.nav.press}
            </Link>
            <span className="text-white/40 text-xl md:text-2xl">·</span>
            <Link to="/about" className="text-white/70 hover:text-white transition-colors">
              {t.nav.contact}
            </Link>
          </nav>
        </footer>

      </div>
    </>
  );
}
