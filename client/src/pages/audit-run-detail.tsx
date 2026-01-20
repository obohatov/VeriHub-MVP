import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { format } from "date-fns";
import {
  ArrowLeft,
  AlertTriangle,
  FileSearch,
  Clock,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { FindingBadge } from "@/components/finding-badge";
import { SeverityIndicator } from "@/components/severity-indicator";
import { LanguageBadge } from "@/components/language-badge";
import { LoadingState } from "@/components/loading-state";
import { EmptyState } from "@/components/empty-state";
import type { AuditRun, Finding, QuestionSet } from "@/lib/types";

export default function AuditRunDetail() {
  const { id } = useParams<{ id: string }>();

  const { data: auditRun, isLoading: runLoading } = useQuery<AuditRun>({
    queryKey: ["/api/audit-runs", id],
  });

  const { data: findings, isLoading: findingsLoading } = useQuery<Finding[]>({
    queryKey: ["/api/audit-runs", id, "findings"],
    enabled: !!id,
  });

  const { data: questionSets } = useQuery<QuestionSet[]>({
    queryKey: ["/api/question-sets"],
  });

  if (runLoading || findingsLoading) {
    return <LoadingState message="Loading audit run details..." />;
  }

  if (!auditRun) {
    return (
      <EmptyState
        icon={FileSearch}
        title="Audit run not found"
        description="The audit run you're looking for doesn't exist."
        action={
          <Link href="/audit-runs">
            <Button data-testid="button-back-to-runs">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Audit Runs
            </Button>
          </Link>
        }
      />
    );
  }

  const questionSet = questionSets?.find((qs) => qs.id === auditRun.questionSetId);

  const findingCounts = findings?.reduce(
    (acc, finding) => {
      acc[finding.type] = (acc[finding.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  ) || {};

  const severityCounts = findings?.reduce(
    (acc, finding) => {
      if (finding.severity >= 8) acc.critical++;
      else if (finding.severity >= 6) acc.high++;
      else if (finding.severity >= 4) acc.medium++;
      else acc.low++;
      return acc;
    },
    { critical: 0, high: 0, medium: 0, low: 0 }
  ) || { critical: 0, high: 0, medium: 0, low: 0 };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/audit-runs">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Audit Run</h1>
            <StatusBadge status={auditRun.status} />
          </div>
          <p className="font-mono text-sm text-muted-foreground">{auditRun.id}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                <FileSearch className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Question Set</p>
                <p className="font-medium">{questionSet?.title || "Unknown"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-chart-2/10">
                <CheckCircle className="h-5 w-5 text-chart-2" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Provider</p>
                <p className="font-mono font-medium">{auditRun.provider}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-chart-3/10">
                <Clock className="h-5 w-5 text-chart-3" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium">
                  {format(new Date(auditRun.createdAt), "MMM d, yyyy HH:mm")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Findings</p>
                <p className="font-medium">{findings?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Findings by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {(["incorrect", "outdated", "ungrounded", "drift"] as const).map(
                (type) => (
                  <div
                    key={type}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <FindingBadge type={type} />
                    <span className="text-lg font-bold">
                      {findingCounts[type] || 0}
                    </span>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Severity Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(
                [
                  { key: "critical", label: "Critical", color: "bg-destructive" },
                  { key: "high", label: "High", color: "bg-chart-3" },
                  { key: "medium", label: "Medium", color: "bg-chart-5" },
                  { key: "low", label: "Low", color: "bg-chart-2" },
                ] as const
              ).map(({ key, label, color }) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${color}`} />
                    <span className="text-sm">{label}</span>
                  </div>
                  <span className="font-medium">{severityCounts[key]}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Findings</CardTitle>
        </CardHeader>
        <CardContent>
          {!findings || findings.length === 0 ? (
            <EmptyState
              icon={CheckCircle}
              title="No findings"
              description="This audit run completed without any findings."
            />
          ) : (
            <div className="space-y-3">
              {findings.map((finding) => (
                <div
                  key={finding.id}
                  className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                  data-testid={`finding-${finding.id}`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <FindingBadge type={finding.type} />
                    <LanguageBadge lang={finding.lang} />
                    <span className="font-mono text-xs text-muted-foreground">
                      Q: {finding.questionId.slice(0, 12)}...
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <SeverityIndicator severity={finding.severity} />
                    {finding.suggestedFix && (
                      <span className="text-xs text-muted-foreground">
                        Fix available
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
