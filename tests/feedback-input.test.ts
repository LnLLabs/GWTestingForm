import { describe, expect, it } from "vitest";
import { parseFeedbackInput } from "@/lib/domain";

const rating = {
  stars: 4,
  comment: "Clear",
  changes: "Faster sync",
  mainnetUse: "Yes",
};

describe("parseFeedbackInput", () => {
  it("saves a rating with no email and no consent", () => {
    const parsed = parseFeedbackInput(rating);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.value.email).toBe("");
    expect(parsed.value.consentTestContact).toBe(false);
    expect(parsed.value.consentProductUpdates).toBe(false);
  });

  it("rejects an email with no purpose", () => {
    const parsed = parseFeedbackInput({ ...rating, email: "ada@example.com" });
    expect(parsed).toEqual({
      ok: false,
      error: "Choose at least one reason we may email you.",
    });
  });

  it("rejects a purpose with no email", () => {
    const parsed = parseFeedbackInput({ ...rating, consentProductUpdates: true });
    expect(parsed).toEqual({
      ok: false,
      error: "Enter an email address for the contact option you selected.",
    });
  });

  it("accepts one purpose and stores a normalized email", () => {
    const parsed = parseFeedbackInput({
      ...rating,
      email: " Ada@Example.com ",
      consentTestContact: true,
      consentProductUpdates: false,
    });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.value.email).toBe("ada@example.com");
    expect(parsed.value.consentTestContact).toBe(true);
    expect(parsed.value.consentProductUpdates).toBe(false);
  });
});
