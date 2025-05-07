
import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock } from "lucide-react";

interface LockTimerProps {
  remainingSeconds: number;
  onExpire: () => void;
}

export function LockTimer({ remainingSeconds, onExpire }: LockTimerProps) {
  const [timeLeft, setTimeLeft] = useState(remainingSeconds);
  
  useEffect(() => {
    if (timeLeft <= 0) {
      onExpire();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        const newTime = prevTime - 1;
        if (newTime <= 0) {
          clearInterval(timer);
          onExpire();
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onExpire]);

  // Format time remaining
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

  return (
    <Alert className="bg-amber-50 border-amber-200">
      <div className="flex items-center gap-2 text-amber-800">
        <Clock className="h-4 w-4" />
        <AlertDescription className="text-sm">
          Vous pourrez réessayer dans <span className="font-medium">{timeDisplay}</span>
        </AlertDescription>
      </div>
    </Alert>
  );
}
