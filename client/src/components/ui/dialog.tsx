import "./dialog.css";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { X } from "lucide-react";
import cn from "../../utils/cn";
import IconButton from "./icon-button";

interface DialogProps extends React.ComponentProps<"dialog"> {
  title?: string;
}

export default function Dialog({
  className,
  children,
  title,
  ...props
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (dialogRef.current) {
      dialogRef.current.showModal();
      setTimeout(() => setIsOpen(true), 10);
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        navigate(-1);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  const handleClose = () => {
    setIsOpen(false);
    setIsClosing(true);

    setTimeout(() => {
      navigate(-1);
    }, 200);
  };

  return (
    <dialog
      {...props}
      aria-modal="true"
      className={cn(
        "m-auto scale-95 rounded-md border border-gray-200 bg-white text-black opacity-0 shadow-md transition-all duration-200 sm:min-w-sm dark:border-gray-700 dark:bg-black dark:text-white",
        isOpen && "scale-100 opacity-100",
        isClosing && "closing",
        className,
      )}
      ref={dialogRef}
      role="dialog"
    >
      <header className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3.25 dark:border-gray-700 dark:bg-black">
        <span className="font-medium">{title}</span>
        <form
          className="inline-flex"
          method="dialog"
          onSubmit={(event) => {
            event.preventDefault();
            handleClose();
          }}
        >
          <IconButton
            aria-label="Close"
            className="opacity-70 hover:opacity-100"
            type="submit"
          >
            <X size={18} />
          </IconButton>
        </form>
      </header>
      <div className="p-4">{children}</div>
    </dialog>
  );
}
