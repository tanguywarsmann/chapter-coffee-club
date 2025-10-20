import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface PremiumBadgeProps {
  size?: "sm" | "md" | "lg";
  variant?: "compact" | "full";
  className?: string;
}

export const PremiumBadge = ({ size = "md", variant = "full", className }: PremiumBadgeProps) => {
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-sm px-3 py-1 gap-1.5",
    lg: "text-base px-4 py-1.5 gap-2"
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  };

  return (
    <div 
      className={cn(
        "inline-flex items-center rounded-full font-semibold",
        "bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600",
        "text-gray-900 shadow-lg",
        "animate-in fade-in zoom-in duration-300",
        "hover:scale-105 transition-transform",
        "border-2 border-amber-300/50",
        sizeClasses[size],
        className
      )}
    >
      <Crown className={cn(iconSizes[size], "fill-gray-900")} />
      {variant === "full" && <span>Premium</span>}
    </div>
  );
};
