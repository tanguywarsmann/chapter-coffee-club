
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Calendar, Sparkles } from "lucide-react";
import { ReadingValidation } from "@/types/reading";
import { useTranslation } from "@/i18n/LanguageContext";

interface ValidationHistoryProps {
  validations: ReadingValidation[];
}

export function ValidationHistory({ validations }: ValidationHistoryProps) {
  const { t, language } = useTranslation();
  const vh = t.validationHistory;

  if (!validations?.length) return null;

  const dateLocale = language === "fr" ? "fr-FR" : "en-US";

  return (
    <Card className="border-coffee-light">
      <CardHeader>
        <CardTitle className="text-h4 font-medium text-coffee-darker flex items-center">
          <Calendar className="mr-2 h-5 w-5" />
          {vh.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {validations.slice().reverse().map((validation, index) => (
            <div key={index} className="flex gap-3 pb-3 border-b border-coffee-lightest last:border-b-0">
              <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-coffee-lightest text-coffee-dark">
                {validation.used_joker ? (
                  <Sparkles className="h-4 w-4" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-body-sm text-coffee-darker">
                    {vh.segmentValidation.replace("{segment}", String(validation.segment))}
                  </p>
                  {validation.used_joker && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-caption bg-amber-100 text-amber-700 rounded-full">
                      <Sparkles className="h-3 w-3" />
                      {vh.jokerUsed}
                    </span>
                  )}
                </div>
                <p className="text-caption text-muted-foreground">
                  {new Date(validation.validated_at || validation.date_validated).toLocaleDateString(dateLocale, { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
