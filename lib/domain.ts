export const SEVERITIES = [
  "informational",
  "low",
  "medium",
  "high",
  "critical",
] as const;

export const STATUSES = [
  "submitted",
  "accepted",
  "duplicate",
  "rejected",
] as const;

export type Severity = (typeof SEVERITIES)[number];
export type BugStatus = (typeof STATUSES)[number];

export function isSeverity(value: string): value is Severity {
  return (SEVERITIES as readonly string[]).includes(value);
}

export function isBugStatus(value: string): value is BugStatus {
  return (STATUSES as readonly string[]).includes(value);
}

export function severityLabel(severity: Severity): string {
  if (severity === "informational") return "Informational";
  return severity.slice(0, 1).toUpperCase() + severity.slice(1);
}

export function statusLabel(status: BugStatus): string {
  return status.slice(0, 1).toUpperCase() + status.slice(1);
}

const LIMITS = {
  title: 160,
  text: 8000,
  comment: 4000,
} as const;

export type BugInput = {
  title: string;
  steps: string;
  expected: string;
  actual: string;
  suggestedSeverity: Severity;
};

export function parseBugInput(body: unknown): BugInput | null {
  if (!body || typeof body !== "object") return null;
  const record = body as Record<string, unknown>;
  const title = clean(record.title, LIMITS.title);
  const steps = clean(record.steps, LIMITS.text);
  const expected = clean(record.expected, LIMITS.text);
  const actual = clean(record.actual, LIMITS.text);
  const suggested = record.suggestedSeverity;
  if (!title || !steps || !expected || !actual) return null;
  if (typeof suggested !== "string" || !isSeverity(suggested)) return null;
  return { title, steps, expected, actual, suggestedSeverity: suggested };
}

const EMAIL_MAX = 254;

export type FeedbackInput = {
  stars: number;
  comment: string;
  changes: string;
  mainnetUse: string;
  email: string;
  consentTestContact: boolean;
  consentProductUpdates: boolean;
};

export type FeedbackParseResult =
  | { ok: true; value: FeedbackInput }
  | { ok: false; error: string };

export function isEmailAddress(value: string): boolean {
  if (value.length === 0 || value.length > EMAIL_MAX) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function feedbackContactError(input: {
  email: string;
  consentTestContact: boolean;
  consentProductUpdates: boolean;
}): string | null {
  const email = input.email.trim().toLowerCase();
  const wantsEmail = input.consentTestContact || input.consentProductUpdates;
  if (!email && !wantsEmail) return null;
  if (email && !isEmailAddress(email)) return "Enter a valid email address.";
  if (email && !wantsEmail) return "Choose at least one reason we may email you.";
  if (!email && wantsEmail) return "Enter an email address for the contact option you selected.";
  return null;
}

export function parseFeedbackInput(body: unknown): FeedbackParseResult {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Choose a rating from 1 to 5." };
  }
  const record = body as Record<string, unknown>;
  const stars = record.stars;
  if (typeof stars !== "number" || !Number.isInteger(stars) || stars < 1 || stars > 5) {
    return { ok: false, error: "Choose a rating from 1 to 5." };
  }
  if (record.comment !== undefined && typeof record.comment !== "string") {
    return { ok: false, error: "Choose a rating from 1 to 5." };
  }
  if (record.changes !== undefined && typeof record.changes !== "string") {
    return { ok: false, error: "Choose a rating from 1 to 5." };
  }
  if (record.mainnetUse !== undefined && typeof record.mainnetUse !== "string") {
    return { ok: false, error: "Choose a rating from 1 to 5." };
  }
  const comment = clean(record.comment ?? "", LIMITS.comment);
  const changes = clean(record.changes ?? "", LIMITS.comment);
  const mainnetUse = clean(record.mainnetUse ?? "", LIMITS.comment);
  if (comment === null || changes === null || mainnetUse === null) {
    return { ok: false, error: "Choose a rating from 1 to 5." };
  }

  if (record.email !== undefined && typeof record.email !== "string") {
    return { ok: false, error: "Enter a valid email address." };
  }
  const consentTestContact = readConsent(record.consentTestContact);
  const consentProductUpdates = readConsent(record.consentProductUpdates);
  if (consentTestContact === null || consentProductUpdates === null) {
    return { ok: false, error: "Choose how we may use your email." };
  }
  const email = typeof record.email === "string" ? record.email.trim().toLowerCase() : "";
  const contactError = feedbackContactError({
    email,
    consentTestContact,
    consentProductUpdates,
  });
  if (contactError) return { ok: false, error: contactError };

  return {
    ok: true,
    value: {
      stars,
      comment,
      changes,
      mainnetUse,
      email,
      consentTestContact,
      consentProductUpdates,
    },
  };
}

function readConsent(value: unknown): boolean | null {
  if (value === undefined) return false;
  if (typeof value === "boolean") return value;
  return null;
}

export function parseReviewInput(
  body: unknown,
): { status: BugStatus; officialSeverity: Severity | null } | null {
  if (!body || typeof body !== "object") return null;
  const record = body as Record<string, unknown>;
  if (typeof record.status !== "string" || !isBugStatus(record.status)) return null;
  const official = record.officialSeverity;
  if (official === null || official === "") {
    if (record.status === "accepted") return null;
    return { status: record.status, officialSeverity: null };
  }
  if (typeof official !== "string" || !isSeverity(official)) return null;
  return { status: record.status, officialSeverity: official };
}

function clean(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed.length > max) return null;
  return trimmed;
}
