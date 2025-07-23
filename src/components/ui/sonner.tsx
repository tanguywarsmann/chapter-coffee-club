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
        /* largeur fixe : 24 rem (= 384 px) */
        toastOptions={{
          classNames: {
            toast: "w-full max-w-[384px]",
          },
        }}
        {...props}
      />
    </Suspense>
  )
}
