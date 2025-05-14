
// Import directly from the hooks file first
import { useToast as useToastHook, toast as toastHook } from "@/hooks/use-toast";

// Then export them
export const useToast = useToastHook;
export const toast = toastHook;
