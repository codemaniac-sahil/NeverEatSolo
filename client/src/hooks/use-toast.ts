import { useToast as useToastOriginal } from "@/components/ui/use-toast";

export { ToastAction } from "@/components/ui/toast";
export type { Toast } from "@/components/ui/use-toast";

export const useToast = useToastOriginal;
