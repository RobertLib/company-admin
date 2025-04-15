import cn from "../../utils/cn";

interface SwitchProps extends React.ComponentProps<"input"> {
  label?: string;
}

export default function Switch({ className, label, ...props }: SwitchProps) {
  return (
    <label className={cn("inline-flex cursor-pointer items-center", className)}>
      <input {...props} className="peer sr-only" type="checkbox" />
      <div className="peer peer-checked:bg-primary-600 peer-focus:ring-primary-300 dark:peer-checked:bg-primary-600 dark:peer-focus:ring-primary-800 relative h-5 w-9 rounded-full bg-gray-200 peer-focus:ring-2 peer-focus:outline-none after:absolute after:start-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white rtl:peer-checked:after:-translate-x-full dark:border-gray-600 dark:bg-gray-700" />
      <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
        {label}
      </span>
    </label>
  );
}
