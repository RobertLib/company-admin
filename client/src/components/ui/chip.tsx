import cn from "../../utils/cn";

type ChipProps = React.ComponentProps<"div">;

export default function Chip({ className, children, ...props }: ChipProps) {
  return (
    <div
      data-testid="chip"
      {...props}
      className={cn(
        "inline-block rounded-full border border-neutral-300 px-2 py-0.5 text-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}
