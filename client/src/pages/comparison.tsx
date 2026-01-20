import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  GitCompare,
  TrendingDown,
  TrendingUp,
  Minus,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { FindingBadge } from "@/components/finding-badge";
import { SeverityIndicator } from "@/components/severity-indicator";
import { LanguageBadge } from "@/components/language-badge";
import { LoadingState } from "@/components/loading-state";
import { EmptyState } from "@/components/empty-state";
import type { AuditRun, Comparison, FindingType } from "@/lib/types";

export default function ComparisonPage() {
  const [baselineId, setBaselineId] = useState<string>("");
  const [currentId, setCurrentId] = useState<string>("");

  const { data: auditRuns, isLoading: runsLoading } = useQuery<AuditRun[]>({
    queryKey: ["/api/audit-runs"],
  });

  const { data: comparison, isLoading: comparisonLoading } =
    useQuery<Comparison>({
      queryKey: ["/api/comparison", baselineId, currentId],
      enabled: !!baselineId && !!currentId && baselineId !== currentId,
    });

  const completedRuns =
    auditRuns?.filter((r) => r.status === "completed") || [];

  const validCurrentRuns = completedRuns.filter((r) => r.id !== baselineId);

  if (runsLoading) {
    return <LoadingState message="Loading audit runs..." />;
  }

  if (completedRuns.length < 2) {
    return (
      <EmptyState
        icon={GitCompare}
        title="Not enough runs for comparison"
        description="You need at least 2 completed audit runs to compare results. Run more audits to see before/after improvements."
      />
    );
  }

  const getTrendIcon = (change: number) => {
    if (change < 0) return <TrendingDown className="h-4 w-4 text-chart-2" />;
    if (change > 0) return <TrendingUp className="h-4 w-4 text-destructive" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getTrendText = (change: number) => {
    if (change < 0) return `${Math.abs(change)} fewer`;
    if (change > 0) return `${change} more`;
    return "No change";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Before/After Comparison</h1>
        <p className="text-muted-foreground">
          Compare findings between audit runs to measure improvements
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Select Runs to Compare</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end">
            <div className="w-full space-y-2 sm:w-auto sm:min-w-[200px]">
              <Label>Baseline Run (Before)</Label>
              <Select value={baselineId} onValueChange={setBaselineId}>
                <SelectTrigger data-testid="select-baseline-run">
                  <SelectValue placeholder="Select baseline..." />
                </SelectTrigger>
                <SelectContent>
                  {completedRuns.map((run) => (
                    <SelectItem key={run.id} value={run.id}>
                      {format(new Date(run.createdAt), "MMM d, HH:mm")} -{" "}
                      {run.id.slice(0, 8)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <ArrowRight className="hidden h-5 w-5 text-muted-foreground sm:block" />
            <div className="w-full space-y-2 sm:w-auto sm:min-w-[200px]">
              <Label>Current Run (After)</Label>
              <Select
                value={currentId}
                onValueChange={setCurrentId}
                disabled={!baselineId}
              >
                <SelectTrigger data-testid="select-current-run">
                  <SelectValue placeholder="Select current..." />
                </SelectTrigger>
                <SelectContent>
                  {validCurrentRuns.map((run) => (
                    <SelectItem key={run.id} value={run.id}>
                      {format(new Date(run.createdAt), "MMM d, HH:mm")} -{" "}
                      {run.id.slice(0, 8)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {comparisonLoading && (
        <LoadingState message="Calculating comparison..." />
      )}

      {comparison && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {(["incorrect", "outdated", "ungrounded", "drift"] as FindingType[]).map(
              (type) => {
                const baseline = comparison.baselineCounts[type] || 0;
                const current = comparison.currentCounts[type] || 0;
                const change = current - baseline;

                return (
                  <Card key={type}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <FindingBadge type={type} />
                        {getTrendIcon(change)}
                      </div>
                      <div className="mt-4 flex items-baseline gap-2">
                        <span className="text-3xl font-bold">{current}</span>
                        <span className="text-sm text-muted-foreground">
                          from {baseline}
                        </span>
                      </div>
                      <p
                        className={`mt-1 text-sm ${
                          change < 0
                            ? "text-chart-2"
                            : change > 0
                            ? "text-destructive"
                            : "text-muted-foreground"
                        }`}
                      >
                        {getTrendText(change)}
                      </p>
                    </CardContent>
                  </Card>
                );
              }
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center gap-2 space-y-0">
                <CheckCircle className="h-5 w-5 text-chart-2" />
                <CardTitle>Resolved Findings</CardTitle>
              </CardHeader>
              <CardContent>
                {comparison.resolvedFindings.length === 0 ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    No findings were resolved between runs.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {comparison.resolvedFindings.slice(0, 10).map((finding) => (
                      <div
                        key={finding.id}
                        className="flex items-center justify-between rounded-md border border-chart-2/30 bg-chart-2/5 p-3"
                      >
                        <div className="flex items-center gap-2">
                          <FindingBadge type={finding.type} />
                          <LanguageBadge lang={finding.lang} />
                        </div>
                        <SeverityIndicator
                          severity={finding.severity}
                          size="sm"
                        />
                      </div>
                    ))}
                    {comparison.resolvedFindings.length > 10 && (
                      <p className="pt-2 text-center text-sm text-muted-foreground">
                        +{comparison.resolvedFindings.length - 10} more resolved
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center gap-2 space-y-0">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <CardTitle>New Findings</CardTitle>
              </CardHeader>
              <CardContent>
                {comparison.newFindings.length === 0 ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    No new findings detected in the current run.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {comparison.newFindings.slice(0, 10).map((finding) => (
                      <div
                        key={finding.id}
                        className="flex items-center justify-between rounded-md border border-destructive/30 bg-destructive/5 p-3"
                      >
                        <div className="flex items-center gap-2">
                          <FindingBadge type={finding.type} />
                          <LanguageBadge lang={finding.lang} />
                        </div>
                        <SeverityIndicator
                          severity={finding.severity}
                          size="sm"
                        />
                      </div>
                    ))}
                    {comparison.newFindings.length > 10 && (
                      <p className="pt-2 text-center text-sm text-muted-foreground">
                        +{comparison.newFindings.length - 10} more new
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg bg-muted p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Total Baseline Findings
                  </p>
                  <p className="text-2xl font-bold">
                    {Object.values(comparison.baselineCounts).reduce(
                      (a, b) => a + b,
                      0
                    )}
                  </p>
                </div>
                <div className="rounded-lg bg-muted p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Total Current Findings
                  </p>
                  <p className="text-2xl font-bold">
                    {Object.values(comparison.currentCounts).reduce(
                      (a, b) => a + b,
                      0
                    )}
                  </p>
                </div>
                <div className="rounded-lg bg-muted p-4 text-center">
                  <p className="text-sm text-muted-foreground">Net Change</p>
                  {(() => {
                    const baseTotal = Object.values(
                      comparison.baselineCounts
                    ).reduce((a, b) => a + b, 0);
                    const currentTotal = Object.values(
                      comparison.currentCounts
                    ).reduce((a, b) => a + b, 0);
                    const diff = currentTotal - baseTotal;
                    return (
                      <p
                        className={`text-2xl font-bold ${
                          diff < 0
                            ? "text-chart-2"
                            : diff > 0
                            ? "text-destructive"
                            : ""
                        }`}
                      >
                        {diff > 0 ? "+" : ""}
                        {diff}
                      </p>
                    );
                  })()}
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
