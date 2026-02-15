import { isIOSNative } from "@/utils/platform";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Sparkles, Globe } from "lucide-react";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/i18n/LanguageContext";
import { getDisplayName } from "@/services/user/userProfileService";
import { Apple } from "@/components/icons/Apple";
import { Google } from "@/components/icons/Google";

const IOS_URL = "https://apps.apple.com/fr/app/v-read/id6752836822";
const ANDROID_URL = "https://play.google.com/store/apps/details?id=com.vread.app";

export default function Landing() {
  const { t, language, setLanguage } = useTranslation();
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState<string>("");

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

  // NATIVE IOS ENTRY
  if (isIOSNative()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-copper to-copper-light flex flex-col items-center justify-center p-6 overflow-hidden relative">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-sm"
        >
          <Card className="border-0 bg-white/10 backdrop-blur-xl shadow-2xl p-8 text-center flex flex-col gap-6 ring-1 ring-white/20 rounded-3xl">
            <div className="space-y-2">
              <h1 className="text-2xl font-display font-bold text-white leading-tight">
                {t.onboardingIOS.title}
              </h1>
              <p className="text-white/80 text-body font-body">
                {t.onboardingIOS.subtitle}
              </p>
            </div>

            <div className="flex flex-col gap-4 pt-2">
              <Link to="/auth?mode=signup" className="w-full">
                <Button className="w-full bg-white text-copper hover:bg-white/90 font-bold py-6 text-lg shadow-lg transition-transform active:scale-95 rounded-xl">
                  {t.onboardingIOS.primaryCta}
                </Button>
              </Link>
              
              <Link to="/auth?mode=login" className="block w-full">
                <button className="text-white/60 text-sm hover:text-white transition-colors py-2">
                  {t.landing.ios.alreadyAccount}
                </button>
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Main web rendering - New Landing Page
  return (
    <>
      <Helmet>
        <title>VREAD - {t.landing.hero.badge}</title>
        <meta name="description" content={t.landing.hero.subtitle} />
      </Helmet>

      <div className="min-h-screen bg-cream font-body">
        
        {/* ===== NAVIGATION ===== */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-cream/80 backdrop-blur-lg border-b border-beige">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <img src="/images/logo.png" alt="VREAD" className="h-10 w-auto" />
              <span className="text-xl font-display font-semibold text-coffee-darker hidden sm:inline">VREAD</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-coffee-dark hover:text-copper transition-colors font-medium">{t.landing.nav.features}</a>
              <a href="#experience" className="text-coffee-dark hover:text-copper transition-colors font-medium">{t.landing.nav.experience}</a>
              <a href="#community" className="text-coffee-dark hover:text-copper transition-colors font-medium">{t.landing.nav.community}</a>
            </div>

            <div className="flex items-center gap-2">
              <a 
                href={IOS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-coffee-darkest hover:bg-coffee-darker text-white px-4 py-2.5 rounded-full font-medium transition-all duration-300 hover:scale-105 shadow-md text-sm"
              >
                <Apple className="w-4 h-4 fill-current" />
                <span className="hidden sm:inline">iOS</span>
              </a>
              <a 
                href={ANDROID_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-coffee-darkest hover:bg-coffee-darker text-white px-4 py-2.5 rounded-full font-medium transition-all duration-300 hover:scale-105 shadow-md text-sm"
              >
                <Google className="w-4 h-4" />
                <span className="hidden sm:inline">Android</span>
              </a>
            </div>
          </div>
        </nav>

        {/* ===== HERO SECTION ===== */}
        <section className="pt-32 pb-20 md:pt-40 md:pb-32 px-6 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-20 right-0 w-96 h-96 bg-copper/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-gold/5 rounded-full blur-3xl" />
          
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Left content */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="text-center lg:text-left"
              >
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-copper/10 border border-copper/20 rounded-full mb-8">
                  <span className="w-2 h-2 bg-copper rounded-full animate-pulse" />
                  <span className="text-copper font-semibold text-sm">{t.landing.hero.badge}</span>
                </div>

                {/* Main title */}
                <h1 className="text-sculptural font-display text-coffee-darkest mb-6">
                  {t.landing.hero.title}<span className="italic text-copper">{t.landing.hero.titleHighlight}</span>{t.landing.hero.titleEnd}
                </h1>

                {/* Subtitle */}
                <p className="text-lg md:text-xl text-coffee-dark/80 mb-10 max-w-xl mx-auto lg:mx-0 font-body leading-relaxed">
                  {t.landing.hero.subtitle}
                </p>

                {/* CTA Buttons - App Store Links */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-6 relative z-20">
                  <a
                    href="https://apps.apple.com/fr/app/v-read/id6752836822"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative z-30 inline-flex items-center justify-center gap-3 px-6 py-4 bg-coffee-darkest hover:bg-coffee-dark text-white font-bold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl cursor-pointer select-none"
                  >
                    <Apple className="w-6 h-6 fill-current" />
                    <span>App Store</span>
                  </a>
                  <a
                    href="https://play.google.com/store/apps/details?id=com.vread.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative z-30 inline-flex items-center justify-center gap-3 px-6 py-4 bg-coffee-darkest hover:bg-coffee-dark text-white font-bold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl cursor-pointer select-none"
                  >
                    <Google className="w-5 h-5" />
                    <span>Google Play</span>
                  </a>
                </div>

                <Link
                  to="/auth?mode=login"
                  className="inline-block text-coffee-medium/70 hover:text-copper text-sm underline underline-offset-2 transition-colors mt-2 px-4 py-3 relative z-30 pointer-events-auto"
                >
                  {t.landing.hero.desktopLink}
                </Link>

                <p className="text-coffee-medium text-sm mt-2">
                  {t.landing.hero.ctaAvailability}
                </p>
              </motion.div>

              {/* Right - iPhone mockup */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="relative flex justify-center"
              >
                <div className="relative">
                  <div className="iphone-frame w-64 md:w-72">
                    <img src="/images/screen-library.png" alt="VREAD App - Bibliothèque" />
                  </div>
                  
                  {/* Floating XP badge */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8, duration: 0.4 }}
                    className="absolute -right-4 top-20 bg-white rounded-2xl shadow-xl p-4 border border-beige"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-gold to-copper rounded-full flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-coffee-medium font-medium">{t.landing.hero.xpEarned}</p>
                        <p className="text-xl font-display font-bold text-coffee-darker">+150</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ===== FEATURES SECTION ===== */}
        <section id="features" className="py-20 md:py-32 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-display font-bold text-coffee-darkest mb-4">
                {t.landing.features.title}
              </h2>
              <p className="text-coffee-dark/70 text-lg max-w-2xl mx-auto">
                {t.landing.features.subtitle}
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0 }}
                className="feature-card bg-cream rounded-3xl overflow-hidden"
              >
                <div className="aspect-[4/5] overflow-hidden">
                  <img 
                    src="/images/screen-progression.png" 
                    alt="Suivi de progression" 
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-display font-bold text-coffee-darker mb-2">{t.landing.features.tracking.title}</h3>
                  <p className="text-coffee-dark/70">{t.landing.features.tracking.description}</p>
                </div>
              </motion.div>

              {/* Feature 2 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="feature-card bg-cream rounded-3xl overflow-hidden md:mt-12"
              >
                <div className="aspect-[4/5] overflow-hidden">
                  <img 
                    src="/images/screen-success.png" 
                    alt="Gamification" 
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-display font-bold text-coffee-darker mb-2">{t.landing.features.gamification.title}</h3>
                  <p className="text-coffee-dark/70">{t.landing.features.gamification.description}</p>
                </div>
              </motion.div>

              {/* Feature 3 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="feature-card bg-cream rounded-3xl overflow-hidden md:mt-24"
              >
                <div className="aspect-[4/5] overflow-hidden">
                  <img 
                    src="/images/screen-library2.png" 
                    alt="Bibliothèque" 
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-display font-bold text-coffee-darker mb-2">{t.landing.features.library.title}</h3>
                  <p className="text-coffee-dark/70">{t.landing.features.library.description}</p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ===== EXPERIENCE SECTION ===== */}
        <section id="experience" className="py-20 md:py-32 px-6 bg-coffee-darker text-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-6">
                  {t.landing.experience.title}
                </h2>
                <p className="text-white/80 text-lg mb-10 leading-relaxed">
                  {t.landing.experience.subtitle}
                </p>

                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                    <CheckCircle2 className="w-5 h-5 text-gold" />
                    <span className="font-medium">{t.landing.experience.quiz}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                    <CheckCircle2 className="w-5 h-5 text-gold" />
                    <span className="font-medium">{t.landing.experience.jokers}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                    <CheckCircle2 className="w-5 h-5 text-gold" />
                    <span className="font-medium">{t.landing.experience.certified}</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex justify-center"
              >
                <div className="iphone-frame w-64 md:w-72">
                  <img src="/images/screen-book-detail.png" alt="Détail du livre" />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ===== ONBOARDING SECTION ===== */}
        <section className="py-20 md:py-32 px-6 bg-beige">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex justify-center order-2 lg:order-1"
              >
                <div className="iphone-frame w-64 md:w-72">
                  <img src="/images/screen-welcome.png" alt="Écran de bienvenue" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="order-1 lg:order-2"
              >
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-coffee-darkest mb-6">
                  {t.landing.onboarding.title}
                </h2>
                <p className="text-coffee-dark/80 text-lg mb-10 leading-relaxed">
                  {t.landing.onboarding.subtitle}
                </p>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-copper text-white rounded-full flex items-center justify-center font-display font-bold shrink-0">1</div>
                    <div>
                      <h3 className="font-display font-bold text-coffee-darker text-lg">{t.landing.onboarding.step1.title}</h3>
                      <p className="text-coffee-dark/70">{t.landing.onboarding.step1.description}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-copper text-white rounded-full flex items-center justify-center font-display font-bold shrink-0">2</div>
                    <div>
                      <h3 className="font-display font-bold text-coffee-darker text-lg">{t.landing.onboarding.step2.title}</h3>
                      <p className="text-coffee-dark/70">{t.landing.onboarding.step2.description}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-copper text-white rounded-full flex items-center justify-center font-display font-bold shrink-0">3</div>
                    <div>
                      <h3 className="font-display font-bold text-coffee-darker text-lg">{t.landing.onboarding.step3.title}</h3>
                      <p className="text-coffee-dark/70">{t.landing.onboarding.step3.description}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ===== COMMUNITY SECTION ===== */}
        <section id="community" className="py-20 md:py-32 px-6 bg-cream relative overflow-hidden">
          <div className="max-w-7xl mx-auto text-center">
            {/* 3 iPhones composition */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex justify-center items-end gap-4 md:gap-8 mb-16"
            >
              <div className="iphone-frame w-40 md:w-52 opacity-80 -rotate-6 translate-y-8">
                <img src="/images/screen-library.png" alt="Communauté" />
              </div>
              <div className="iphone-frame w-48 md:w-64 z-10">
                <img src="/images/screen-success.png" alt="Succès" />
              </div>
              <div className="iphone-frame w-40 md:w-52 opacity-80 rotate-6 translate-y-8">
                <img src="/images/screen-progression.png" alt="Progression" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-coffee-darkest mb-6">
                {t.landing.community.title}
              </h2>
              <p className="text-coffee-dark/70 text-lg max-w-2xl mx-auto mb-10">
                {t.landing.community.subtitle}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <a
                  href={IOS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-3 px-6 py-4 bg-black hover:bg-coffee-darkest text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg min-w-[180px]"
                >
                  <Apple className="w-6 h-6 fill-current" />
                  <div className="text-left">
                    <p className="text-[10px] opacity-80 leading-none">Télécharger sur</p>
                    <p className="text-base font-bold leading-tight">App Store</p>
                  </div>
                </a>
                <a
                  href={ANDROID_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-3 px-6 py-4 bg-black hover:bg-coffee-darkest text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg min-w-[180px]"
                >
                  <Google className="w-6 h-6" />
                  <div className="text-left">
                    <p className="text-[10px] opacity-80 leading-none">Disponible sur</p>
                    <p className="text-base font-bold leading-tight">Google Play</p>
                  </div>
                </a>
              </div>
              <div className="mt-4">
                <Link
                  to="/auth?mode=login"
                  className="text-coffee-medium/70 hover:text-copper text-sm underline underline-offset-2 transition-colors px-4 py-3 inline-block"
                >
                  {t.landing.community.desktopLink}
                </Link>
              </div>
              <p className="text-coffee-medium text-sm mt-4">
                {t.landing.community.availability}
              </p>
            </motion.div>
          </div>
        </section>

        {/* ===== FOOTER ===== */}
        <footer className="py-12 px-6 bg-coffee-darkest text-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-3">
                <img src="/images/logo.png" alt="VREAD" className="h-8 w-auto" />
                <span className="font-display font-semibold">VREAD</span>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/70">
                <Link to="/blog" className="hover:text-white transition-colors">{t.landing.footer.blog}</Link>
                <Link to="/a-propos" className="hover:text-white transition-colors">{t.landing.footer.about}</Link>
                <Link to="/presse" className="hover:text-white transition-colors">{t.landing.footer.press}</Link>
                <Link to="/legal/terms" className="hover:text-white transition-colors">{t.landing.footer.terms}</Link>
                <Link to="/legal/privacy" className="hover:text-white transition-colors">{t.landing.footer.privacy}</Link>
                <button
                  onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
                  className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
                  aria-label={t.language.switch}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{language === 'fr' ? 'EN' : 'FR'}</span>
                </button>
              </div>

              <p className="text-white/50 text-sm">
                {t.landing.footer.copyright}
              </p>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
