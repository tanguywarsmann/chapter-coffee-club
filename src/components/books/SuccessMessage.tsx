
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useConfetti } from "@/components/confetti/ConfettiProvider";
import { CheckCircle } from "lucide-react";
import { getUserLevel, getXPForNextLevel } from "@/services/user/levelService";
import { toast } from "sonner";
import { useTranslation } from "@/i18n/LanguageContext";

interface SuccessMessageProps {
  isOpen: boolean;
  onClose?: () => void;
  segment: number;
  userId?: string;
  expectedSegments?: number;
  bookTitle?: string;
}

export function SuccessMessage({ isOpen, onClose, segment, userId, expectedSegments, bookTitle }: SuccessMessageProps) {
  const { showConfetti } = useConfetti();
  const [userLevel, setUserLevel] = useState<any>(null);
  const { t } = useTranslation();
  const sm = t.successMessage;
  
  useEffect(() => {
    if (isOpen) {
      console.log("🎉 Success modal opened - triggering confetti");
      requestAnimationFrame(() => showConfetti({ burst: "big" }));
      
      if (userId) {
        getUserLevel(userId).then(setUserLevel).catch(console.error);
      }
    }
  }, [isOpen, showConfetti, userId]);

  const nextSegment = segment + 1;
  const xpForNext = userLevel ? getXPForNextLevel(userLevel.level) : 100;
  const progressPercent = userLevel ? Math.min(100, (userLevel.xp / xpForNext) * 100) : 0;
  const hasNextSegment = !!expectedSegments && segment < expectedSegments;
  const shareText = bookTitle
    ? sm.shareText.replace("{bookTitle}", bookTitle)
    : sm.shareTextGeneric;

  const handleShareInstagram = async () => {
    const sharePayload = {
      title: "VREAD",
      text: shareText,
      url: window.location.origin
    };

    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share(sharePayload);
        toast.success(sm.shared);
        return;
      }
    } catch (e) {
      console.error("Native share failed", e);
    }

    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(`${shareText} ${window.location.origin}`);
      }
      window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
      toast.info(sm.shareClipboard);
    } catch (e) {
      toast.error(sm.shareError);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={() => onClose && onClose()}>
      <DialogContent className="sm:max-w-md border-coffee-medium">
        <DialogHeader className="pb-2">
          <div className="flex flex-col items-center justify-center">
            <CheckCircle className="w-16 h-16 text-green-500 mb-2 animate-scale-in" />
            <DialogTitle className="text-h4 text-center font-serif text-coffee-darker">
              {sm.title}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {sm.description}
            </DialogDescription>
          </div>
        </DialogHeader>
        
        <div className="py-4 text-center space-y-4">
          <div 
            className="flex items-center justify-center gap-2 animate-pulse"
            role="status" 
            aria-live="polite"
            aria-label="+10 XP"
          >
            <span className="text-3xl font-bold text-green-600">+10 XP</span>
            {userLevel && (
              <span className="text-sm text-muted-foreground">
                • {sm.level.replace("{level}", String(userLevel.level))}
              </span>
            )}
          </div>
          
          {userLevel && userLevel.level < 5 && (
            <div className="space-y-2 px-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-green-500 to-emerald-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {sm.xpProgress
                  .replace("{xp}", String(userLevel.xp))
                  .replace("{next}", String(xpForNext))
                  .replace("{level}", String(userLevel.level + 1))}
              </p>
            </div>
          )}
          
          {hasNextSegment && (
            <div className="text-sm text-muted-foreground mt-4">
              <p className="mb-1">{sm.nextSegment.replace("{segment}", String(nextSegment))}</p>
              <p className="text-xs">{sm.nextValidation}</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-center mt-4">
          <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
            <Button 
              onClick={() => onClose && onClose()} 
              className="bg-coffee-dark hover:bg-coffee-darker w-full sm:w-auto"
            >
              {sm.continueReading}
            </Button>
            <Button 
              variant="outline"
              onClick={handleShareInstagram}
              className="w-full sm:w-auto"
            >
              {sm.shareInstagram}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
