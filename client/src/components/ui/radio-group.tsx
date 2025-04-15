import { useState } from "react";
import cn from "../../utils/cn";
import FormError from "./form/form-error";

interface Option<T = string | number> {
  label: string;
  value: T;
}

interface RadioGroupProps extends React.ComponentProps<"div"> {
  error?: string;
  label?: string;
  name: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  options: Option[];
  required?: boolean;
}

export default function RadioGroup({
  className,
  defaultValue,
  error,
  label,
  name,
  onChange,
  options,
  required,
  ...props
}: RadioGroupProps) {
  const [value, setValue] = useState(defaultValue ?? "");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(event);
    setValue(event.target.value);
  };

  return (
    <div {...props} className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label className="block text-sm font-medium" htmlFor={name}>
          {label}: {required && <span className="text-danger-500">*</span>}
        </label>
      )}

      <div className="space-y-2">
        {options.map((option) => (
          <label className="flex items-center gap-2" key={option.value}>
            <input
              className="text-primary-600 focus:ring-primary-300 rounded border-neutral-300"
              defaultChecked={value === option.value}
              name={name}
              onChange={handleChange}
              required={required}
              type="radio"
              value={option.value}
            />
            <span className="text-sm">{option.label}</span>
          </label>
        ))}
      </div>

      <FormError>{error}</FormError>
    </div>
  );
}
