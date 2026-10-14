import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { eq } from "drizzle-orm";
import { afterAll, describe, expect, it } from "vitest";

const databasePath = path.join(os.tmpdir(), `gw-nonces-${process.pid}.db`);
process.env.SESSION_SECRET = "test-secret-test-secret-test-secret-xx";
process.env.DATABASE_PATH = databasePath;
process.env.APP_URL = "http://localhost:3000";

const { getDb, closeDb } = await import("@/lib/db");
const { nonces } = await import("@/lib/schema");
const { consumeNonce, issueNonce } = await import("@/lib/nonces");

afterAll(() => {
  closeDb();
  for (const suffix of ["", "-shm", "-wal"]) {
    fs.rmSync(`${databasePath}${suffix}`, { force: true });
  }
});

describe("nonces", () => {
  it("accepts a nonce once", () => {
    const nonce = issueNonce("login");
    expect(consumeNonce(nonce, "login")).toBe(true);
    expect(consumeNonce(nonce, "login")).toBe(false);
  });

  it("rejects an expired nonce", () => {
    const nonce = issueNonce("login");
    getDb()
      .update(nonces)
      .set({ expiresAt: Date.now() - 1000 })
      .where(eq(nonces.nonce, nonce))
      .run();
    expect(consumeNonce(nonce, "login")).toBe(false);
  });

  it("rejects a nonce used for a different purpose", () => {
    const nonce = issueNonce("reward");
    expect(consumeNonce(nonce, "login")).toBe(false);
    expect(consumeNonce(nonce, "reward")).toBe(true);
  });
});
