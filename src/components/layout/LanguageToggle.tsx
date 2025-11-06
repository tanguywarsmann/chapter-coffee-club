import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "@/i18n/LanguageContext";

export const LanguageToggle = () => {
  const { language, setLanguage, t } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-brand-100/50 transition-colors"
          aria-label={t.language.switch}
        >
          <Globe className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px] bg-white border-brand-200 z-50">
        <DropdownMenuItem
          onClick={() => setLanguage('fr')}
          className={`cursor-pointer ${language === 'fr' ? 'bg-brand-100 text-brand-700' : ''}`}
        >
          🇫🇷 {t.language.french}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLanguage('en')}
          className={`cursor-pointer ${language === 'en' ? 'bg-brand-100 text-brand-700' : ''}`}
        >
          🇬🇧 {t.language.english}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
