import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Findings from "../pages/findings";

vi.mock("wouter", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  useLocation: () => ["/findings", vi.fn()],
}));

const mockFindings = [
  {
    id: "f1",
    auditRunId: "run1",
    questionId: "q1",
    lang: "fr",
    type: "incorrect",
    severity: 0.8,
    evidenceJson: { topic: "registration", factKey: "test" },
    suggestedFix: "Update fact",
  },
  {
    id: "f2",
    auditRunId: "run1",
    questionId: "q2",
    lang: "nl",
    type: "drift",
    severity: 0.6,
    evidenceJson: { topic: "fees", frValue: "10", nlValue: "15" },
    suggestedFix: "Align values",
  },
];

describe("Findings", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: Infinity,
        },
      },
    });
  });

  it("renders loading state initially", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Findings />
      </QueryClientProvider>
    );
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("renders findings list with correct count", async () => {
    queryClient.setQueryData(["/api/findings"], mockFindings);

    render(
      <QueryClientProvider client={queryClient}>
        <Findings />
      </QueryClientProvider>
    );

    expect(screen.getByText(/2 of 2 findings/i)).toBeInTheDocument();
  });
});
