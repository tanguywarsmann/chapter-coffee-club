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
          <div className="space-y-6 bg-neutral-50 rounded-2xl p-8 md:p-10 border border-neutral-200">
            <h3 className="text-h3 font-medium text-neutral-700 mb-8 text-left">
              {t.landing.valueSection.withoutTitle}
            </h3>
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <X className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                <p className="text-body text-neutral-600 leading-relaxed text-left">
                  {t.landing.valueSection.without1}
                </p>
              </div>
              <div className="flex items-start gap-4">
                <X className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                <p className="text-body text-neutral-600 leading-relaxed text-left">
                  {t.landing.valueSection.without2}
                </p>
              </div>
              <div className="flex items-start gap-4">
                <X className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                <p className="text-body text-neutral-600 leading-relaxed text-left">
                  {t.landing.valueSection.without3}
                </p>
              </div>
            </div>
          </div>

          {/* Colonne droite - Avec VREAD */}
          <div className="space-y-6 bg-white rounded-2xl p-8 md:p-10 border-2 border-primary shadow-lg">
            <h3 className="text-h3 font-medium text-neutral-800 mb-8 text-left">
              {t.landing.valueSection.withTitle}
            </h3>
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <Check className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <p className="text-body text-neutral-800 leading-relaxed text-left">
                  {t.landing.valueSection.with1}
                </p>
              </div>
              <div className="flex items-start gap-4">
                <Check className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <p className="text-body text-neutral-800 leading-relaxed text-left">
                  {t.landing.valueSection.with2}
                </p>
              </div>
              <div className="flex items-start gap-4">
                <Check className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <p className="text-body text-neutral-800 leading-relaxed text-left">
                  {t.landing.valueSection.with3}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Ligne de synthèse */}
        <div className="flex justify-center">
          <div className="bg-white rounded-2xl px-8 py-8 border-2 border-primary max-w-4xl">
            <p className="text-lg font-medium text-neutral-800 text-center leading-relaxed">
              {t.landing.valueSection.mechanism}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
