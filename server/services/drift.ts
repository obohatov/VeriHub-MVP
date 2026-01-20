import type { Question, Answer, InsertFinding, RiskTag } from "@shared/schema";
import { storage } from "../storage";

// Risk weights by tag
const riskWeights: Record<RiskTag, number> = {
  deadline: 1.5,
  eligibility: 1.4,
  fees: 1.3,
  contact: 1.2,
  location: 1.1,
  docs: 1.2,
  hours: 1.0,
  general: 0.8,
};

// Fields to check for drift
const driftFields = [
  "appointment_link",
  "phone",
  "address",
  "deadline_days",
  "hours",
  "url",
  "email",
];

interface DriftResult {
  findings: InsertFinding[];
}

export async function detectDrift(
  auditRunId: string,
  answers: Answer[]
): Promise<DriftResult> {
  const findings: InsertFinding[] = [];
  const questions = await storage.getQuestions();

  // Group answers by expected fact key
  const answersByFactKey = new Map<string, { fr?: Answer; nl?: Answer; question?: Question }>();

  for (const answer of answers) {
    const question = questions.find((q) => q.id === answer.questionId);
    if (!question) continue;

    const factKey = question.expectedFactKeys[0];
    if (!factKey) continue;

    const existing = answersByFactKey.get(factKey) || {};
    existing[question.lang] = answer;
    existing.question = question;
    answersByFactKey.set(factKey, existing);
  }

  // Check each fact key for drift
  for (const [factKey, data] of answersByFactKey) {
    if (!data.fr || !data.nl || !data.question) continue;

    const driftIssue = checkForDrift(
      data.fr.answerText,
      data.nl.answerText,
      data.question.topic
    );

    if (driftIssue) {
      const baseSeverity = 7;
      const severity = Math.min(
        10,
        Math.round(baseSeverity * riskWeights[data.question.riskTag])
      );

      findings.push({
        auditRunId,
        questionId: data.question.id,
        lang: data.question.lang,
        type: "drift",
        severity,
        evidenceJson: {
          topic: data.question.topic,
          factKey,
          frValue: driftIssue.frValue,
          nlValue: driftIssue.nlValue,
          field: driftIssue.field,
        },
        suggestedFix: `Align FR and NL values for ${driftIssue.field}: FR="${driftIssue.frValue}" vs NL="${driftIssue.nlValue}"`,
      });
    }
  }

  return { findings };
}

interface DriftIssue {
  field: string;
  frValue: string;
  nlValue: string;
}

function checkForDrift(
  frAnswer: string,
  nlAnswer: string,
  topic: string
): DriftIssue | null {
  // Extract key values from answers
  const frValues = extractKeyValues(frAnswer);
  const nlValues = extractKeyValues(nlAnswer);

  // Check specific fields based on topic
  switch (topic) {
    case "contact":
      // Check phone numbers
      if (frValues.phone && nlValues.phone && frValues.phone !== nlValues.phone) {
        return { field: "phone", frValue: frValues.phone, nlValue: nlValues.phone };
      }
      // Check URLs
      if (frValues.url && nlValues.url) {
        // URLs should have same base but different lang path is ok
        const frBase = frValues.url.replace(/\/(fr|nl)\/?$/, "");
        const nlBase = nlValues.url.replace(/\/(fr|nl)\/?$/, "");
        if (frBase !== nlBase) {
          return { field: "url", frValue: frValues.url, nlValue: nlValues.url };
        }
      }
      break;

    case "hours":
      // Check opening hours - times should be identical
      if (frValues.times && nlValues.times && frValues.times !== nlValues.times) {
        return { field: "hours", frValue: frValues.times, nlValue: nlValues.times };
      }
      break;

    case "deadline":
      // Check deadline days - numbers should match
      if (frValues.number && nlValues.number && frValues.number !== nlValues.number) {
        return { field: "deadline_days", frValue: frValues.number, nlValue: nlValues.number };
      }
      break;

    case "fees":
      // Check amounts
      if (frValues.amount && nlValues.amount && frValues.amount !== nlValues.amount) {
        return { field: "amount", frValue: frValues.amount, nlValue: nlValues.amount };
      }
      break;

    case "location":
      // For addresses, postal code and street number should match
      if (frValues.postalCode && nlValues.postalCode && frValues.postalCode !== nlValues.postalCode) {
        return { field: "address", frValue: frValues.postalCode, nlValue: nlValues.postalCode };
      }
      break;
  }

  return null;
}

interface ExtractedValues {
  phone?: string;
  url?: string;
  times?: string;
  number?: string;
  amount?: string;
  postalCode?: string;
}

function extractKeyValues(text: string): ExtractedValues {
  const values: ExtractedValues = {};

  // Phone numbers
  const phoneMatch = text.match(/\+\d{1,3}[\s-]?\d[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}/);
  if (phoneMatch) values.phone = phoneMatch[0].replace(/\s/g, "");

  // URLs
  const urlMatch = text.match(/https?:\/\/[^\s\]]+/);
  if (urlMatch) values.url = urlMatch[0];

  // Time ranges (e.g., 08:30-16:30)
  const timeMatch = text.match(/\d{1,2}:\d{2}[\s-]*(?:a|tot|-)[\s-]*\d{1,2}:\d{2}/i);
  if (timeMatch) values.times = timeMatch[0].replace(/\s/g, "");

  // Numbers (for deadlines)
  const numberMatch = text.match(/(\d+)\s*(?:jours|dagen|days)/i);
  if (numberMatch) values.number = numberMatch[1];

  // Amounts
  const amountMatch = text.match(/(\d+[,.]?\d*)\s*EUR/i);
  if (amountMatch) values.amount = amountMatch[1];

  // Postal codes
  const postalMatch = text.match(/\b(\d{4})\b/);
  if (postalMatch) values.postalCode = postalMatch[1];

  return values;
}
