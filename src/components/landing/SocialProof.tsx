import { useTranslation } from "@/i18n/LanguageContext";
import { motion } from "framer-motion";
import { Users, Megaphone } from "lucide-react";

export function SocialProof() {
  const { t } = useTranslation();

  return (
    <section className="w-full py-16 md:py-24 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mx-auto text-center"
      >
        {/* Main stat */}
        <div 
          className="rounded-[2rem] p-8 md:p-12 backdrop-blur-xl border border-white/30"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.08))',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
          }}
        >
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
            {/* Users stat */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-4"
            >
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #A67B5B, #C4A287)',
                  boxShadow: '0 8px 24px rgba(166,123,91,0.4)'
                }}
              >
                <Users className="w-7 h-7 text-white" />
              </div>
              <div className="text-left">
                <div className="text-3xl md:text-4xl font-bold text-white">
                  {t.landing.stats.users}
                </div>
                <div className="text-white/80 font-medium">
                  {t.landing.stats.usersLabel}
                </div>
              </div>
            </motion.div>

            {/* Divider */}
            <div className="hidden md:block w-px h-16 bg-white/20" />
            <div className="md:hidden w-24 h-px bg-white/20" />

            {/* Organic stat */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-4"
            >
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #A67B5B, #C4A287)',
                  boxShadow: '0 8px 24px rgba(166,123,91,0.4)'
                }}
              >
                <Megaphone className="w-7 h-7 text-white" />
              </div>
              <div className="text-left">
                <div className="text-3xl md:text-4xl font-bold text-white">
                  {t.landing.stats.organic}
                </div>
                <div className="text-white/80 font-medium">
                  {t.landing.stats.organicLabel}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
