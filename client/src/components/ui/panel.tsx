import cn from "../../utils/cn";

interface PanelProps extends React.ComponentProps<"div"> {
  title?: string;
  subtitle?: string;
}

export default function Panel({
  className,
  children,
  title,
  subtitle,
  ...props
}: PanelProps) {
  return (
    <div
      {...props}
      className={cn(
        "bg-surface rounded-lg border border-neutral-200 p-6 shadow-xs",
        className,
      )}
    >
      {title && <h2 className="mb-1 text-2xl font-bold">{title}</h2>}
      {subtitle && <p className="mb-5 text-gray-500">{subtitle}</p>}
      <div>{children}</div>
    </div>
  );
}
