import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fr } from './locales/fr';
import { en } from './locales/en';
import type { Translations } from './locales/fr';

type Language = 'fr' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Translations> = { fr, en };

// Detect browser language
const getBrowserLanguage = (): Language => {
  const browserLang = navigator.language.split('-')[0];
  return browserLang === 'fr' ? 'fr' : 'en';
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // 1. Check localStorage
    const stored = localStorage.getItem('vread-language') as Language | null;
    if (stored && (stored === 'fr' || stored === 'en')) return stored;
    
    // 2. Check browser language
    return getBrowserLanguage();
  });

  useEffect(() => {
    localStorage.setItem('vread-language', language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useTranslation must be used within LanguageProvider');
  return context;
};
