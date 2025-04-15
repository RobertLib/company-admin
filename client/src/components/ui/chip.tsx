import cn from "../../utils/cn";

type ChipProps = React.ComponentProps<"div">;

export default function Chip({ className, children, ...props }: ChipProps) {
  return (
    <div
      {...props}
      className={cn(
        "inline-block rounded-full border border-gray-300 px-2 py-0.5 text-sm dark:border-gray-600",
        className,
      )}
    >
      {children}
    </div>
  );
}
