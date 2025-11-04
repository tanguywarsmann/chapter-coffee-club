
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast 
            key={id} 
            {...props} 
            className="animate-enter transition-all duration-300 ease-in-out shadow-md border-coffee-medium group"
            aria-live="assertive"
            role="alert"
          >
            <div className="grid gap-1">
              {title && <ToastTitle className="font-medium text-coffee-darker">{title}</ToastTitle>}
              {description && (
                <ToastDescription className="text-body-sm">{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose className="opacity-70 hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-coffee-medium ring-offset-2 transition-opacity" />
          </Toast>
        )
      })}
      <ToastViewport className="animate-fade-in p-4 md:p-6 z-[100]" />
    </ToastProvider>
  )
}
