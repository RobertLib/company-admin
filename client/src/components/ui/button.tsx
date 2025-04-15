import cn from "../../utils/cn";

interface ButtonProps extends React.ComponentProps<"button"> {
  loading?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "primary" | "secondary" | "danger";
}

export default function Button({
  className,
  disabled,
  children,
  loading = false,
  size = "md",
  type,
  variant = "primary",
  ...props
}: ButtonProps) {
  const sizeStyles = {
    sm: "px-2 py-0 text-sm",
    md: "px-3 py-1 text-base",
    lg: "px-4 py-2 text-lg",
  };

  const variantStyles = {
    default:
      "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200 focus:ring-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700",
    primary:
      "bg-primary-500 text-white border-primary-600 hover:bg-primary-600 focus:ring-primary-300",
    secondary:
      "bg-secondary-500 text-white border-secondary-600 hover:bg-secondary-600 focus:ring-secondary-300",
    danger:
      "bg-danger-500 text-white border-danger-600 hover:bg-danger-600 focus:ring-danger-300",
  };

  const disabledStyles = "opacity-50 cursor-not-allowed";

  return (
    <button
      {...props}
      aria-busy={loading}
      aria-disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center rounded-md border transition-colors focus:ring-2 focus:outline-none",
        sizeStyles[size],
        variantStyles[variant],
        (disabled || loading) && disabledStyles,
        className,
      )}
      disabled={disabled || loading}
      type={type ?? "button"}
    >
      {loading && (
        <svg
          className="mr-2 -ml-1 h-4 w-4 animate-spin text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
