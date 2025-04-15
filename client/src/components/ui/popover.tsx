import { useCallback, useEffect, useRef, useState } from "react";
import cn from "../../utils/cn";

interface PopoverProps extends Omit<React.ComponentProps<"div">, "content"> {
  content: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  position?: "top" | "bottom" | "left" | "right";
  trigger?: "hover" | "click";
  width?: string;
}

export default function Popover({
  className,
  content,
  children,
  onOpenChange,
  open: controlledOpen,
  position = "right",
  trigger = "hover",
  width = "200px",
  ...props
}: PopoverProps) {
  const [isOpen, setIsOpen] = useState(false);

  const popoverRef = useRef<HTMLDivElement>(null);

  const isControlled = controlledOpen !== undefined;
  const openState = isControlled ? controlledOpen : isOpen;

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (!isControlled) {
        setIsOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    },
    [isControlled, onOpenChange],
  );

  useEffect(() => {
    if (trigger === "click") {
      const handleClickOutside = (event: MouseEvent) => {
        if (!popoverRef.current?.contains(event.target as Node)) {
          handleOpenChange(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [handleOpenChange, trigger]);

  const positions = {
    top: {
      bridge: "h-2 bottom-full left-0 w-full",
      popover: "bottom-full left-1/2 -translate-x-1/2",
    },
    bottom: {
      bridge: "h-2 top-full left-0 w-full",
      popover: "top-full left-1/2 -translate-x-1/2",
    },
    left: {
      bridge: "w-2 right-full top-0 h-full",
      popover: "right-full top-0",
    },
    right: {
      bridge: "w-2 left-full top-0 h-full",
      popover: "left-full top-0",
    },
  };

  const handleToggle = () => {
    handleOpenChange(!openState);
  };

  const handleClick =
    trigger === "click"
      ? {
          onClick: handleToggle,
          onKeyDown: (event: React.KeyboardEvent) => {
            if (event.key === "Enter") {
              handleToggle();
            }
          },
          role: "button",
          tabIndex: 0,
        }
      : {};

  const handleMouseEvents =
    trigger === "hover"
      ? {
          onMouseEnter: () => handleOpenChange(true),
          onMouseLeave: () => {
            setTimeout(() => {
              const isHoveringBridge = document.querySelector(
                ".popover-bridge:hover",
              );
              const isHoveringContent = document.querySelector(
                ".popover-content:hover",
              );

              if (!isHoveringBridge && !isHoveringContent) {
                handleOpenChange(false);
              }
            }, 50);
          },
        }
      : {};

  return (
    <div
      {...props}
      className={cn("relative inline-flex", className)}
      ref={popoverRef}
      {...handleClick}
      {...handleMouseEvents}
    >
      {openState && (
        <>
          <div
            className={cn(
              "popover-bridge absolute z-10",
              positions[position].bridge,
            )}
            onMouseEnter={() => {
              if (trigger === "hover") handleOpenChange(true);
            }}
          />

          <div
            className={cn(
              "popover-content animate-fade-in absolute z-10 max-h-[300px] overflow-y-auto rounded-md border border-gray-200 bg-white p-2 shadow-md dark:border-gray-700 dark:bg-black",
              positions[position].popover,
              position === "top" && "mb-2",
              position === "bottom" && "mt-2",
              position === "left" && "mr-2",
              position === "right" && "ml-2",
            )}
            onMouseEnter={() => {
              if (trigger === "hover") handleOpenChange(true);
            }}
            onMouseLeave={() => {
              if (trigger === "hover") handleOpenChange(false);
            }}
            style={{ minWidth: width }}
          >
            {content}
          </div>
        </>
      )}
      {children || <div className="absolute inset-0" />}
    </div>
  );
}
