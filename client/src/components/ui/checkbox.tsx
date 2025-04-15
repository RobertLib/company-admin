import { useState } from "react";
import cn from "../../utils/cn";
import FormError from "./form/form-error";

interface CheckboxProps extends React.ComponentProps<"input"> {
  error?: string;
  label?: string;
}

export default function Checkbox({
  className,
  defaultChecked,
  error,
  label,
  name,
  onChange,
  required,
  ...props
}: CheckboxProps) {
  const [checked, setChecked] = useState(defaultChecked ?? false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(event);
    setChecked(event.target.checked);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-2">
        <input
          {...props}
          className={cn(
            "focus:ring-primary-300 rounded-md border border-neutral-300 px-2 py-1 transition-colors focus:ring-2 focus:outline-none",
            error && "border-danger-500! focus:ring-danger-300!",
            className,
          )}
          checked={checked}
          id={name}
          name={name}
          onChange={handleChange}
          required={required}
          type="checkbox"
        />
        {label && (
          <label className="block text-sm font-medium" htmlFor={name}>
            {label} {required && <span className="text-danger-500">*</span>}
          </label>
        )}
      </div>

      <FormError>{error}</FormError>
    </div>
  );
}
