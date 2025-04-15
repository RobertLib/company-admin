import { useEffect, useState } from "react";
import cn from "../../utils/cn";

export type ToastVariant = "default" | "success" | "error" | "warning" | "info";

interface ToastProps extends React.ComponentProps<"div"> {
  duration?: number;
  message: string;
  onClose?: () => void;
  variant?: ToastVariant;
}

export default function Toast({
  className,
  duration = 3000,
  message,
  onClose,
  variant = "default",
  ...props
}: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  useEffect(() => {
    if (!visible && onClose) {
      const timer = setTimeout(onClose, 200);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  const variantStyles = {
    default:
      "border-secondary-200 bg-white text-secondary-800 dark:bg-black dark:text-secondary-200",
    success:
      "border-success-200 bg-success-50 text-success-800 dark:bg-success-900 dark:text-success-200 dark:border-success-800",
    error:
      "border-danger-200 bg-danger-50 text-danger-800 dark:bg-danger-900 dark:text-danger-200 dark:border-danger-800",
    warning:
      "border-warning-200 bg-warning-50 text-warning-800 dark:bg-warning-900 dark:text-warning-200 dark:border-warning-800",
    info: "border-info-200 bg-info-50 text-info-800 dark:bg-info-900 dark:text-info-200 dark:border-info-800",
  };

  return (
    <div
      {...props}
      className={cn(
        visible ? "animate-slide-up" : "animate-slide-down",
        "rounded-md border p-4 shadow-md",
        variantStyles[variant],
        className,
      )}
    >
      {message}
    </div>
  );
}
