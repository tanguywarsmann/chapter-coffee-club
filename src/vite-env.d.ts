
/// <reference types="vite/client" />

// Extend ToastProps to include description
declare module "@/components/ui/toast" {
  interface ToastProps {
    description?: React.ReactNode;
  }
}
