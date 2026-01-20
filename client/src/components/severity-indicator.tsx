import { cn } from "@/lib/utils";

interface SeverityIndicatorProps {
  severity: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function SeverityIndicator({
  severity,
  showLabel = true,
  size = "md",
  className,
}: SeverityIndicatorProps) {
  const getSeverityColor = (sev: number) => {
    if (sev >= 8) return "bg-destructive";
    if (sev >= 6) return "bg-chart-3";
    if (sev >= 4) return "bg-chart-5";
    return "bg-chart-2";
  };

  const getSeverityLabel = (sev: number) => {
    if (sev >= 8) return "Critical";
    if (sev >= 6) return "High";
    if (sev >= 4) return "Medium";
    return "Low";
  };

  const getSeverityTextColor = (sev: number) => {
    if (sev >= 8) return "text-destructive";
    if (sev >= 6) return "text-chart-3";
    if (sev >= 4) return "text-chart-5";
    return "text-chart-2";
  };

  const sizeClasses = {
    sm: "h-1.5 w-16",
    md: "h-2 w-20",
    lg: "h-2.5 w-24",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("rounded-full bg-muted overflow-hidden", sizeClasses[size])}>
        <div
          className={cn("h-full rounded-full transition-all", getSeverityColor(severity))}
          style={{ width: `${(severity / 10) * 100}%` }}
        />
      </div>
      {showLabel && (
        <span className={cn("text-xs font-medium", getSeverityTextColor(severity))}>
          {getSeverityLabel(severity)} ({severity})
        </span>
      )}
    </div>
  );
}
