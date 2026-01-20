import { randomUUID } from "crypto";
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
  FindingType,
  Language,
} from "@shared/schema";

export interface IStorage {
  // Facts
  getFacts(): Promise<Fact[]>;
  getFact(id: string): Promise<Fact | undefined>;
  getFactByKey(key: string, lang: Language): Promise<Fact | undefined>;
  searchFacts(query: string): Promise<Fact[]>;
  createFact(fact: InsertFact): Promise<Fact>;
  updateFact(id: string, fact: Partial<InsertFact>): Promise<Fact | undefined>;
  deleteFact(id: string): Promise<boolean>;

  // Question Sets
  getQuestionSets(): Promise<QuestionSet[]>;
  getQuestionSet(id: string): Promise<QuestionSet | undefined>;
  createQuestionSet(qs: InsertQuestionSet): Promise<QuestionSet>;

  // Questions
  getQuestions(): Promise<Question[]>;
  getQuestionsBySet(questionSetId: string): Promise<Question[]>;
  getQuestion(id: string): Promise<Question | undefined>;
  createQuestion(question: InsertQuestion): Promise<Question>;

  // Audit Runs
  getAuditRuns(): Promise<AuditRun[]>;
  getAuditRun(id: string): Promise<AuditRun | undefined>;
  createAuditRun(run: InsertAuditRun): Promise<AuditRun>;
  updateAuditRun(id: string, run: Partial<AuditRun>): Promise<AuditRun | undefined>;

  // Answers
  getAnswersByRun(auditRunId: string): Promise<Answer[]>;
  createAnswer(answer: InsertAnswer): Promise<Answer>;

  // Findings
  getFindings(): Promise<Finding[]>;
  getFindingsByRun(auditRunId: string): Promise<Finding[]>;
  createFinding(finding: InsertFinding): Promise<Finding>;

  // Dashboard
  getDashboardMetrics(): Promise<DashboardMetrics>;

  // Comparison
  getComparison(baselineId: string, currentId: string): Promise<Comparison | null>;

  // Seeding
  seedData(): Promise<void>;
}

export class MemStorage implements IStorage {
  private facts: Map<string, Fact> = new Map();
  private questionSets: Map<string, QuestionSet> = new Map();
  private questions: Map<string, Question> = new Map();
  private auditRuns: Map<string, AuditRun> = new Map();
  private answers: Map<string, Answer> = new Map();
  private findings: Map<string, Finding> = new Map();

  // Facts
  async getFacts(): Promise<Fact[]> {
    return Array.from(this.facts.values());
  }

  async getFact(id: string): Promise<Fact | undefined> {
    return this.facts.get(id);
  }

  async getFactByKey(key: string, lang: Language): Promise<Fact | undefined> {
    return Array.from(this.facts.values()).find(
      (f) => f.key === key && f.lang === lang
    );
  }

