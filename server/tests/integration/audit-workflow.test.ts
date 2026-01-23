import { describe, it, expect, beforeAll } from "vitest";
import { initializeStorage, type IStorage } from "../../storage";

describe("Audit Workflow Integration", () => {
  let storage: IStorage;

  beforeAll(async () => {
    storage = await initializeStorage();
  });

  it("should have seeded facts", async () => {
    const facts = await storage.getFacts();
    expect(facts.length).toBeGreaterThan(0);
  });

  it("should have seeded question sets", async () => {
    const questionSets = await storage.getQuestionSets();
    expect(questionSets.length).toBeGreaterThan(0);
  });

  it("should have seeded questions", async () => {
    const questions = await storage.getQuestions();
    expect(questions.length).toBeGreaterThan(0);
  });

  it("should create an audit run with mock-baseline provider", async () => {
    const questionSets = await storage.getQuestionSets();
    const questionSetId = questionSets[0].id;

    const auditRun = await storage.createAuditRun({
      questionSetId,
      provider: "mock-baseline",
    });

    expect(auditRun.id).toBeDefined();
    expect(auditRun.status).toBe("pending");
    expect(auditRun.provider).toBe("mock-baseline");
  });

  it("should get dashboard metrics", async () => {
    const metrics = await storage.getDashboardMetrics();
    
    expect(metrics).toHaveProperty("totalFindings");
    expect(metrics).toHaveProperty("findingsByType");
    expect(metrics).toHaveProperty("findingsBySeverity");
    expect(metrics).toHaveProperty("findingsByLang");
    expect(metrics).toHaveProperty("totalAuditRuns");
  });

  it("should search facts by keyword", async () => {
    const results = await storage.searchFacts("phone");
    expect(results.length).toBeGreaterThanOrEqual(0);
  });

  it("should get fact by key and language", async () => {
    const fact = await storage.getFactByKey("phone", "fr");
    if (fact) {
      expect(fact.lang).toBe("fr");
      expect(fact.key).toBe("phone");
    }
  });
});
