import { useToastContext } from "@/components/toast/ToastProvider";

export const useToast = () => {
  const { showToast } = useToastContext();

  return {
    success: (msg: string) => showToast(msg, "success"),
    error: (msg: string) => showToast(msg, "error"),
    info: (msg: string) => showToast(msg, "info"),
    warning: (msg: string) => showToast(msg, "warning"),
  };
};
