import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Filter, X } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { FindingBadge } from "@/components/finding-badge";
import { SeverityIndicator } from "@/components/severity-indicator";
import { LanguageBadge } from "@/components/language-badge";
import { LoadingState } from "@/components/loading-state";
import { EmptyState } from "@/components/empty-state";
import type { Finding, FindingType, Language } from "@/lib/types";

export default function Findings() {
  const [typeFilter, setTypeFilter] = useState<FindingType | "all">("all");
  const [langFilter, setLangFilter] = useState<Language | "all">("all");
  const [minSeverity, setMinSeverity] = useState<string>("");
  const [topicFilter, setTopicFilter] = useState<string>("");

  const { data: findings, isLoading } = useQuery<Finding[]>({
    queryKey: ["/api/findings"],
  });

  const filteredFindings = useMemo(() => {
    if (!findings) return [];
    
    return findings.filter((finding) => {
      if (typeFilter !== "all" && finding.type !== typeFilter) return false;
      if (langFilter !== "all" && finding.lang !== langFilter) return false;
      if (minSeverity && finding.severity < parseInt(minSeverity)) return false;
      if (topicFilter) {
        const evidence = finding.evidenceJson as { topic?: string };
        if (!evidence.topic?.toLowerCase().includes(topicFilter.toLowerCase())) {
          return false;
        }
      }
      return true;
    });
  }, [findings, typeFilter, langFilter, minSeverity, topicFilter]);

  const clearFilters = () => {
    setTypeFilter("all");
    setLangFilter("all");
    setMinSeverity("");
    setTopicFilter("");
  };

  const hasFilters =
    typeFilter !== "all" ||
    langFilter !== "all" ||
    minSeverity !== "" ||
    topicFilter !== "";

  if (isLoading) {
    return <LoadingState message="Loading findings..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Findings</h1>
          <p className="text-muted-foreground">
            All detected issues across audit runs
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <AlertTriangle className="h-4 w-4" />
          <span>
            {filteredFindings.length} of {findings?.length || 0} findings
          </span>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Filters</CardTitle>
          </div>
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              data-testid="button-clear-filters"
            >
              <X className="mr-1 h-3 w-3" />
              Clear
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={typeFilter}
                onValueChange={(v) => setTypeFilter(v as FindingType | "all")}
              >
                <SelectTrigger data-testid="filter-type">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="incorrect">Incorrect</SelectItem>
                  <SelectItem value="outdated">Outdated</SelectItem>
                  <SelectItem value="ungrounded">Ungrounded</SelectItem>
                  <SelectItem value="drift">FR/NL Drift</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Language</Label>
              <Select
                value={langFilter}
                onValueChange={(v) => setLangFilter(v as Language | "all")}
              >
                <SelectTrigger data-testid="filter-language">
                  <SelectValue placeholder="All languages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All languages</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="nl">Dutch</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Min Severity</Label>
              <Select value={minSeverity} onValueChange={setMinSeverity}>
                <SelectTrigger data-testid="filter-severity">
                  <SelectValue placeholder="Any severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any severity</SelectItem>
                  <SelectItem value="8">Critical (8+)</SelectItem>
                  <SelectItem value="6">High (6+)</SelectItem>
                  <SelectItem value="4">Medium (4+)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Topic</Label>
              <Input
                placeholder="Search topic..."
                value={topicFilter}
                onChange={(e) => setTopicFilter(e.target.value)}
                data-testid="filter-topic"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Results</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredFindings.length === 0 ? (
            <EmptyState
              icon={AlertTriangle}
              title={hasFilters ? "No matching findings" : "No findings yet"}
              description={
                hasFilters
                  ? "Try adjusting your filters to see more results."
                  : "Run an audit to generate findings."
              }
              action={
                hasFilters && (
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                )
              }
            />
          ) : (
            <div className="space-y-3">
              {filteredFindings.map((finding) => {
                const evidence = finding.evidenceJson as {
                  topic?: string;
                  expectedValue?: string;
                  actualValue?: string;
                  frValue?: string;
                  nlValue?: string;
                };

                return (
                  <div
                    key={finding.id}
                    className="rounded-lg border p-4"
                    data-testid={`finding-item-${finding.id}`}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <FindingBadge type={finding.type} />
                          <LanguageBadge lang={finding.lang} />
                          {evidence.topic && (
                            <span className="rounded bg-muted px-2 py-0.5 text-xs">
                              {evidence.topic}
                            </span>
                          )}
                        </div>
                        <p className="font-mono text-xs text-muted-foreground">
                          Run: {finding.auditRunId.slice(0, 8)} | Question:{" "}
                          {finding.questionId.slice(0, 8)}
                        </p>
                      </div>
                      <SeverityIndicator severity={finding.severity} />
                    </div>

                    {finding.type === "drift" && evidence.frValue && evidence.nlValue && (
                      <div className="mt-3 grid gap-2 rounded-md bg-muted p-3 text-sm sm:grid-cols-2">
                        <div>
                          <span className="font-medium">FR: </span>
                          <span className="text-muted-foreground">
                            {evidence.frValue}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">NL: </span>
                          <span className="text-muted-foreground">
                            {evidence.nlValue}
                          </span>
                        </div>
                      </div>
                    )}

                    {finding.type !== "drift" &&
                      evidence.expectedValue &&
                      evidence.actualValue && (
                        <div className="mt-3 space-y-1 rounded-md bg-muted p-3 text-sm">
                          <div>
                            <span className="font-medium">Expected: </span>
                            <span className="text-chart-2">
                              {evidence.expectedValue}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">Actual: </span>
                            <span className="text-destructive">
                              {evidence.actualValue}
                            </span>
                          </div>
                        </div>
                      )}

                    {finding.suggestedFix && (
                      <div className="mt-3 rounded-md border border-chart-2/30 bg-chart-2/10 p-3 text-sm">
                        <span className="font-medium text-chart-2">
                          Suggested Fix:{" "}
                        </span>
                        <span>{finding.suggestedFix}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
