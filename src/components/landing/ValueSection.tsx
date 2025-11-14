import { useTranslation } from "@/i18n/LanguageContext";
import { X, Check, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export function ValueSection() {
  const { t } = useTranslation();

  return (
    <section className="w-full py-32 md:py-40 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Titre principal */}
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-6xl font-serif font-semibold text-white text-center mb-24"
        >
          {t.landing.valueSection.title}
        </motion.h2>

        {/* Bento Grid asymétrique */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
          
          {/* Colonne gauche - Sans VREAD (compact, en retrait) */}
          <motion.div 
            initial={{ opacity: 0, x: -30, scale: 0.92 }}
            whileInView={{ opacity: 1, x: 0, scale: 0.92 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ rotate: -2, scale: 0.9 }}
            className="lg:col-span-4 space-y-6 rounded-[3rem] p-8 backdrop-blur-[40px] backdrop-saturate-[180%] border border-white/20 relative group"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
              boxShadow: `
                0 8px 32px rgba(31, 38, 135, 0.15),
                0 30px 60px rgba(0,0,0,0.12),
                inset 0 0 0 1px rgba(255,255,255,0.05)
              `
            }}
          >
            <h3 className="text-2xl font-medium text-white/90 mb-6">
              {t.landing.valueSection.withoutTitle}
            </h3>
            <div className="space-y-4">
              {[t.landing.valueSection.without1, t.landing.valueSection.without2, t.landing.valueSection.without3].map((text, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                    <X className="w-4 h-4 text-white/60" />
                  </div>
                  <p className="text-base text-white/70 leading-relaxed">
                    {text}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Colonne droite - Avec VREAD (LA STAR) */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3 }}
            whileHover={{ 
              y: -16,
              transition: { duration: 0.3 }
            }}
            className="lg:col-span-8 space-y-6 rounded-[3rem] p-12 relative z-10 group"
            style={{
              background: `
                linear-gradient(135deg, #A67B5B 0%, #C4A287 50%, #E8DCC8 100%),
                radial-gradient(circle at top right, rgba(255,255,255,0.3), transparent)
              `,
              backgroundBlendMode: 'normal, overlay',
              boxShadow: `
                0 50px 100px -20px rgba(166,123,91,0.5),
                0 30px 60px -30px rgba(166,123,91,0.35),
                0 0 0 1px rgba(255,255,255,0.1) inset
              `
            }}
          >
            <div className="absolute inset-0 rounded-[3rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: 'radial-gradient(circle at center, rgba(255,255,255,0.2), transparent)',
                pointerEvents: 'none'
              }}
            />
            
            <h3 className="text-3xl font-semibold text-white mb-8 relative z-10">
              {t.landing.valueSection.withTitle}
            </h3>
            
            <div className="space-y-5 relative z-10">
              {[t.landing.valueSection.with1, t.landing.valueSection.with2, t.landing.valueSection.with3].map((text, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Check className="w-5 h-5 text-[#A67B5B]" />
                  </div>
                  <p className="text-lg text-white font-medium leading-relaxed">
                    {text}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Le Principe - Capsule allongée */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="flex justify-center"
        >
          <div 
            className="rounded-full px-12 py-8 max-w-5xl relative"
            style={{
              background: 'white',
              border: 'double 4px transparent',
              backgroundImage: `linear-gradient(white, white), linear-gradient(135deg, #A67B5B, #C4A287)`,
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
              boxShadow: '0 20px 60px rgba(0,0,0,0.08)'
            }}
          >
            <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
              {['Lire 30 pages', 'Répondre aux questions', 'Valider son segment', 'Continuer l\'aventure'].map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 + i * 0.1, duration: 0.4 }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#A67B5B]/10 border border-[#A67B5B]/20 rounded-full relative"
                  style={{
                    marginLeft: i > 0 ? '-8px' : '0',
                    zIndex: 4 - i
                  }}
                >
                  <span className="text-sm font-medium text-[#A67B5B]">{step}</span>
                  {i < 3 && <ArrowRight className="w-4 h-4 text-[#A67B5B]/60" />}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
