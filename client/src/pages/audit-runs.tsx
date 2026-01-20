import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { format } from "date-fns";
import {
  FileSearch,
  Plus,
  ArrowRight,
  Play,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/status-badge";
import { LoadingState } from "@/components/loading-state";
import { EmptyState } from "@/components/empty-state";
import { DataTable } from "@/components/data-table";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { AuditRun, QuestionSet } from "@/lib/types";

export default function AuditRuns() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedQuestionSet, setSelectedQuestionSet] = useState<string>("");
  const [selectedBaseline, setSelectedBaseline] = useState<string>("");

  const { data: auditRuns, isLoading } = useQuery<AuditRun[]>({
    queryKey: ["/api/audit-runs"],
  });

  const { data: questionSets } = useQuery<QuestionSet[]>({
    queryKey: ["/api/question-sets"],
  });

  const createAuditMutation = useMutation({
    mutationFn: async (data: { questionSetId: string; baselineRunId?: string }) => {
      return apiRequest("POST", "/api/audit-runs", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audit-runs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      setIsDialogOpen(false);
      setSelectedQuestionSet("");
      setSelectedBaseline("");
      toast({
        title: "Audit Started",
        description: "The audit run has been started successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start audit run. Please try again.",
        variant: "destructive",
      });
    },
  });

  const completedRuns = auditRuns?.filter((r) => r.status === "completed") || [];

  const columns = [
    {
      key: "id",
      header: "Run ID",
      render: (run: AuditRun) => (
        <span className="font-mono text-sm">{run.id.slice(0, 8)}...</span>
      ),
    },
    {
      key: "questionSetId",
      header: "Question Set",
      render: (run: AuditRun) => {
        const qs = questionSets?.find((q) => q.id === run.questionSetId);
        return (
          <span className="text-sm">
            {qs?.title || run.questionSetId.slice(0, 8) + "..."}
          </span>
        );
      },
    },
    {
      key: "provider",
      header: "Provider",
      render: (run: AuditRun) => (
        <span className="rounded bg-muted px-2 py-1 font-mono text-xs">
          {run.provider}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (run: AuditRun) => <StatusBadge status={run.status} />,
    },
    {
      key: "createdAt",
      header: "Created",
      render: (run: AuditRun) => (
        <span className="text-sm text-muted-foreground">
          {format(new Date(run.createdAt), "MMM d, yyyy HH:mm")}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (run: AuditRun) => (
        <Link href={`/audit-runs/${run.id}`}>
          <Button variant="ghost" size="sm" data-testid={`link-audit-details-${run.id}`}>
            View Details
            <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </Link>
      ),
      className: "text-right",
    },
  ];

  if (isLoading) {
    return <LoadingState message="Loading audit runs..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Audit Runs</h1>
          <p className="text-muted-foreground">
            Manage and view LLM audit runs
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-new-audit-run">
              <Plus className="mr-2 h-4 w-4" />
              New Audit Run
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Start New Audit Run</DialogTitle>
              <DialogDescription>
                Select a question set to run the LLM audit against.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="question-set">Question Set</Label>
                <Select
                  value={selectedQuestionSet}
                  onValueChange={setSelectedQuestionSet}
                >
                  <SelectTrigger data-testid="select-question-set">
                    <SelectValue placeholder="Select a question set" />
                  </SelectTrigger>
                  <SelectContent>
                    {questionSets?.map((qs) => (
                      <SelectItem key={qs.id} value={qs.id}>
                        {qs.title} (v{qs.version})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {completedRuns.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="baseline">Baseline Run (Optional)</Label>
                  <Select
                    value={selectedBaseline}
                    onValueChange={setSelectedBaseline}
                  >
                    <SelectTrigger data-testid="select-baseline">
                      <SelectValue placeholder="Compare against baseline..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No baseline</SelectItem>
                      {completedRuns.map((run) => (
                        <SelectItem key={run.id} value={run.id}>
                          {format(new Date(run.createdAt), "MMM d, HH:mm")} -{" "}
                          {run.id.slice(0, 8)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Compare results against a previous run to see improvements.
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                data-testid="button-cancel-audit"
              >
                Cancel
              </Button>
              <Button
                onClick={() =>
                  createAuditMutation.mutate({
                    questionSetId: selectedQuestionSet,
                    baselineRunId:
                      selectedBaseline && selectedBaseline !== "none"
                        ? selectedBaseline
                        : undefined,
                  })
                }
                disabled={!selectedQuestionSet || createAuditMutation.isPending}
                data-testid="button-start-audit-run"
              >
                {createAuditMutation.isPending ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Start Audit
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Audit Runs</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={auditRuns || []}
            columns={columns}
            keyExtractor={(run) => run.id}
            onRowClick={(run) => setLocation(`/audit-runs/${run.id}`)}
            emptyState={
              <EmptyState
                icon={FileSearch}
                title="No audit runs yet"
                description="Start your first audit run to analyze LLM responses for civic services."
                action={
                  <Button onClick={() => setIsDialogOpen(true)} data-testid="button-empty-new-audit">
                    <Plus className="mr-2 h-4 w-4" />
                    Start First Audit
                  </Button>
                }
              />
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
