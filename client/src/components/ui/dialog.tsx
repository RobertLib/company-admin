import "./dialog.css";
import { useEffect, useRef, useState } from "react";
import { useId } from "react";
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
  const initialFocusRef = useRef<HTMLElement | null>(null);

  const titleId = useId();

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

  useEffect(() => {
    if (isOpen && dialogRef.current) {
      const focusableElements = dialogRef.current.querySelectorAll(
        "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])",
      );

      if (focusableElements.length > 0) {
        initialFocusRef.current = document.activeElement as HTMLElement;
        (focusableElements[0] as HTMLElement).focus();
      }
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    setIsClosing(true);

    setTimeout(() => {
      navigate(-1);
      if (initialFocusRef.current) initialFocusRef.current.focus();
    }, 200);
  };

  return (
    <dialog
      {...props}
      aria-labelledby={titleId}
      aria-modal="true"
      className={cn(
        "bg-surface m-auto min-w-11/12 scale-95 rounded-md border border-neutral-200 opacity-0 shadow-md transition-all duration-200 sm:min-w-sm",
        isOpen && "scale-100 opacity-100",
        isClosing && "closing",
        className,
      )}
      onMouseDown={(event) => {
        if (event.target === dialogRef.current) {
          handleClose();
        }
      }}
      ref={dialogRef}
      role="dialog"
    >
      <header className="bg-surface sticky top-0 flex items-center justify-between border-b border-neutral-200 px-4 py-3.25">
        <h2 className="font-medium" id={titleId}>
          {title}
        </h2>
        <form
          className="inline-flex"
          method="dialog"
          onSubmit={(event) => {
            event.preventDefault();
            handleClose();
          }}
        >
          <IconButton
            aria-label="Close dialog"
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
