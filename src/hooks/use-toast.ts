
import * as React from "react";
import {
  ToastActionElement,
  CustomToastProps,
  ToastProps,
} from "@/components/ui/toast";

export interface ToasterToast extends CustomToastProps {
  id: string;
  action?: ToastActionElement;
}

// Create a standalone implementation
const useToastStore = () => {
  const toasts: ToasterToast[] = [];
  
  function toast(props: CustomToastProps) {
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

export const toast = (props: CustomToastProps) => {
  return {
    id: crypto.randomUUID(),
    ...props
  };
};
