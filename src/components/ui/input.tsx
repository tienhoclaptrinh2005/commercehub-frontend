import { forwardRef, type InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, hasError = false, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-12 w-full rounded-xl border bg-white px-11 pr-4 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10",
        hasError
          ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/10"
          : "border-slate-200",
        className,
      )}
      aria-invalid={hasError || undefined}
      {...props}
    />
  ),
);

Input.displayName = "Input";
