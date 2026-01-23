import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Dashboard from "../pages/dashboard";

vi.mock("wouter", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  useLocation: () => ["/", vi.fn()],
}));

const mockMetrics = {
  totalFindings: 15,
  findingsByType: { incorrect: 5, outdated: 3, ungrounded: 4, drift: 3 },
  findingsBySeverity: { critical: 2, high: 5, medium: 6, low: 2 },
  totalAuditRuns: 2,
  totalFacts: 28,
  recentFindings: [],
};

describe("Dashboard", () => {
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
        <Dashboard />
      </QueryClientProvider>
    );
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("renders dashboard metrics when data is available", async () => {
    queryClient.setQueryData(["/api/dashboard/metrics"], mockMetrics);

    render(
      <QueryClientProvider client={queryClient}>
        <Dashboard />
      </QueryClientProvider>
    );

    expect(screen.getByText(/total findings/i)).toBeInTheDocument();
    expect(screen.getByText("15")).toBeInTheDocument();
  });
});
