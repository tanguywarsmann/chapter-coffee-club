import { useTranslation } from "@/i18n/LanguageContext";
import { motion } from "framer-motion";
import { BookOpen, Bot, PenLine, CheckCircle2 } from "lucide-react";

export function HowItWorks() {
  const { t } = useTranslation();

  const steps = [
    {
      icon: BookOpen,
      label: t.landing.howItWorks.step1,
    },
    {
      icon: Bot,
      label: t.landing.howItWorks.step2,
    },
    {
      icon: PenLine,
      label: t.landing.howItWorks.step3,
    },
    {
      icon: CheckCircle2,
      label: t.landing.howItWorks.step4,
    },
  ];

  return (
    <section className="w-full py-20 md:py-28 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Titre */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-serif font-semibold text-white text-center mb-16"
        >
          {t.landing.howItWorks.title}
        </motion.h2>

        {/* Flow horizontal */}
        <div 
          className="rounded-[2rem] p-8 md:p-12 border-4"
          style={{
            background: 'white',
            borderColor: '#C4A287',
            boxShadow: '0 25px 80px rgba(0,0,0,0.15)'
          }}
        >
          {/* Steps */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4 mb-10">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + i * 0.15 }}
                className="flex items-center gap-4"
              >
                {/* Step card */}
                <div className="flex flex-col items-center gap-3 min-w-[120px]">
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, #A67B5B, #C4A287)',
                      boxShadow: '0 8px 24px rgba(166,123,91,0.35)'
                    }}
                  >
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <span className="text-base font-semibold text-[#2D2319] text-center">
                    {step.label}
                  </span>
                </div>

                {/* Arrow between steps (not after last) */}
                {i < steps.length - 1 && (
                  <div className="hidden md:block text-[#A67B5B] text-3xl font-light">
                    →
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Catchphrase */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <p 
              className="text-lg md:text-xl font-medium px-6 py-4 rounded-full inline-block"
              style={{
                background: 'linear-gradient(135deg, rgba(166,123,91,0.12), rgba(196,162,135,0.12))',
                color: '#8B6F47',
                border: '1px solid rgba(166,123,91,0.25)'
              }}
            >
              💡 {t.landing.howItWorks.catchphrase}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
