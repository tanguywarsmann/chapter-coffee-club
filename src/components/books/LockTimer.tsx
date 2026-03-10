
import { useState, useEffect, useCallback } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock } from "lucide-react";
import { useTranslation } from "@/i18n/LanguageContext";

interface LockTimerProps {
  remainingSeconds: number;
  onExpire: () => void;
}

function pluralize(value: number, forms: string): string {
  const [singular, plural] = forms.split("|");
  return value <= 1 ? singular : plural;
}

export function LockTimer({ remainingSeconds, onExpire }: LockTimerProps) {
  const [timeLeft, setTimeLeft] = useState(remainingSeconds);
  const { t } = useTranslation();
  const lt = t.lockTimer;
  
  const calculateAndFormatTime = useCallback(() => {
    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;

    let timeDisplay;
    if (hours > 0) {
      timeDisplay = `${hours} ${pluralize(hours, lt.hours)} et ${minutes} ${pluralize(minutes, lt.minutes)}`;
    } else if (minutes > 0) {
      timeDisplay = `${minutes} ${pluralize(minutes, lt.minutes)} et ${seconds} ${pluralize(seconds, lt.seconds)}`;
    } else {
      timeDisplay = `${seconds} ${pluralize(seconds, lt.seconds)}`;
    }
    
    return timeDisplay;
  }, [timeLeft, lt]);
  
  useEffect(() => {
    if (timeLeft <= 0) {
      onExpire();
      return;
    }
    
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setTimeout(onExpire, 0);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onExpire]);

  const timeDisplay = calculateAndFormatTime();

  return (
    <Alert className="bg-amber-50 border-amber-200">
      <div className="flex items-center gap-2 text-amber-800">
        <Clock className="h-4 w-4" />
        <AlertDescription className="text-body-sm">
          {lt.retryIn} <span className="font-medium">{timeDisplay}</span>
        </AlertDescription>
      </div>
    </Alert>
  );
}
