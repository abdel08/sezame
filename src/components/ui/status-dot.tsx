import { cn } from "@/lib/utils";

interface StatusDotProps {
  status: "accepte" | "en_attente" | "refuse";
  className?: string;
}

const statusColors: Record<StatusDotProps["status"], string> = {
  accepte: "bg-green-500",
  en_attente: "bg-yellow-400",
  refuse: "bg-red-500",
};

export function StatusDot({ status, className }: StatusDotProps) {
  return (
    <span className={cn("relative flex h-3 w-3", className)}>
      <span
        className={cn(
          "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
          statusColors[status]
        )}
      />
      <span
        className={cn(
          "relative inline-flex h-3 w-3 rounded-full",
          statusColors[status]
        )}
      />
    </span>
  );
}
