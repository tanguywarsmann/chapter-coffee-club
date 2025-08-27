"use client"

import { Suspense, lazy } from "react"
import { useTheme } from "next-themes"
import { useLocation } from "react-router-dom"      // 👈 NEW

// charge paresseuse du composant Sonner
const SonnerToaster = lazy(() =>
  import("sonner").then(mod => ({ default: mod.Toaster }))
)

type ToasterProps = React.ComponentProps<typeof SonnerToaster>

/**
 * Toaster Sonner avec :
 *  • thème synchronisé avec next-themes
 *  • largeur max 384 px
 *  • masquage automatique sur /landing et ses sous-routes
 */
export function Sonner(
  props: Omit<ToasterProps, "theme" | "toastOptions">
) {
  const { theme = "system" } = useTheme()
  const { pathname } = useLocation()

  // Masquer complètement le toaster sur /landing
  if (pathname.startsWith("/landing")) return null

  return (
    <Suspense fallback={null}>
      <SonnerToaster
        /* thème clair/sombre/auto */
        theme={theme as ToasterProps["theme"]}
        /* position, réglable bien sûr */
        position="bottom-right"
        /* classe pour les E2E tests */
        className="toaster"
        /* palette douce harmonisée */
        toastOptions={{
          classNames: {
            toast: "toast w-full max-w-[384px] bg-coffee-light/90 text-coffee-dark border border-coffee-medium/50 shadow-sm",
            success: "bg-reed-light text-coffee-darker border border-coffee-medium",
            error: "bg-coffee-light text-coffee-darker border border-coffee-medium",
            info: "bg-coffee-light text-coffee-dark border border-coffee-medium",
            warning: "bg-coffee-light text-coffee-dark border border-coffee-medium",
          },
        }}
        {...props}
      />
    </Suspense>
  )
}
