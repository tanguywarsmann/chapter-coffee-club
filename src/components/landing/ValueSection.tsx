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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          
          {/* Colonne gauche - Sans VREAD */}
          <div className="space-y-6 backdrop-blur-xl bg-[#A67B5B]/60 rounded-3xl p-10 border border-white/10 shadow-2xl transform scale-95 -translate-y-4 transition-all duration-300 hover:scale-100">
            <h3 className="text-h3 font-medium text-white mb-8 text-left">
              {t.landing.valueSection.withoutTitle}
            </h3>
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <X className="w-6 h-6 text-white/60 flex-shrink-0 mt-1" />
                <p className="text-body text-white/90 leading-relaxed text-left">
                  {t.landing.valueSection.without1}
                </p>
              </div>
              <div className="flex items-start gap-4">
                <X className="w-6 h-6 text-white/60 flex-shrink-0 mt-1" />
                <p className="text-body text-white/90 leading-relaxed text-left">
                  {t.landing.valueSection.without2}
                </p>
              </div>
              <div className="flex items-start gap-4">
                <X className="w-6 h-6 text-white/60 flex-shrink-0 mt-1" />
                <p className="text-body text-white/90 leading-relaxed text-left">
                  {t.landing.valueSection.without3}
                </p>
              </div>
            </div>
          </div>

          {/* Colonne droite - Avec VREAD */}
          <div className="space-y-6 bg-gradient-to-br from-[#A67B5B] to-[#C4A287] rounded-3xl p-12 border-2 border-white/20 shadow-[0_20px_70px_rgba(166,123,91,0.3)] transition-all duration-300 hover:-translate-y-2">
            <h3 className="text-h3 font-medium text-white mb-8 text-left">
              {t.landing.valueSection.withTitle}
            </h3>
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <Check className="w-6 h-6 text-white flex-shrink-0 mt-1" />
                <p className="text-body text-white leading-relaxed text-left">
                  {t.landing.valueSection.with1}
                </p>
              </div>
              <div className="flex items-start gap-4">
                <Check className="w-6 h-6 text-white flex-shrink-0 mt-1" />
                <p className="text-body text-white leading-relaxed text-left">
                  {t.landing.valueSection.with2}
                </p>
              </div>
              <div className="flex items-start gap-4">
                <Check className="w-6 h-6 text-white flex-shrink-0 mt-1" />
                <p className="text-body text-white leading-relaxed text-left">
                  {t.landing.valueSection.with3}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Ligne de synthèse */}
        <div className="flex justify-center">
          <div className="bg-white rounded-2xl px-10 py-10 border-2 border-[#A67B5B]/30 shadow-[0_8px_32px_rgba(0,0,0,0.08)] max-w-4xl">
            <p className="text-lg font-medium text-neutral-800 text-center leading-relaxed">
              {t.landing.valueSection.mechanism}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
