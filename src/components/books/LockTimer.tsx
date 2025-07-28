
import { useState, useEffect, useCallback } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock } from "lucide-react";

interface LockTimerProps {
  remainingSeconds: number;
  onExpire: () => void;
}

export function LockTimer({ remainingSeconds, onExpire }: LockTimerProps) {
  const [timeLeft, setTimeLeft] = useState(remainingSeconds);
  
  // Optimisation pour éviter les rendus inutiles avec useCallback
  const calculateAndFormatTime = useCallback(() => {
    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;

    // Create a formatted string based on remaining time
    let timeDisplay;
    if (hours > 0) {
      timeDisplay = `${hours} heure${hours > 1 ? 's' : ''} et ${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else if (minutes > 0) {
      timeDisplay = `${minutes} minute${minutes > 1 ? 's' : ''} et ${seconds} seconde${seconds > 1 ? 's' : ''}`;
    } else {
      timeDisplay = `${seconds} seconde${seconds > 1 ? 's' : ''}`;
    }
    
    return timeDisplay;
  }, [timeLeft]);
  
  useEffect(() => {
    if (timeLeft <= 0) {
      onExpire();
      return;
    }
    
    // Utiliser un intervalle fixe pour réduire la charge CPU et éviter les dérives
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          // Utiliser setTimeout pour éviter les appels multiples si le composant est démonté
          setTimeout(onExpire, 0);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onExpire]);

  // Éviter de recalculer le formatage à chaque rendu en utilisant useMemo
  const timeDisplay = calculateAndFormatTime();

  return (
    <Alert className="bg-amber-50 border-amber-200">
      <div className="flex items-center gap-2 text-amber-800">
        <Clock className="h-4 w-4" />
        <AlertDescription className="text-body-sm">
          Vous pourrez réessayer dans <span className="font-medium">{timeDisplay}</span>
        </AlertDescription>
      </div>
    </Alert>
  );
}
