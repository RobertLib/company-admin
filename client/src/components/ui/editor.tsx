import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  List,
  Underline,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import cn from "../../utils/cn";
import FormError from "./form/form-error";

interface EditorProps
  extends Omit<React.ComponentProps<"div">, "defaultValue" | "onChange"> {
  defaultValue?: string;
  error?: string;
  label?: string;
  name?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  value?: string;
}

export default function Editor({
  className,
  defaultValue,
  error,
  label,
  name,
  onChange,
  required,
  value: controlledValue,
  ...props
}: EditorProps) {
  const [value, setValue] = useState(controlledValue ?? defaultValue ?? "");

  const editorRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (editorRef.current) {
      if (controlledValue !== undefined) {
        editorRef.current.innerHTML = controlledValue;
        setValue(controlledValue);
      } else if (defaultValue && !initializedRef.current) {
        editorRef.current.innerHTML = defaultValue;
        setValue(defaultValue);
      }

      initializedRef.current = true;
    }
  }, [controlledValue, defaultValue]);

  const updateValue = () => {
    if (editorRef.current) {
      const newValue = editorRef.current.innerHTML;
      setValue(newValue);
      onChange?.(newValue);
    }
  };

  const handleChange = () => {
    if (editorRef.current) {
      const newValue = editorRef.current.innerHTML;
      setValue(newValue);
      onChange?.(newValue);
    }
  };

  const formatDoc = (command: string, value: string = "") => {
    if (!editorRef.current) return;

    document.execCommand(command, false, value);

    setTimeout(() => {
      handleChange();
    }, 0);
  };

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="block text-sm font-medium" htmlFor={name}>
          {label}: {required && <span className="text-danger-500">*</span>}
        </label>
      )}

      <div className="overflow-hidden rounded-md border border-neutral-300">
        <div className="flex items-center border-b border-neutral-300 bg-gray-50 px-2 py-1 dark:bg-gray-800">
          <button
            className="mr-1 rounded-md p-1 hover:bg-gray-200 dark:hover:bg-gray-700"
            onMouseDown={(event) => {
              event.preventDefault();
              formatDoc("bold");
            }}
            title="Bold"
            type="button"
          >
            <Bold size={18} />
          </button>
          <button
            className="mr-1 rounded-md p-1 hover:bg-gray-200 dark:hover:bg-gray-700"
            onMouseDown={(event) => {
              event.preventDefault();
              formatDoc("italic");
            }}
            title="Italic"
            type="button"
          >
            <Italic size={18} />
          </button>
          <button
            className="mr-1 rounded-md p-1 hover:bg-gray-200 dark:hover:bg-gray-700"
            onMouseDown={(event) => {
              event.preventDefault();
              formatDoc("underline");
            }}
            title="Underline"
            type="button"
          >
            <Underline size={18} />
          </button>
          <div className="mx-2 h-5 w-px bg-gray-300" />
          <button
            className="mr-1 rounded-md p-1 hover:bg-gray-200 dark:hover:bg-gray-700"
            onMouseDown={(event) => {
              event.preventDefault();
              formatDoc("insertUnorderedList");
            }}
            title="Insert unordered list"
            type="button"
          >
            <List size={18} />
          </button>
          <div className="mx-2 h-5 w-px bg-gray-300" />
          <button
            className="mr-1 rounded-md p-1 hover:bg-gray-200 dark:hover:bg-gray-700"
            onMouseDown={(event) => {
              event.preventDefault();
              formatDoc("justifyLeft");
            }}
            title="Justify left"
            type="button"
          >
            <AlignLeft size={18} />
          </button>
          <button
            className="mr-1 rounded-md p-1 hover:bg-gray-200 dark:hover:bg-gray-700"
            onMouseDown={(event) => {
              event.preventDefault();
              formatDoc("justifyCenter");
            }}
            title="Justify center"
            type="button"
          >
            <AlignCenter size={18} />
          </button>
          <button
            className="mr-1 rounded-md p-1 hover:bg-gray-200 dark:hover:bg-gray-700"
            onMouseDown={(event) => {
              event.preventDefault();
              formatDoc("justifyRight");
            }}
            title="Justify right"
            type="button"
          >
            <AlignRight size={18} />
          </button>
        </div>

        <div
          {...props}
          className={cn(
            "focus:ring-primary-300 max-h-[500px] min-h-[150px] w-full overflow-y-auto px-2 py-1 transition-colors focus:ring-2 focus:outline-none",
            error && "focus:ring-danger-300",
            className,
          )}
          contentEditable
          id={name}
          onBlur={updateValue}
          onInput={handleChange}
          ref={editorRef}
        />
      </div>

      <FormError>{error}</FormError>

      <input type="hidden" name={name} value={value} />
    </div>
  );
}
