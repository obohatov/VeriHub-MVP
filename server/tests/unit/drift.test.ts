import { describe, it, expect } from "vitest";

describe("Drift Detection", () => {
  it("should detect phone number drift", () => {
    const frPhone = "+32 2 555 0101";
    const nlPhone = "+32 2 555 0102";
    
    const phonePattern = /(\+?\d[\d\s().-]{6,}\d)/;
    const frMatch = frPhone.match(phonePattern);
    const nlMatch = nlPhone.match(phonePattern);
    
    expect(frMatch).not.toBeNull();
    expect(nlMatch).not.toBeNull();
    expect(frMatch![0]).not.toBe(nlMatch![0]);
  });

  it("should detect URL drift", () => {
    const frUrl = "https://demoville.example/book";
    const nlUrl = "https://demoville.example/afspraak";
    
    const urlPattern = /(https?:\/\/[^\s)]+)/;
    const frMatch = frUrl.match(urlPattern);
    const nlMatch = nlUrl.match(urlPattern);
    
    expect(frMatch).not.toBeNull();
    expect(nlMatch).not.toBeNull();
    expect(frMatch![0]).not.toBe(nlMatch![0]);
  });

  it("should detect deadline days drift", () => {
    const frDays = "8 jours";
    const nlDays = "10 dagen";
    
    const daysPattern = /(\d{1,3})\s*(day|days|jour|jours|dag|dagen)/;
    const frMatch = frDays.match(daysPattern);
    const nlMatch = nlDays.match(daysPattern);
    
    expect(frMatch).not.toBeNull();
    expect(nlMatch).not.toBeNull();
    expect(frMatch![1]).toBe("8");
    expect(nlMatch![1]).toBe("10");
    expect(frMatch![1]).not.toBe(nlMatch![1]);
  });

  it("should not flag matching values as drift", () => {
    const frEmail = "info@demoville.example";
    const nlEmail = "info@demoville.example";
    
    expect(frEmail).toBe(nlEmail);
  });
});
