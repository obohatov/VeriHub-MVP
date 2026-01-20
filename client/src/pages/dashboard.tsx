import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  AlertTriangle,
  FileSearch,
  TrendingUp,
  Clock,
  AlertCircle,
  FileQuestion,
  GitCompare,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MetricsCard } from "@/components/metrics-card";
import { FindingBadge } from "@/components/finding-badge";
import { SeverityIndicator } from "@/components/severity-indicator";
import { LanguageBadge } from "@/components/language-badge";
import { LoadingState } from "@/components/loading-state";
import { EmptyState } from "@/components/empty-state";
import type { DashboardMetrics, Finding } from "@/lib/types";

export default function Dashboard() {
  const { data: metrics, isLoading } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/metrics"],
  });

  if (isLoading) {
    return <LoadingState message="Loading dashboard metrics..." />;
  }

  if (!metrics) {
    return (
      <EmptyState
        icon={FileSearch}
        title="No audit data yet"
        description="Run your first audit to see metrics and findings here."
        action={
          <Link href="/audit-runs">
            <Button data-testid="button-start-audit">
              Start First Audit
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        }
      />
    );
  }

  const findingsByType = metrics.findingsByType || {
    incorrect: 0,
    outdated: 0,
    ungrounded: 0,
    drift: 0,
  };

  const findingsBySeverity = metrics.findingsBySeverity || {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            LLM audit overview and key metrics
          </p>
        </div>
        <Link href="/audit-runs">
          <Button data-testid="button-new-audit">
            <FileSearch className="mr-2 h-4 w-4" />
            New Audit Run
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricsCard
          title="Total Findings"
          value={metrics.totalFindings}
          description={`From ${metrics.totalAuditRuns} audit runs`}
          icon={AlertTriangle}
          variant={metrics.totalFindings > 0 ? "warning" : "success"}
        />
        <MetricsCard
          title="Critical Issues"
          value={findingsBySeverity.critical}
          description="Severity 8-10"
          icon={AlertCircle}
          variant={findingsBySeverity.critical > 0 ? "destructive" : "default"}
        />
        <MetricsCard
          title="FR/NL Drift"
          value={findingsByType.drift || 0}
          description="Language inconsistencies"
          icon={GitCompare}
          variant={findingsByType.drift > 0 ? "warning" : "default"}
        />
        <MetricsCard
          title="Last Audit"
          value={
            metrics.lastRunDate
              ? new Date(metrics.lastRunDate).toLocaleDateString()
              : "Never"
          }
          description={metrics.lastRunDate ? "Most recent run" : "No audits yet"}
          icon={Clock}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
            <CardTitle>Findings by Type</CardTitle>
            <Link href="/findings">
              <Button variant="ghost" size="sm" data-testid="link-view-all-findings">
                View All
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(["incorrect", "outdated", "ungrounded", "drift"] as const).map(
                (type) => {
                  const count = findingsByType[type] || 0;
                  const percentage =
                    metrics.totalFindings > 0
                      ? Math.round((count / metrics.totalFindings) * 100)
                      : 0;

                  const iconMap = {
                    incorrect: AlertCircle,
                    outdated: Clock,
                    ungrounded: FileQuestion,
                    drift: GitCompare,
                  };

                  const Icon = iconMap[type];

                  return (
                    <div
                      key={type}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium capitalize">
                            {type === "drift" ? "FR/NL Drift" : type}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {percentage}% of findings
                          </p>
                        </div>
                      </div>
                      <span className="text-lg font-semibold">{count}</span>
                    </div>
                  );
                }
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
            <CardTitle>Severity Distribution</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(
                [
                  { key: "critical", label: "Critical (8-10)", color: "bg-destructive" },
                  { key: "high", label: "High (6-7)", color: "bg-chart-3" },
                  { key: "medium", label: "Medium (4-5)", color: "bg-chart-5" },
                  { key: "low", label: "Low (0-3)", color: "bg-chart-2" },
                ] as const
              ).map(({ key, label, color }) => {
                const count = findingsBySeverity[key];
                const percentage =
                  metrics.totalFindings > 0
                    ? Math.round((count / metrics.totalFindings) * 100)
                    : 0;

                return (
                  <div key={key}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-medium">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full transition-all ${color}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {metrics.topSeverityFindings && metrics.topSeverityFindings.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
            <CardTitle>Top Severity Findings</CardTitle>
            <Link href="/findings?sort=severity">
              <Button variant="ghost" size="sm" data-testid="link-view-all-severity">
                View All
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.topSeverityFindings.slice(0, 5).map((finding: Finding) => (
                <div
                  key={finding.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <FindingBadge type={finding.type} />
                    <LanguageBadge lang={finding.lang} />
                    <span className="text-sm text-muted-foreground">
                      Question: {finding.questionId.slice(0, 8)}...
                    </span>
                  </div>
                  <SeverityIndicator severity={finding.severity} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
