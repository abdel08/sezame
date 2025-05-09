import { cn } from "@/lib/utils";
import * as React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "danger" | "warning" | "outline";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variantClasses = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-green-100 text-green-800",
    danger: "bg-red-100 text-red-800",
    warning: "bg-yellow-100 text-yellow-800",
    outline: "border border-gray-300 text-gray-800",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
