"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

interface AppInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  showCounter?: boolean;
  isTextArea?: boolean;
}

const Input = React.forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  AppInputProps
>(({ className, type, showCounter, isTextArea = false, ...props }, ref) => {
  const valueStr =
    typeof props.value === "string" || typeof props.value === "number"
      ? String(props.value)
      : "";

  const max = props.maxLength ?? undefined;

  const baseStyles =
    "flex w-full rounded-xl border border-input bg-secondary/60 px-3.5 py-2 text-base text-foreground shadow-[inset_0_1px_2px_rgb(0_0_0/0.25)] ring-offset-background transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground/70 hover:border-border focus-visible:border-gold/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm";

  return (
    <div className="w-full">
      {isTextArea ? (
        <textarea
          className={cn(
            baseStyles,
            "min-h-[100px] resize-none",
            showCounter ? "pr-12" : "",
            className,
          )}
          ref={ref as React.Ref<HTMLTextAreaElement>}
          {...(props as unknown as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          type={type}
          className={cn(
            baseStyles,
            "h-11",
            showCounter ? "pr-12" : "",
            className,
          )}
          ref={ref as React.Ref<HTMLInputElement>}
          {...props}
        />
      )}

      {showCounter && (
        <div className="w-full text-end mt-2 text-xs text-muted-foreground pointer-events-none">
          {valueStr.length}
          {max ? `/${max}` : ""}
        </div>
      )}
    </div>
  );
});

Input.displayName = "Input";

export { Input };
