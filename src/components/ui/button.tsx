
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-normal break-words text-body-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.02] shadow-sm hover:shadow-md",
        premium: "relative overflow-hidden bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/0 before:via-white/20 before:to-white/0 before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-1000",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:scale-[1.02]",
        outline:
          "border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground hover:border-brand-400",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:scale-[1.02]",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        bookCta: "bg-coffee-dark text-white hover:bg-coffee-darker hover:scale-[1.02] shadow-md hover:shadow-lg",
      },
      size: {
        default: "h-auto min-h-[44px] px-6 py-3 rounded-xl text-body sm:text-body-sm sm:min-h-10 sm:px-4 sm:py-2",
        sm: "h-auto min-h-[40px] px-4 py-2 rounded-lg text-body-sm sm:h-9 sm:px-3",
        lg: "h-auto min-h-[48px] px-8 py-4 rounded-xl text-h4 sm:h-11 sm:px-8 sm:text-body",
        icon: "h-[44px] w-[44px] rounded-lg sm:h-10 sm:w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
