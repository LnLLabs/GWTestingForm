import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";

const databasePath = path.join(os.tmpdir(), `gw-contact-${process.pid}.db`);

process.env.SESSION_SECRET = "test-secret-test-secret-test-secret-xx";
process.env.DATABASE_PATH = databasePath;
process.env.APP_URL = "http://localhost:3000";
process.env.ADMIN_STAKE_ADDRESSES = "";

const { closeDb } = await import("@/lib/db");
const { ensureParticipant, getParticipant, updateParticipantContact } = await import("@/lib/store");

afterAll(() => {
  closeDb();
  for (const suffix of ["", "-shm", "-wal"]) {
    fs.rmSync(`${databasePath}${suffix}`, { force: true });
  }
});

describe("participant contact", () => {
  it("stores email and the two consents on the participant", () => {
    const stakeAddress = "stake_test1contact";
    ensureParticipant(stakeAddress);
    updateParticipantContact(stakeAddress, {
      email: "ada@example.com",
      consentTestContact: true,
      consentProductUpdates: false,
      consentVersion: "2026-10-19",
    });

    const participant = getParticipant(stakeAddress);
    expect(participant?.email).toBe("ada@example.com");
    expect(participant?.consentTestContact).toBe(true);
    expect(participant?.consentProductUpdates).toBe(false);
    expect(participant?.consentVersion).toBe("2026-10-19");
    expect(participant?.consentAt).toEqual(expect.any(Number));
    expect(participant?.emailUpdatedAt).toEqual(expect.any(Number));
  });
});
