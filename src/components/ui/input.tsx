import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-md border border-line bg-raised px-3 text-sm text-fg placeholder:text-subtle outline-none transition-colors duration-150 focus:border-line-strong focus:ring-2 focus:ring-fg/20",
        className,
      )}
      {...props}
    />
  );
}
