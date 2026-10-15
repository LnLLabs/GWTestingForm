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

export type FeedbackInput = {
  stars: number;
  comment: string;
  changes: string;
  mainnetUse: string;
};

export function parseFeedbackInput(body: unknown): FeedbackInput | null {
  if (!body || typeof body !== "object") return null;
  const record = body as Record<string, unknown>;
  const stars = record.stars;
  if (typeof stars !== "number" || !Number.isInteger(stars) || stars < 1 || stars > 5) {
    return null;
  }
  if (record.comment !== undefined && typeof record.comment !== "string") return null;
  if (record.changes !== undefined && typeof record.changes !== "string") return null;
  if (record.mainnetUse !== undefined && typeof record.mainnetUse !== "string") return null;
  const comment = clean(record.comment ?? "", LIMITS.comment);
  const changes = clean(record.changes ?? "", LIMITS.comment);
  const mainnetUse = clean(record.mainnetUse ?? "", LIMITS.comment);
  if (comment === null || changes === null || mainnetUse === null) return null;
  return { stars, comment, changes, mainnetUse };
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
