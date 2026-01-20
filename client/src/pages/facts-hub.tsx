import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Database,
  Plus,
  Search,
  Edit,
  Save,
  X,
  ExternalLink,
  Link as LinkIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LanguageBadge } from "@/components/language-badge";
import { LoadingState } from "@/components/loading-state";
import { EmptyState } from "@/components/empty-state";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Fact, InsertFact, Language } from "@/lib/types";

export default function FactsHub() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [langFilter, setLangFilter] = useState<Language | "all">("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFact, setEditingFact] = useState<Fact | null>(null);
  const [formData, setFormData] = useState<Partial<InsertFact>>({});

  const { data: facts, isLoading } = useQuery<Fact[]>({
    queryKey: ["/api/facts"],
  });

  const createFactMutation = useMutation({
    mutationFn: async (data: InsertFact) => {
      return apiRequest("POST", "/api/facts", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/facts"] });
      closeDialog();
      toast({ title: "Fact created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create fact", variant: "destructive" });
    },
  });

  const updateFactMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertFact> }) => {
      return apiRequest("PUT", `/api/facts/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/facts"] });
      closeDialog();
      toast({ title: "Fact updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update fact", variant: "destructive" });
    },
  });

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingFact(null);
    setFormData({});
  };

  const openCreateDialog = () => {
    setFormData({
      key: "",
      lang: "fr",
      value: "",
      sourceRef: "",
      lastVerified: new Date().toISOString().split("T")[0],
      linkedFactId: null,
      topic: null,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (fact: Fact) => {
    setEditingFact(fact);
    setFormData({
      key: fact.key,
      lang: fact.lang,
      value: fact.value,
      sourceRef: fact.sourceRef,
      lastVerified: fact.lastVerified,
      linkedFactId: fact.linkedFactId,
      topic: fact.topic,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingFact) {
      updateFactMutation.mutate({ id: editingFact.id, data: formData });
    } else {
      createFactMutation.mutate(formData as InsertFact);
    }
  };

  const filteredFacts = facts?.filter((fact) => {
    if (langFilter !== "all" && fact.lang !== langFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        fact.key.toLowerCase().includes(query) ||
        fact.value.toLowerCase().includes(query) ||
        fact.topic?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const linkedFacts = facts?.filter(
    (f) =>
      f.id !== editingFact?.id &&
      f.lang !== formData.lang
  );

  if (isLoading) {
    return <LoadingState message="Loading facts..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Facts Hub</h1>
          <p className="text-muted-foreground">
            Manage verified facts and sources
          </p>
        </div>
        <Button onClick={openCreateDialog} data-testid="button-add-fact">
          <Plus className="mr-2 h-4 w-4" />
          Add Fact
        </Button>
      </div>

      <Card>
        <CardHeader className="space-y-0 pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base">All Facts</CardTitle>
            <div className="flex flex-1 gap-2 sm:max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search facts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  data-testid="input-search-facts"
                />
              </div>
              <Select
                value={langFilter}
                onValueChange={(v) => setLangFilter(v as Language | "all")}
              >
                <SelectTrigger className="w-32" data-testid="filter-fact-language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="nl">Dutch</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!filteredFacts || filteredFacts.length === 0 ? (
            <EmptyState
              icon={Database}
              title="No facts found"
              description={
                searchQuery
                  ? "Try adjusting your search query."
                  : "Add your first fact to build the knowledge base."
              }
              action={
                !searchQuery && (
                  <Button onClick={openCreateDialog}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Fact
                  </Button>
                )
              }
            />
          ) : (
            <div className="space-y-3">
              {filteredFacts.map((fact) => {
                const linkedFact = fact.linkedFactId
                  ? facts?.find((f) => f.id === fact.linkedFactId)
                  : null;

                return (
                  <div
                    key={fact.id}
                    className="group rounded-lg border p-4"
                    data-testid={`fact-item-${fact.id}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <LanguageBadge lang={fact.lang} />
                          <span className="rounded bg-primary/10 px-2 py-0.5 font-mono text-xs text-primary">
                            {fact.key}
                          </span>
                          {fact.topic && (
                            <span className="rounded bg-muted px-2 py-0.5 text-xs">
                              {fact.topic}
                            </span>
                          )}
                        </div>
                        <p className="text-sm">{fact.value}</p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <ExternalLink className="h-3 w-3" />
                            {fact.sourceRef}
                          </span>
                          <span>
                            Verified:{" "}
                            {format(new Date(fact.lastVerified), "MMM d, yyyy")}
                          </span>
                          {linkedFact && (
                            <span className="flex items-center gap-1 text-primary">
                              <LinkIcon className="h-3 w-3" />
                              Linked to {linkedFact.lang.toUpperCase()}:{" "}
                              {linkedFact.key}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={() => openEditDialog(fact)}
                        data-testid={`button-edit-fact-${fact.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingFact ? "Edit Fact" : "Add New Fact"}
            </DialogTitle>
            <DialogDescription>
              {editingFact
                ? "Update the fact details below."
                : "Add a new verified fact to the knowledge base."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="key">Key</Label>
                <Input
                  id="key"
                  placeholder="e.g., city_hall_phone"
                  value={formData.key || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, key: e.target.value })
                  }
                  data-testid="input-fact-key"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lang">Language</Label>
                <Select
                  value={formData.lang}
                  onValueChange={(v) =>
                    setFormData({ ...formData, lang: v as Language })
                  }
                >
                  <SelectTrigger data-testid="select-fact-language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="nl">Dutch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="value">Value</Label>
              <Textarea
                id="value"
                placeholder="The verified fact content..."
                value={formData.value || ""}
                onChange={(e) =>
                  setFormData({ ...formData, value: e.target.value })
                }
                className="resize-none"
                rows={3}
                data-testid="input-fact-value"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sourceRef">Source Reference</Label>
                <Input
                  id="sourceRef"
                  placeholder="URL or file path"
                  value={formData.sourceRef || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, sourceRef: e.target.value })
                  }
                  data-testid="input-fact-source"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastVerified">Last Verified</Label>
                <Input
                  id="lastVerified"
                  type="date"
                  value={formData.lastVerified || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, lastVerified: e.target.value })
                  }
                  data-testid="input-fact-verified"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="topic">Topic (Optional)</Label>
                <Input
                  id="topic"
                  placeholder="e.g., contact, hours"
                  value={formData.topic || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      topic: e.target.value || null,
                    })
                  }
                  data-testid="input-fact-topic"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedFact">Linked Fact (Optional)</Label>
                <Select
                  value={formData.linkedFactId || "none"}
                  onValueChange={(v) =>
                    setFormData({
                      ...formData,
                      linkedFactId: v === "none" ? null : v,
                    })
                  }
                >
                  <SelectTrigger data-testid="select-linked-fact">
                    <SelectValue placeholder="Link to FR/NL pair" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {linkedFacts?.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.lang.toUpperCase()}: {f.key}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                !formData.key ||
                !formData.value ||
                !formData.sourceRef ||
                createFactMutation.isPending ||
                updateFactMutation.isPending
              }
              data-testid="button-save-fact"
            >
              <Save className="mr-2 h-4 w-4" />
              {editingFact ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
