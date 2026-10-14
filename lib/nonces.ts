import "server-only";

import { and, eq, gt, isNull, lt, or } from "drizzle-orm";
import { randomBytes } from "node:crypto";
import { getDb } from "@/lib/db";
import { nonces } from "@/lib/schema";

const TEN_MINUTES = 10 * 60 * 1000;
const DAY = 24 * 60 * 60 * 1000;

export type NoncePurpose = "login" | "reward";

export function issueNonce(purpose: NoncePurpose): string {
  const db = getDb();
  const now = Date.now();
  db.delete(nonces)
    .where(
      or(
        lt(nonces.expiresAt, now),
        and(lt(nonces.usedAt, now - DAY)),
      ),
    )
    .run();

  const nonce = randomBytes(16).toString("hex");
  db.insert(nonces)
    .values({
      nonce,
      purpose,
      expiresAt: now + TEN_MINUTES,
      usedAt: null,
    })
    .run();
  return nonce;
}

export function consumeNonce(nonce: string, purpose: NoncePurpose): boolean {
  const now = Date.now();
  const result = getDb()
    .update(nonces)
    .set({ usedAt: now })
    .where(
      and(
        eq(nonces.nonce, nonce),
        eq(nonces.purpose, purpose),
        isNull(nonces.usedAt),
        gt(nonces.expiresAt, now),
      ),
    )
    .run();
  return result.changes === 1;
}
