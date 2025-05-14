
import {
  Toast,
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast";

import {
  useToast as useToastShadcn,
} from "@/components/ui/use-toast";

export type ToasterToast = {
  id: string;
  title?: React.ReactNode;
  action?: ToastActionElement;
};

// Directly export the functions from the module to avoid circular dependency
export const useToast = () => {
  return useToastShadcn();
};

// Re-export the toast function for direct usage
export const toast = (props: ToastProps) => {
  const { toast: originalToast } = useToastShadcn();
  return originalToast(props);
};
