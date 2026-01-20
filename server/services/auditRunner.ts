import { storage } from "../storage";
import { mockLlmProvider } from "./mockLlm";
import { scoreAnswer } from "./scoring";
import { detectDrift } from "./drift";
import type { AuditRun, Answer, InsertAnswer } from "@shared/schema";

export async function runAudit(auditRunId: string): Promise<void> {
  const auditRun = await storage.getAuditRun(auditRunId);
  if (!auditRun) {
    throw new Error(`Audit run not found: ${auditRunId}`);
  }

  // Update status to running
  await storage.updateAuditRun(auditRunId, { status: "running" });

  try {
    // Get questions for this question set
    const questions = await storage.getQuestionsBySet(auditRun.questionSetId);
    const facts = await storage.getFacts();

    const answers: Answer[] = [];

    // Process each question
    for (const question of questions) {
      // Get LLM response
      const response = await mockLlmProvider.getAnswer(question);

      // Store answer
      const answerData: InsertAnswer = {
        auditRunId,
        questionId: question.id,
        lang: question.lang,
        answerText: response.answerText,
        citations: response.citations,
      };

      const answer = await storage.createAnswer(answerData);
      answers.push(answer);

      // Score the answer and create findings
      const scoringResult = scoreAnswer(question, response, facts, auditRunId);
      
      for (const finding of scoringResult.findings) {
        await storage.createFinding(finding);
      }
    }

    // Detect drift between FR and NL answers
    const driftResult = await detectDrift(auditRunId, answers);
    
    for (const finding of driftResult.findings) {
      await storage.createFinding(finding);
    }

    // Update status to completed
    await storage.updateAuditRun(auditRunId, { status: "completed" });
  } catch (error) {
    console.error("Audit run failed:", error);
    await storage.updateAuditRun(auditRunId, { status: "failed" });
    throw error;
  }
}
