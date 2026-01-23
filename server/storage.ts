import { runMigrations } from "./db/migrate";
import { DbStorage } from "./db/dbStorage";
import type {
  Fact,
  InsertFact,
  QuestionSet,
  InsertQuestionSet,
  Question,
  InsertQuestion,
  AuditRun,
  InsertAuditRun,
  Answer,
  InsertAnswer,
  Finding,
  InsertFinding,
  DashboardMetrics,
  Comparison,
  Language,
} from "@shared/schema";

export interface IStorage {
  getFacts(): Promise<Fact[]>;
  getFact(id: string): Promise<Fact | undefined>;
  getFactByKey(key: string, lang: Language): Promise<Fact | undefined>;
  searchFacts(query: string): Promise<Fact[]>;
  createFact(fact: InsertFact): Promise<Fact>;
  updateFact(id: string, fact: Partial<InsertFact>): Promise<Fact | undefined>;
  deleteFact(id: string): Promise<boolean>;

  getQuestionSets(): Promise<QuestionSet[]>;
  getQuestionSet(id: string): Promise<QuestionSet | undefined>;
  createQuestionSet(qs: InsertQuestionSet): Promise<QuestionSet>;

  getQuestions(): Promise<Question[]>;
  getQuestionsBySet(questionSetId: string): Promise<Question[]>;
  getQuestion(id: string): Promise<Question | undefined>;
  createQuestion(question: InsertQuestion): Promise<Question>;

  getAuditRuns(): Promise<AuditRun[]>;
  getAuditRun(id: string): Promise<AuditRun | undefined>;
  createAuditRun(run: InsertAuditRun): Promise<AuditRun>;
  updateAuditRun(id: string, run: Partial<AuditRun>): Promise<AuditRun | undefined>;

  getAnswersByRun(auditRunId: string): Promise<Answer[]>;
  createAnswer(answer: InsertAnswer): Promise<Answer>;

  getFindings(): Promise<Finding[]>;
  getFindingsByRun(auditRunId: string): Promise<Finding[]>;
  createFinding(finding: InsertFinding): Promise<Finding>;

  getDashboardMetrics(): Promise<DashboardMetrics>;
  getComparison(baselineId: string, currentId: string): Promise<Comparison | null>;
  seedData(): Promise<void>;
}

export async function initializeStorage(): Promise<IStorage> {
  console.log("[storage] Initializing database...");
  await runMigrations();
  const storage = new DbStorage();
  await storage.seedData();
  return storage;
}

let _storage: IStorage | null = null;

export async function getStorage(): Promise<IStorage> {
  if (!_storage) {
    _storage = await initializeStorage();
  }
  return _storage;
}

export const storage = new DbStorage();
