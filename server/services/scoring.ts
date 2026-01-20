import type { Question, Fact, Finding, FindingType, RiskTag, InsertFinding } from "@shared/schema";
import type { LLMResponse } from "./mockLlm";

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

interface ScoringResult {
  findings: InsertFinding[];
}

export function scoreAnswer(
  question: Question,
  response: LLMResponse,
  facts: Fact[],
  auditRunId: string
): ScoringResult {
  const findings: InsertFinding[] = [];

  // Get expected facts for this question
  const expectedFacts = facts.filter(
    (f) => question.expectedFactKeys.includes(f.key) && f.lang === question.lang
  );

  // Check for ungrounded - no citations and no match to expected facts
  if (response.citations.length === 0) {
    const hasFactMatch = expectedFacts.some((fact) =>
      response.answerText.toLowerCase().includes(fact.value.toLowerCase().slice(0, 20))
    );

    if (!hasFactMatch) {
      const baseSeverity = 6;
      const severity = Math.min(10, Math.round(baseSeverity * riskWeights[question.riskTag]));

      findings.push({
        auditRunId,
        questionId: question.id,
        lang: question.lang,
        type: "ungrounded",
        severity,
        evidenceJson: {
          topic: question.topic,
          reason: "No citations provided and answer does not match verified facts",
          answerSnippet: response.answerText.slice(0, 100),
        },
        suggestedFix: "Add proper citations to sources or update answer to match verified facts",
      });
    }
  }

  // Check for incorrect - answer contradicts expected fact values
  for (const fact of expectedFacts) {
    const factValueNormalized = normalizeValue(fact.value);
    const answerNormalized = normalizeValue(response.answerText);

    // Check if the answer mentions a different value for key data points
    const incorrectMatch = detectIncorrectValue(fact, response.answerText);
    
    if (incorrectMatch) {
      const baseSeverity = 8;
      const severity = Math.min(10, Math.round(baseSeverity * riskWeights[question.riskTag]));

      findings.push({
        auditRunId,
        questionId: question.id,
        lang: question.lang,
        type: "incorrect",
        severity,
        evidenceJson: {
          topic: question.topic,
          expectedValue: fact.value,
          actualValue: incorrectMatch,
          factKey: fact.key,
        },
        suggestedFix: `Update the answer to use the correct value: ${fact.value}`,
      });
    }
  }

  // Check for outdated - fact verification date issues
  for (const fact of expectedFacts) {
    const verifiedDate = new Date(fact.lastVerified);
    const daysSinceVerification = Math.floor(
      (Date.now() - verifiedDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // If fact is old and answer doesn't match exactly
    if (daysSinceVerification > 30) {
      const factValueNormalized = normalizeValue(fact.value);
      if (!response.answerText.includes(factValueNormalized)) {
        // Check if it might be using outdated information
        const mightBeOutdated = detectOutdatedPattern(fact, response.answerText);
        
        if (mightBeOutdated) {
          const baseSeverity = 5;
          const severity = Math.min(10, Math.round(baseSeverity * riskWeights[question.riskTag]));

          findings.push({
            auditRunId,
            questionId: question.id,
            lang: question.lang,
            type: "outdated",
            severity,
            evidenceJson: {
              topic: question.topic,
              lastVerified: fact.lastVerified,
              daysSinceVerification,
              expectedValue: fact.value,
            },
            suggestedFix: `Verify and update the fact: ${fact.key}. Last verified: ${fact.lastVerified}`,
          });
        }
      }
    }
  }

  return { findings };
}

function normalizeValue(value: string): string {
  return value.toLowerCase().replace(/[^\w\s]/g, "").trim();
}

function detectIncorrectValue(fact: Fact, answerText: string): string | null {
  const answerLower = answerText.toLowerCase();
  const factValueLower = fact.value.toLowerCase();

  // For numeric values (fees, deadlines)
  if (fact.topic === "fees" || fact.topic === "deadline") {
    const factNumbers = factValueLower.match(/\d+/g);
    const answerNumbers = answerLower.match(/\d+/g);

    if (factNumbers && answerNumbers) {
      const factNum = factNumbers[0];
      const answerNum = answerNumbers.find((n) => n !== factNum);
      
      if (answerNum && factNum !== answerNum) {
        return `${answerNum} (expected: ${factNum})`;
      }
    }
  }

  // For hours - check time patterns
  if (fact.topic === "hours") {
    const timePattern = /(\d{1,2}:\d{2})/g;
    const factTimes = factValueLower.match(timePattern) || [];
    const answerTimes = answerLower.match(timePattern) || [];

    if (answerTimes.length > 0 && factTimes.length > 0) {
      const mismatch = answerTimes.find((t) => !factTimes.includes(t));
      if (mismatch) {
        return answerTimes.join("-");
      }
    }
  }

  return null;
}

function detectOutdatedPattern(fact: Fact, answerText: string): boolean {
  // Check if answer uses different values that might indicate outdated info
  if (fact.topic === "hours") {
    const factHasTime = fact.value.match(/\d{1,2}:\d{2}/);
    const answerHasTime = answerText.match(/\d{1,2}:\d{2}/);
    
    if (factHasTime && answerHasTime) {
      return factHasTime[0] !== answerHasTime[0];
    }
  }
  
  return false;
}
