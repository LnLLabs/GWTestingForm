import "server-only";

import { and, count, desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import type { BugStatus, Severity } from "@/lib/domain";
import { bugs, feedback, participants } from "@/lib/schema";

export function ensureParticipant(stakeAddress: string) {
  const now = Date.now();
  getDb()
    .insert(participants)
    .values({
      stakeAddress,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoNothing()
    .run();
}

export function getParticipant(stakeAddress: string) {
  return (
    getDb()
      .select()
      .from(participants)
      .where(eq(participants.stakeAddress, stakeAddress))
      .get() ?? null
  );
}

export function saveRewardAddress(input: {
  stakeAddress: string;
  mainnetAddress: string;
  message: string;
  signature: string;
  key: string;
}) {
  ensureParticipant(input.stakeAddress);
  getDb()
    .update(participants)
    .set({
      mainnetAddress: input.mainnetAddress,
      rewardMessage: input.message,
      rewardSignature: input.signature,
      rewardKey: input.key,
      updatedAt: Date.now(),
    })
    .where(eq(participants.stakeAddress, input.stakeAddress))
    .run();
}

export function latestFeedback(stakeAddress: string) {
  return (
    getDb()
      .select()
      .from(feedback)
      .where(eq(feedback.stakeAddress, stakeAddress))
      .orderBy(desc(feedback.createdAt))
      .limit(1)
      .get() ?? null
  );
}

export function addFeedback(
  stakeAddress: string,
  input: { stars: number; comment: string; changes: string; mainnetUse: string },
) {
  getDb()
    .insert(feedback)
    .values({
      stakeAddress,
      stars: input.stars,
      comment: input.comment,
      changes: input.changes,
      mainnetUse: input.mainnetUse,
      createdAt: Date.now(),
    })
    .run();
}

export function listOwnBugs(stakeAddress: string) {
  return getDb()
    .select()
    .from(bugs)
    .where(eq(bugs.stakeAddress, stakeAddress))
    .orderBy(desc(bugs.createdAt))
    .all();
}

export function addBug(
  stakeAddress: string,
  input: {
    title: string;
    steps: string;
    expected: string;
    actual: string;
    suggestedSeverity: Severity;
  },
) {
  const now = Date.now();
  const inserted = getDb()
    .insert(bugs)
    .values({
      stakeAddress,
      title: input.title,
      steps: input.steps,
      expected: input.expected,
      actual: input.actual,
      suggestedSeverity: input.suggestedSeverity,
      status: "submitted",
      createdAt: now,
      updatedAt: now,
    })
    .returning({ id: bugs.id })
    .get();
  return inserted?.id ?? null;
}

export function updateOwnBug(
  stakeAddress: string,
  id: number,
  input: {
    title: string;
    steps: string;
    expected: string;
    actual: string;
    suggestedSeverity: Severity;
  },
): "ok" | "missing" | "locked" {
  const existing = getDb().select().from(bugs).where(eq(bugs.id, id)).get();
  if (!existing || existing.stakeAddress !== stakeAddress) return "missing";
  if (existing.status !== "submitted") return "locked";

  getDb()
    .update(bugs)
    .set({
      title: input.title,
      steps: input.steps,
      expected: input.expected,
      actual: input.actual,
      suggestedSeverity: input.suggestedSeverity,
      updatedAt: Date.now(),
    })
    .where(and(eq(bugs.id, id), eq(bugs.stakeAddress, stakeAddress)))
    .run();
  return "ok";
}

export function listParticipantsForReview() {
  const db = getDb();
  const rows = db.select().from(participants).orderBy(desc(participants.createdAt)).all();
  return rows.map((participant) => {
    const latest =
      db
        .select()
        .from(feedback)
        .where(eq(feedback.stakeAddress, participant.stakeAddress))
        .orderBy(desc(feedback.createdAt))
        .limit(1)
        .get() ?? null;
    const bugCount =
      db
        .select({ value: count() })
        .from(bugs)
        .where(eq(bugs.stakeAddress, participant.stakeAddress))
        .get()?.value ?? 0;
    return { participant, latest, bugCount };
  });
}

export function listBugsForReview() {
  return getDb().select().from(bugs).orderBy(desc(bugs.createdAt)).all();
}

export function reviewBug(
  id: number,
  reviewer: string,
  input: { status: BugStatus; officialSeverity: Severity | null },
): boolean {
  const existing = getDb().select().from(bugs).where(eq(bugs.id, id)).get();
  if (!existing) return false;
  getDb()
    .update(bugs)
    .set({
      status: input.status,
      officialSeverity: input.officialSeverity,
      reviewerStakeAddress: reviewer,
      updatedAt: Date.now(),
    })
    .where(eq(bugs.id, id))
    .run();
  return true;
}
