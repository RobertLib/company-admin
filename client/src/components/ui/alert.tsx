import cn from "../../utils/cn";

interface AlertProps extends React.ComponentProps<"div"> {
  type?: "success" | "danger" | "warning" | "info";
}

export default function Alert({
  className,
  children,
  type = "info",
  ...props
}: AlertProps) {
  if (!children) return null;

  const typeStyles = {
    success: "bg-success-100 text-success-800 border-success-500",
    danger: "bg-danger-100 text-danger-800 border-danger-500",
    warning: "bg-warning-100 text-warning-800 border-warning-500",
    info: "bg-info-100 text-info-800 border-info-500",
  };

  const roleType = type === "danger" || type === "warning" ? "alert" : "status";
  const liveType = type === "danger" ? "assertive" : "polite";

  return (
    <div
      {...props}
      aria-live={liveType}
      className={cn(
        "animate-fade-in flex items-center justify-between rounded-md border-l-2 p-3 shadow",
        typeStyles[type],
        className,
      )}
      role={roleType}
    >
      <span>{children}</span>
    </div>
  );
}
