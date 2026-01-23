import { describe, it, expect, beforeEach } from "vitest";
import { scoreIncorrect, scoreOutdated, scoreUngrounded } from "../../services/scoring";

describe("Scoring Functions", () => {
  describe("scoreIncorrect", () => {
    it("should return true when values are different", () => {
      expect(scoreIncorrect("8 days", "10 days")).toBe(true);
    });

    it("should return false when values match", () => {
      expect(scoreIncorrect("10 EUR", "10 EUR")).toBe(false);
    });

    it("should normalize values before comparison", () => {
      expect(scoreIncorrect("  hello  ", "hello")).toBe(false);
      expect(scoreIncorrect("HELLO", "hello")).toBe(false);
    });
  });

  describe("scoreOutdated", () => {
    it("should return true when fact is stale (over 180 days)", () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 200);
      expect(scoreOutdated(oldDate.toISOString())).toBe(true);
    });

    it("should return false when fact is recent", () => {
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 30);
      expect(scoreOutdated(recentDate.toISOString())).toBe(false);
    });

    it("should respect custom stale threshold", () => {
      const date = new Date();
      date.setDate(date.getDate() - 40);
      expect(scoreOutdated(date.toISOString(), 30)).toBe(true);
      expect(scoreOutdated(date.toISOString(), 60)).toBe(false);
    });
  });

  describe("scoreUngrounded", () => {
    it("should return true when no citations and no markers", () => {
      expect(scoreUngrounded("Some answer without citations", [])).toBe(true);
    });

    it("should return false when citations exist", () => {
      expect(scoreUngrounded("Answer text", ["/data/sources/test.md"])).toBe(false);
    });

    it("should return false when citation marker exists in text", () => {
      expect(scoreUngrounded("Answer with [SRC: test] marker", [])).toBe(false);
      expect(scoreUngrounded("Answer with Source: test", [])).toBe(false);
    });
  });
});
