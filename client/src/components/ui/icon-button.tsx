import cn from "../../utils/cn";

type IconButtonProps = React.ComponentProps<"button">;

export default function IconButton({
  className,
  children,
  type,
  ...props
}: IconButtonProps) {
  return (
    <button
      {...props}
      className={cn(
        "focus-visible:ring-primary-300 -m-1 cursor-pointer rounded-md p-1 leading-[1] transition-colors hover:bg-gray-100 focus:outline-none focus-visible:ring-2 dark:hover:bg-gray-800",
        className,
      )}
      type={type ?? "button"}
    >
      {children}
    </button>
  );
}
