
import {
  Toast,
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast";

import {
  useToast as useToastShadcn,
} from "@radix-ui/react-toast";

export type ToasterToast = {
  id: string;
  title?: React.ReactNode;
  action?: ToastActionElement;
};

export const useToast = useToastShadcn;

// Re-export the toast function for direct usage
export const toast = (props: ToastProps) => {
  const { toast: originalToast } = useToastShadcn();
  return originalToast(props);
};
