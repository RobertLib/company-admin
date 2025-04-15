import { useFormControl } from "./form/use-form-control";
import cn from "../../utils/cn";
import FormError from "./form/form-error";

interface TextareaProps extends React.ComponentProps<"textarea"> {
  error?: string;
  label?: string;
}

export default function Textarea({
  className,
  defaultValue,
  error,
  label,
  name,
  required,
  ...props
}: TextareaProps) {
  const { value, handleChange } = useFormControl({ ...props, defaultValue });

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="block text-sm font-medium" htmlFor={name}>
          {label}: {required && <span className="text-danger-500">*</span>}
        </label>
      )}

      <textarea
        {...props}
        className={cn(
          "form-control px-2 py-1",
          error && "border-danger-500! focus:ring-danger-300!",
          className,
        )}
        id={name}
        name={name}
        onChange={handleChange}
        required={required}
        value={value}
      />

      <FormError>{error}</FormError>
    </div>
  );
}
