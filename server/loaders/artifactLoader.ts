import { readFileSync, existsSync } from "fs";
import { parse as parseYaml } from "yaml";
import path from "path";

export interface FactSeed {
  id: string;
  key: string;
  lang: "fr" | "nl";
  value: string;
  source_ref: string;
  last_verified: string;
  linked_fact_id: string | null;
}

export interface QuestionSeed {
  id: string;
  lang: "fr" | "nl";
  topic: string;
  risk_tag: string;
  text: string;
  expected_fact_keys: string[];
}

export interface QuestionSetSeed {
  question_set_id: string;
  title: string;
  languages: ("fr" | "nl")[];
  topics: string[];
  questions: QuestionSeed[];
}

export interface MockAnswer {
  answer_text: string;
  citations: string[];
}

export interface ScoringRules {
  version: number;
  risk_weights: Record<string, number>;
  outdated: {
    stale_after_days: number;
  };
  ungrounded: {
    require_citation_marker: boolean;
    citation_markers: string[];
  };
  drift: {
    compare_keys: string[];
    patterns: Record<string, string>;
  };
}

const DATA_DIR = path.resolve(process.cwd(), "data");

export function loadFactsSeed(): FactSeed[] {
  const filePath = path.join(DATA_DIR, "facts", "facts_seed_v2.json");
  if (!existsSync(filePath)) {
    console.warn(`[loader] Facts seed not found: ${filePath}`);
    return [];
  }
  const content = readFileSync(filePath, "utf-8");
  return JSON.parse(content);
}

export function loadQuestionSetSeed(): QuestionSetSeed | null {
  const filePath = path.join(DATA_DIR, "question_sets", "question_set_demoville_fr_nl_v2.json");
  if (!existsSync(filePath)) {
    console.warn(`[loader] Question set not found: ${filePath}`);
    return null;
  }
  const content = readFileSync(filePath, "utf-8");
  return JSON.parse(content);
}

export function loadScoringRules(): ScoringRules {
  const filePath = path.join(DATA_DIR, "scoring_rules.yaml");
  if (!existsSync(filePath)) {
    console.warn(`[loader] Scoring rules not found: ${filePath}, using defaults`);
    return {
      version: 1,
      risk_weights: {
        deadline: 5,
        eligibility: 5,
        location: 4,
        contact: 4,
        documents: 4,
        fees: 3,
        hours: 3,
        general: 1,
      },
      outdated: { stale_after_days: 180 },
      ungrounded: {
        require_citation_marker: true,
        citation_markers: ["[SRC:", "Source:", "Sources:"],
      },
      drift: {
        compare_keys: ["appointment_link", "phone", "email", "address", "opening_hours", "deadline_days"],
        patterns: {
          phone: "(\\+?\\d[\\d\\s().-]{6,}\\d)",
          url: "(https?://[^\\s)]+)",
          email: "([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,})",
          days: "(\\d{1,3})\\s*(day|days|jour|jours|dag|dagen)",
        },
      },
    };
  }
  const content = readFileSync(filePath, "utf-8");
  return parseYaml(content);
}

export function loadMockAnswers(provider: "mock-baseline" | "mock-after"): Record<string, MockAnswer> {
  const fileName = provider === "mock-baseline" 
    ? "mock_llm_answers_baseline.json" 
    : "mock_llm_answers_after.json";
  const filePath = path.join(DATA_DIR, "mock", fileName);
  
  if (!existsSync(filePath)) {
    console.warn(`[loader] Mock answers not found: ${filePath}`);
    return {};
  }
  const content = readFileSync(filePath, "utf-8");
  return JSON.parse(content);
}

let cachedScoringRules: ScoringRules | null = null;

export function getScoringRules(): ScoringRules {
  if (!cachedScoringRules) {
    cachedScoringRules = loadScoringRules();
  }
  return cachedScoringRules;
}
