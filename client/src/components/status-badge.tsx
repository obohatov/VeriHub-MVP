import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AuditStatus } from "@/lib/types";
import { CheckCircle, Clock, Loader2, XCircle } from "lucide-react";

interface StatusBadgeProps {
  status: AuditStatus;
  className?: string;
}

const statusConfig: Record<
  AuditStatus,
  { label: string; variant: string; icon: typeof CheckCircle }
> = {
  pending: {
    label: "Pending",
    variant: "bg-muted text-muted-foreground border-border",
    icon: Clock,
  },
  running: {
    label: "Running",
    variant: "bg-chart-1/15 text-chart-1 border-chart-1/30",
    icon: Loader2,
  },
  completed: {
    label: "Completed",
    variant: "bg-chart-2/15 text-chart-2 border-chart-2/30",
    icon: CheckCircle,
  },
  failed: {
    label: "Failed",
    variant: "bg-destructive/15 text-destructive border-destructive/30",
    icon: XCircle,
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn("gap-1 border", config.variant, className)}
    >
      <Icon className={cn("h-3 w-3", status === "running" && "animate-spin")} />
      {config.label}
    </Badge>
  );
}
