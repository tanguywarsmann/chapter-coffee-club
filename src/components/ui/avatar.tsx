import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"
import { getUserInitials } from "@/services/user/userProfileService"

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted text-muted-foreground font-medium",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

// Enhanced Avatar component with integrated fallback logic
interface EnhancedAvatarProps {
  src?: string | null
  alt?: string
  fallbackText?: string
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
}

const EnhancedAvatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  EnhancedAvatarProps
>(({ src, alt, fallbackText, className, size = "md" }, ref) => {
  const sizeClasses = {
    sm: "h-8 w-8 text-caption",
    md: "h-10 w-10 text-body-sm", 
    lg: "h-16 w-16 text-h4",
    xl: "h-24 w-24 text-h3"
  }

  const initials = fallbackText ? getUserInitials(fallbackText) : "U"

  return (
    <Avatar ref={ref} className={cn(sizeClasses[size], className)}>
      <AvatarImage src={src ?? undefined} alt={alt} />
      <AvatarFallback className="bg-muted/50 text-muted-foreground border border-border/20">
        {initials}
      </AvatarFallback>
    </Avatar>
  )
})
EnhancedAvatar.displayName = "EnhancedAvatar"

export { Avatar, AvatarImage, AvatarFallback, EnhancedAvatar }
