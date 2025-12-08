import { useTranslation } from "@/i18n/LanguageContext";
import { X, Check } from "lucide-react";
import { motion } from "framer-motion";

export function ValueSection() {
  const { t } = useTranslation();

  const withoutItems = [
    t.landing.valueSection.without1,
    t.landing.valueSection.without2,
    t.landing.valueSection.without3,
  ];

  const withItems = [
    t.landing.valueSection.with1,
    t.landing.valueSection.with2,
    t.landing.valueSection.with3,
    t.landing.valueSection.with4,
  ];

  return (
    <section className="w-full py-24 md:py-32 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Titre principal */}
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-serif font-semibold text-white text-center mb-16"
        >
          {t.landing.valueSection.title}
        </motion.h2>

        {/* Bento Grid asymétrique */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          
          {/* Colonne gauche - Sans VREAD (fond sombre solide) */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5 rounded-[2rem] p-8 md:p-10"
            style={{
              background: '#1a1a2e',
              boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.08)'
            }}
          >
            <h3 className="text-2xl font-semibold text-white/90 mb-8">
              {t.landing.valueSection.withoutTitle}
            </h3>
            <div className="space-y-5">
              {withoutItems.map((text, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{
                      background: 'rgba(239,68,68,0.15)',
                      border: '1px solid rgba(239,68,68,0.3)'
                    }}
                  >
                    <X className="w-5 h-5 text-red-400" />
                  </div>
                  <p className="text-lg text-white/80 leading-relaxed">
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
              y: -8,
              transition: { duration: 0.3 }
            }}
            className="lg:col-span-7 rounded-[2rem] p-8 md:p-12 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #A67B5B 0%, #C4A287 50%, #D4B896 100%)',
              boxShadow: `
                0 40px 80px -20px rgba(166,123,91,0.5),
                0 25px 50px -15px rgba(166,123,91,0.4),
                inset 0 1px 0 rgba(255,255,255,0.2)
              `
            }}
          >
            {/* Overlay shine */}
            <div 
              className="absolute inset-0 opacity-30 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at top right, rgba(255,255,255,0.4), transparent 60%)'
              }}
            />
            
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-8 relative z-10">
              {t.landing.valueSection.withTitle} 🔥
            </h3>
            
            <div className="space-y-5 relative z-10">
              {withItems.map((text, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div 
                    className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: 'white',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}
                  >
                    <Check className="w-6 h-6 text-[#A67B5B]" />
                  </div>
                  <p className="text-lg md:text-xl text-white font-medium leading-relaxed">
                    {text}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