  async searchFacts(query: string): Promise<Fact[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.facts.values()).filter(
      (f) =>
        f.key.toLowerCase().includes(lowerQuery) ||
        f.value.toLowerCase().includes(lowerQuery) ||
        f.topic?.toLowerCase().includes(lowerQuery)
    );
  }

  async createFact(fact: InsertFact): Promise<Fact> {
    const id = randomUUID();
    const newFact: Fact = { id, ...fact };
    this.facts.set(id, newFact);
    return newFact;
  }

  async updateFact(id: string, updates: Partial<InsertFact>): Promise<Fact | undefined> {
    const fact = this.facts.get(id);
    if (!fact) return undefined;
    const updated = { ...fact, ...updates };
    this.facts.set(id, updated);
    return updated;
  }

  async deleteFact(id: string): Promise<boolean> {
    return this.facts.delete(id);
  }

  // Question Sets
  async getQuestionSets(): Promise<QuestionSet[]> {
    return Array.from(this.questionSets.values());
  }

  async getQuestionSet(id: string): Promise<QuestionSet | undefined> {
    return this.questionSets.get(id);
  }

  async createQuestionSet(qs: InsertQuestionSet): Promise<QuestionSet> {
    const id = randomUUID();
    const newQs: QuestionSet = { id, ...qs };
    this.questionSets.set(id, newQs);
    return newQs;
  }

  // Questions
  async getQuestions(): Promise<Question[]> {
    return Array.from(this.questions.values());
  }

  async getQuestionsBySet(questionSetId: string): Promise<Question[]> {
    return Array.from(this.questions.values()).filter(
      (q) => q.questionSetId === questionSetId
    );
  }

  async getQuestion(id: string): Promise<Question | undefined> {
    return this.questions.get(id);
  }

  async createQuestion(question: InsertQuestion): Promise<Question> {
    const id = randomUUID();
    const newQuestion: Question = { id, ...question };
    this.questions.set(id, newQuestion);
    return newQuestion;
  }

  // Audit Runs
  async getAuditRuns(): Promise<AuditRun[]> {
    return Array.from(this.auditRuns.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getAuditRun(id: string): Promise<AuditRun | undefined> {
    return this.auditRuns.get(id);
  }

  async createAuditRun(run: InsertAuditRun): Promise<AuditRun> {
    const id = randomUUID();
    const newRun: AuditRun = {
      id,
      questionSetId: run.questionSetId,
      provider: run.provider || "mock",
      status: "pending",
      createdAt: new Date().toISOString(),
      baselineRunId: run.baselineRunId || null,
    };
    this.auditRuns.set(id, newRun);
    return newRun;
  }

  async updateAuditRun(id: string, updates: Partial<AuditRun>): Promise<AuditRun | undefined> {
    const run = this.auditRuns.get(id);
    if (!run) return undefined;
    const updated = { ...run, ...updates };
    this.auditRuns.set(id, updated);
    return updated;
  }

  // Answers
  async getAnswersByRun(auditRunId: string): Promise<Answer[]> {
    return Array.from(this.answers.values()).filter(
      (a) => a.auditRunId === auditRunId
    );
  }

  async createAnswer(answer: InsertAnswer): Promise<Answer> {
    const id = randomUUID();
    const newAnswer: Answer = { id, ...answer };
    this.answers.set(id, newAnswer);
    return newAnswer;
  }

  // Findings
  async getFindings(): Promise<Finding[]> {
    return Array.from(this.findings.values()).sort((a, b) => b.severity - a.severity);
  }

  async getFindingsByRun(auditRunId: string): Promise<Finding[]> {
    return Array.from(this.findings.values())
      .filter((f) => f.auditRunId === auditRunId)
      .sort((a, b) => b.severity - a.severity);
  }

  async createFinding(finding: InsertFinding): Promise<Finding> {
    const id = randomUUID();
    const newFinding: Finding = { id, ...finding };
    this.findings.set(id, newFinding);
    return newFinding;
  }

  // Dashboard
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const allFindings = await this.getFindings();
    const allRuns = await this.getAuditRuns();

    const findingsByType: Record<FindingType, number> = {
      incorrect: 0,
      outdated: 0,
      ungrounded: 0,
      drift: 0,
    };

    const findingsBySeverity = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };

    const findingsByLang: Record<Language, number> = {
      fr: 0,
      nl: 0,
    };

    allFindings.forEach((f) => {
      findingsByType[f.type]++;
      findingsByLang[f.lang]++;
      if (f.severity >= 8) findingsBySeverity.critical++;
      else if (f.severity >= 6) findingsBySeverity.high++;
      else if (f.severity >= 4) findingsBySeverity.medium++;
      else findingsBySeverity.low++;
    });

    const topSeverityFindings = allFindings.slice(0, 5);
    const lastRun = allRuns[0];

    return {
      totalFindings: allFindings.length,
      findingsByType,
      findingsBySeverity,
      findingsByLang,
      topSeverityFindings,
      lastRunDate: lastRun?.createdAt || null,
      totalAuditRuns: allRuns.length,
    };
  }

  // Comparison
  async getComparison(baselineId: string, currentId: string): Promise<Comparison | null> {
    const baselineRun = await this.getAuditRun(baselineId);
    const currentRun = await this.getAuditRun(currentId);

    if (!baselineRun || !currentRun) return null;

    const baselineFindings = await this.getFindingsByRun(baselineId);
    const currentFindings = await this.getFindingsByRun(currentId);

    const baselineCounts: Record<FindingType, number> = {
      incorrect: 0,
      outdated: 0,
      ungrounded: 0,
      drift: 0,
    };

    const currentCounts: Record<FindingType, number> = {
      incorrect: 0,
      outdated: 0,
      ungrounded: 0,
      drift: 0,
    };

    baselineFindings.forEach((f) => baselineCounts[f.type]++);
    currentFindings.forEach((f) => currentCounts[f.type]++);

    // Simple heuristic: findings with same questionId and type are "the same"
    const baselineKeys = new Set(
      baselineFindings.map((f) => `${f.questionId}-${f.type}-${f.lang}`)
    );
    const currentKeys = new Set(
      currentFindings.map((f) => `${f.questionId}-${f.type}-${f.lang}`)
    );

    const resolvedFindings = baselineFindings.filter(
      (f) => !currentKeys.has(`${f.questionId}-${f.type}-${f.lang}`)
    );

    const newFindings = currentFindings.filter(
      (f) => !baselineKeys.has(`${f.questionId}-${f.type}-${f.lang}`)
    );

    const improvements = (["incorrect", "outdated", "ungrounded", "drift"] as FindingType[]).map(
      (type) => ({
        type,
        change: currentCounts[type] - baselineCounts[type],
      })
    );

    return {
      baselineRunId: baselineId,
      currentRunId: currentId,
      baselineDate: baselineRun.createdAt,
      currentDate: currentRun.createdAt,
      baselineCounts,
      currentCounts,
      improvements,
      newFindings,
      resolvedFindings,
    };
  }

  // Seed data
  async seedData(): Promise<void> {
    // Check if already seeded
    if (this.facts.size > 0 || this.questionSets.size > 0) {
      return;
    }

    // Seed facts
    const factsSeed = [
      {
        key: "city_hall_phone",
        lang: "fr" as Language,
        value: "+32 2 123 45 67",
        sourceRef: "/data/sources/city_hall.md",
        lastVerified: "2025-01-15",
        linkedFactId: null,
        topic: "contact",
      },
      {
        key: "city_hall_phone",
        lang: "nl" as Language,
        value: "+32 2 123 45 67",
        sourceRef: "/data/sources/city_hall.md",
        lastVerified: "2025-01-15",
        linkedFactId: null,
        topic: "contact",
      },
      {
        key: "city_hall_address",
        lang: "fr" as Language,
        value: "Grand-Place 1, 1000 Bruxelles",
        sourceRef: "/data/sources/city_hall.md",
        lastVerified: "2025-01-15",
        linkedFactId: null,
        topic: "location",
      },
      {
        key: "city_hall_address",
        lang: "nl" as Language,
        value: "Grote Markt 1, 1000 Brussel",
        sourceRef: "/data/sources/city_hall.md",
        lastVerified: "2025-01-15",
        linkedFactId: null,
        topic: "location",
      },
      {
        key: "city_hall_hours",
        lang: "fr" as Language,
        value: "Lundi-Vendredi: 08:30-16:30",
        sourceRef: "/data/sources/city_hall.md",
        lastVerified: "2025-01-15",
        linkedFactId: null,
        topic: "hours",
      },
      {
        key: "city_hall_hours",
        lang: "nl" as Language,
        value: "Maandag-Vrijdag: 08:30-16:30",
        sourceRef: "/data/sources/city_hall.md",
        lastVerified: "2025-01-15",
        linkedFactId: null,
        topic: "hours",
      },
      {
        key: "id_card_deadline",
        lang: "fr" as Language,
        value: "30 jours avant expiration",
        sourceRef: "/data/sources/id_card.md",
        lastVerified: "2025-01-10",
        linkedFactId: null,
        topic: "deadline",
      },
      {
        key: "id_card_deadline",
        lang: "nl" as Language,
        value: "30 dagen voor vervaldatum",
        sourceRef: "/data/sources/id_card.md",
        lastVerified: "2025-01-10",
        linkedFactId: null,
        topic: "deadline",
      },
      {
        key: "id_card_fee",
        lang: "fr" as Language,
        value: "25,00 EUR",
        sourceRef: "/data/sources/id_card.md",
        lastVerified: "2025-01-10",
        linkedFactId: null,
        topic: "fees",
      },
      {
        key: "id_card_fee",
        lang: "nl" as Language,
        value: "25,00 EUR",
        sourceRef: "/data/sources/id_card.md",
        lastVerified: "2025-01-10",
        linkedFactId: null,
        topic: "fees",
      },
      {
        key: "passport_docs",
        lang: "fr" as Language,
        value: "Photo d'identite, ancienne carte d'identite, justificatif de domicile",
        sourceRef: "/data/sources/passport.md",
        lastVerified: "2025-01-08",
        linkedFactId: null,
        topic: "docs",
      },
      {
        key: "passport_docs",
        lang: "nl" as Language,
        value: "Pasfoto, oude identiteitskaart, bewijs van woonplaats",
        sourceRef: "/data/sources/passport.md",
        lastVerified: "2025-01-08",
        linkedFactId: null,
        topic: "docs",
      },
      {
        key: "online_appointment_url",
        lang: "fr" as Language,
        value: "https://rendezvous.demoville.be/fr",
        sourceRef: "/data/sources/appointments.md",
        lastVerified: "2025-01-12",
        linkedFactId: null,
        topic: "contact",
      },
      {
        key: "online_appointment_url",
        lang: "nl" as Language,
        value: "https://afspraken.demoville.be/nl",
        sourceRef: "/data/sources/appointments.md",
        lastVerified: "2025-01-12",
        linkedFactId: null,
        topic: "contact",
      },
    ];

    // Create facts and link FR/NL pairs
    const createdFacts: Fact[] = [];
    for (const factData of factsSeed) {
      const fact = await this.createFact(factData);
      createdFacts.push(fact);
    }

    // Link FR/NL pairs
    for (let i = 0; i < createdFacts.length; i += 2) {
      if (i + 1 < createdFacts.length) {
        const fr = createdFacts[i];
        const nl = createdFacts[i + 1];
        await this.updateFact(fr.id, { linkedFactId: nl.id });
        await this.updateFact(nl.id, { linkedFactId: fr.id });
      }
    }

    // Seed question set
    const questionSet = await this.createQuestionSet({
      title: "Demoville Civic Services v2",
      languages: ["fr", "nl"],
      topics: ["contact", "hours", "deadline", "fees", "docs", "location"],
      version: "2.0",
    });

    // Seed questions
    const questionsSeed = [
      {
        lang: "fr" as Language,
        topic: "contact",
        riskTag: "contact" as const,
        text: "Quel est le numero de telephone de la mairie de Demoville?",
        expectedFactKeys: ["city_hall_phone"],
      },
      {
        lang: "nl" as Language,
        topic: "contact",
        riskTag: "contact" as const,
        text: "Wat is het telefoonnummer van het gemeentehuis van Demoville?",
        expectedFactKeys: ["city_hall_phone"],
      },
      {
        lang: "fr" as Language,
        topic: "location",
        riskTag: "location" as const,
        text: "Ou se trouve la mairie de Demoville?",
        expectedFactKeys: ["city_hall_address"],
      },
      {
        lang: "nl" as Language,
        topic: "location",
        riskTag: "location" as const,
        text: "Waar bevindt zich het gemeentehuis van Demoville?",
        expectedFactKeys: ["city_hall_address"],
      },
      {
        lang: "fr" as Language,
        topic: "hours",
        riskTag: "hours" as const,
        text: "Quels sont les horaires d'ouverture de la mairie?",
        expectedFactKeys: ["city_hall_hours"],
      },
      {
        lang: "nl" as Language,
        topic: "hours",
        riskTag: "hours" as const,
        text: "Wat zijn de openingsuren van het gemeentehuis?",
        expectedFactKeys: ["city_hall_hours"],
      },
      {
        lang: "fr" as Language,
        topic: "deadline",
        riskTag: "deadline" as const,
        text: "Quand dois-je renouveler ma carte d'identite?",
        expectedFactKeys: ["id_card_deadline"],
      },
      {
        lang: "nl" as Language,
        topic: "deadline",
        riskTag: "deadline" as const,
        text: "Wanneer moet ik mijn identiteitskaart vernieuwen?",
        expectedFactKeys: ["id_card_deadline"],
      },
      {
        lang: "fr" as Language,
        topic: "fees",
        riskTag: "fees" as const,
        text: "Combien coute une nouvelle carte d'identite?",
        expectedFactKeys: ["id_card_fee"],
      },
      {
        lang: "nl" as Language,
        topic: "fees",
        riskTag: "fees" as const,
        text: "Hoeveel kost een nieuwe identiteitskaart?",
        expectedFactKeys: ["id_card_fee"],
      },
      {
        lang: "fr" as Language,
        topic: "docs",
        riskTag: "docs" as const,
        text: "Quels documents sont necessaires pour un passeport?",
        expectedFactKeys: ["passport_docs"],
      },
      {
        lang: "nl" as Language,
        topic: "docs",
        riskTag: "docs" as const,
        text: "Welke documenten zijn nodig voor een paspoort?",
        expectedFactKeys: ["passport_docs"],
      },
      {
        lang: "fr" as Language,
        topic: "contact",
        riskTag: "contact" as const,
        text: "Comment prendre rendez-vous en ligne?",
        expectedFactKeys: ["online_appointment_url"],
      },
      {
        lang: "nl" as Language,
        topic: "contact",
        riskTag: "contact" as const,
        text: "Hoe maak ik een online afspraak?",
        expectedFactKeys: ["online_appointment_url"],
      },
    ];

    for (const q of questionsSeed) {
      await this.createQuestion({
        questionSetId: questionSet.id,
        ...q,
      });
    }
  }
}

export const storage = new MemStorage();
