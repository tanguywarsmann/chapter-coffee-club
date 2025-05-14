
import {
  Toast,
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast";

export type ToasterToast = {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

// Create a standalone implementation
const useToastStore = () => {
  const toasts: ToasterToast[] = [];
  
  function toast(props: ToastProps & { description?: React.ReactNode }) {
    return {
      id: crypto.randomUUID(),
      ...props
    };
  }
  
  return {
    toasts,
    toast,
  };
};

// Export standalone functions
export const useToast = useToastStore;

export const toast = (props: ToastProps & { description?: React.ReactNode }) => {
  return {
    id: crypto.randomUUID(),
    ...props
  };
};
