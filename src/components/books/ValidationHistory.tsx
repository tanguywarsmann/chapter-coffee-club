
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Calendar } from "lucide-react";
import { ReadingValidation } from "@/types/reading";

interface ValidationHistoryProps {
  validations: ReadingValidation[];
}

export function ValidationHistory({ validations }: ValidationHistoryProps) {
  if (!validations?.length) return null;

  return (
    <Card className="border-coffee-light">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-coffee-darker flex items-center">
          <Calendar className="mr-2 h-5 w-5" />
          Historique de mes validations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {validations.slice().reverse().map((validation, index) => (
            <div key={index} className="flex gap-3 pb-3 border-b border-coffee-lightest last:border-b-0">
              <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-coffee-lightest text-coffee-dark">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium text-sm text-coffee-darker">
                  Validation du segment {validation.segment} (pages {(validation.segment-1)*30+1}-{validation.segment*30})
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(validation.date_validated).toLocaleDateString('fr-FR', { 
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
