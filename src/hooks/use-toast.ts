
import * as React from "react";
import {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast";

export interface ToasterToast extends ToastProps {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
}

// Create a standalone implementation
const useToastStore = () => {
  const toasts: ToasterToast[] = [];
  
  function toast(props: ToastProps) {
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

export const toast = (props: ToastProps) => {
  return {
    id: crypto.randomUUID(),
    ...props
  };
};
