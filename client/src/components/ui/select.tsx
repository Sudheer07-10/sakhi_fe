"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectContextValue {
  value?: string;
  onValueChange?: (val: string) => void;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  labels: Record<string, React.ReactNode>;
  registerLabel: (val: string, label: React.ReactNode) => void;
}

const SelectContext = React.createContext<SelectContextValue | null>(null);

export interface SelectProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

export function Select({
  value: controlledValue,
  defaultValue,
  onValueChange,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  children,
}: SelectProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue || "");
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const [labels, setLabels] = React.useState<Record<string, React.ReactNode>>({});

  const isControlledValue = controlledValue !== undefined;
  const isControlledOpen = controlledOpen !== undefined;

  const activeValue = isControlledValue ? controlledValue : uncontrolledValue;
  const activeOpen = isControlledOpen ? controlledOpen : uncontrolledOpen;

  const handleOpenChange: React.Dispatch<React.SetStateAction<boolean>> = React.useCallback(
    (action) => {
      const nextOpen = typeof action === "function" ? action(activeOpen) : action;
      if (!isControlledOpen) {
        setUncontrolledOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
    },
    [activeOpen, isControlledOpen, onOpenChange]
  );

  const handleValueChange = React.useCallback(
    (nextVal: string) => {
      if (!isControlledValue) {
        setUncontrolledValue(nextVal);
      }
      onValueChange?.(nextVal);
    },
    [isControlledValue, onValueChange]
  );

  const registerLabel = React.useCallback((val: string, label: React.ReactNode) => {
    setLabels((prev) => (prev[val] === label ? prev : { ...prev, [val]: label }));
  }, []);

  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        handleOpenChange(false);
      }
    };
    if (activeOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [activeOpen, handleOpenChange]);

  return (
    <SelectContext.Provider
      value={{
        value: activeValue,
        onValueChange: handleValueChange,
        open: activeOpen,
        setOpen: handleOpenChange,
        labels,
        registerLabel,
      }}
    >
      <div ref={containerRef} className="relative w-full">
        {children}
      </div>
    </SelectContext.Provider>
  );
}

export const SelectGroup = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-1", className)} {...props}>
    {children}
  </div>
);

export interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const ctx = React.useContext(SelectContext);

    return (
      <button
        ref={ref}
        type="button"
        onClick={() => ctx?.setOpen((prev) => !prev)}
        className={cn(
          "flex h-12 w-full items-center justify-between rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:border-purple-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-0 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      >
        {children}
        <ChevronDown className={cn("h-5 w-5 text-gray-400 transition-transform duration-200", ctx?.open && "rotate-180 text-purple-500")} />
      </button>
    );
  }
);
SelectTrigger.displayName = "SelectTrigger";

export const SelectValue = ({ placeholder, className }: { placeholder?: string; className?: string }) => {
  const ctx = React.useContext(SelectContext);
  const currentVal = ctx?.value;
  const label = currentVal ? ctx?.labels[currentVal] || currentVal : placeholder;

  return (
    <span className={cn("truncate text-left", !currentVal && "text-gray-400", className)}>
      {label}
    </span>
  );
};

export const SelectContent = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const ctx = React.useContext(SelectContext);
  if (!ctx?.open) return null;

  return (
    <div
      className={cn(
        "absolute left-0 top-full z-50 mt-1 max-h-60 w-full overflow-auto rounded-2xl border-2 border-purple-200 bg-white p-1 text-gray-900 shadow-2xl backdrop-blur-sm",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  disabled?: boolean;
}

export const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className, children, value, disabled, ...props }, ref) => {
    const ctx = React.useContext(SelectContext);
    const isSelected = ctx?.value === value;

    React.useEffect(() => {
      ctx?.registerLabel(value, children);
    }, [value, children, ctx]);

    return (
      <div
        ref={ref}
        onClick={() => {
          if (!disabled) {
            ctx?.onValueChange?.(value);
            ctx?.setOpen(false);
          }
        }}
        className={cn(
          "relative flex w-full cursor-pointer select-none items-center rounded-xl py-2.5 pl-8 pr-4 text-sm font-medium transition-colors",
          isSelected
            ? "bg-purple-600 text-white font-semibold"
            : "text-gray-700 hover:bg-purple-50 hover:text-purple-700",
          disabled && "pointer-events-none opacity-50",
          className
        )}
        {...props}
      >
        {isSelected && (
          <span className="absolute left-2.5 flex h-4 w-4 items-center justify-center">
            <Check className="h-4 w-4" />
          </span>
        )}
        <span className="truncate">{children}</span>
      </div>
    );
  }
);
SelectItem.displayName = "SelectItem";

export const SelectLabel = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("py-1.5 pl-8 pr-2 text-xs font-semibold text-gray-500", className)} {...props}>
    {children}
  </div>
);

export const SelectSeparator = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("-mx-1 my-1 h-px bg-gray-100", className)} {...props} />
);

export const SelectScrollUpButton = () => null;
export const SelectScrollDownButton = () => null;
