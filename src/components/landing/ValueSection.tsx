import { useTranslation } from "@/i18n/LanguageContext";
import { X, Check } from "lucide-react";

export function ValueSection() {
  const { t } = useTranslation();

  return (
    <section className="w-full py-20 md:py-24 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Titre principal */}
        <h2 className="text-h1 font-serif font-semibold text-white text-center mb-16 md:mb-20">
          {t.landing.valueSection.title}
        </h2>

        {/* Deux colonnes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 mb-12 md:mb-16">
          
          {/* Colonne gauche - Sans VREAD */}
          <div className="space-y-6 bg-white/5 backdrop-blur-sm rounded-2xl p-8 md:p-10 border border-white/10">
            <h3 className="text-h3 font-medium text-white/70 mb-8 text-center md:text-left">
              {t.landing.valueSection.withoutTitle}
            </h3>
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <X className="w-5 h-5 text-white/40 flex-shrink-0 mt-1" />
                <p className="text-body text-white/60 leading-relaxed">
                  {t.landing.valueSection.without1}
                </p>
              </div>
              <div className="flex items-start gap-4">
                <X className="w-5 h-5 text-white/40 flex-shrink-0 mt-1" />
                <p className="text-body text-white/60 leading-relaxed">
                  {t.landing.valueSection.without2}
                </p>
              </div>
              <div className="flex items-start gap-4">
                <X className="w-5 h-5 text-white/40 flex-shrink-0 mt-1" />
                <p className="text-body text-white/60 leading-relaxed">
                  {t.landing.valueSection.without3}
                </p>
              </div>
            </div>
          </div>

          {/* Colonne droite - Avec VREAD */}
          <div className="space-y-6 bg-white/10 backdrop-blur-sm rounded-2xl p-8 md:p-10 border border-white/20 shadow-xl">
            <h3 className="text-h3 font-medium text-white mb-8 text-center md:text-left">
              {t.landing.valueSection.withTitle}
            </h3>
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <Check className="w-5 h-5 text-reed-accent flex-shrink-0 mt-1" />
                <p className="text-body text-white leading-relaxed">
                  {t.landing.valueSection.with1}
                </p>
              </div>
              <div className="flex items-start gap-4">
                <Check className="w-5 h-5 text-reed-accent flex-shrink-0 mt-1" />
                <p className="text-body text-white leading-relaxed">
                  {t.landing.valueSection.with2}
                </p>
              </div>
              <div className="flex items-start gap-4">
                <Check className="w-5 h-5 text-reed-accent flex-shrink-0 mt-1" />
                <p className="text-body text-white leading-relaxed">
                  {t.landing.valueSection.with3}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Ligne de synthèse */}
        <div className="flex justify-center">
          <div className="bg-white/5 backdrop-blur-sm rounded-full px-8 py-4 border border-white/20 max-w-4xl">
            <p className="text-body-sm md:text-body font-medium text-reed-accent text-center leading-relaxed">
              {t.landing.valueSection.mechanism}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
