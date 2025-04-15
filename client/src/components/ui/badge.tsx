import cn from "../../utils/cn";

interface BadgeProps extends React.ComponentProps<"div"> {
  count: number;
}

export default function Badge({
  className,
  count,
  children,
  ...props
}: BadgeProps) {
  return (
    <div {...props} className={cn("relative inline-block", className)}>
      <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
        {count}
      </span>
      {children}
    </div>
  );
}
