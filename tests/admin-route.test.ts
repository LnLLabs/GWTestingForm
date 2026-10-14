import { bech32 } from "bech32";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";

function stakeAddress(seed: number) {
  const bytes = [
    (14 << 4) | 0,
    ...Array.from({ length: 28 }, (_, index) => (index + seed) & 0xff),
  ];
  return bech32.encode("stake_test", bech32.toWords(bytes), 1000);
}

const adminStake = stakeAddress(1);
const memberStake = stakeAddress(9);
const databasePath = path.join(os.tmpdir(), `gw-admin-${process.pid}.db`);

process.env.SESSION_SECRET = "test-secret-test-secret-test-secret-xx";
process.env.DATABASE_PATH = databasePath;
process.env.APP_URL = "http://localhost:3000";
process.env.ADMIN_STAKE_ADDRESSES = adminStake;

const { closeDb } = await import("@/lib/db");
const { SESSION_COOKIE, createSessionToken } = await import("@/lib/session");
const { PATCH } = await import("@/app/api/admin/bugs/[id]/route");

afterAll(() => {
  closeDb();
  for (const suffix of ["", "-shm", "-wal"]) {
    fs.rmSync(`${databasePath}${suffix}`, { force: true });
  }
});

async function review(stakeAddress: string) {
  const token = await createSessionToken(stakeAddress);
  return PATCH(
    new Request("http://localhost:3000/api/admin/bugs/1", {
      method: "PATCH",
      headers: {
        host: "localhost:3000",
        cookie: `${SESSION_COOKIE}=${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({}),
    }),
    { params: Promise.resolve({ id: "1" }) },
  );
}

describe("review route", () => {
  it("rejects a signed-in wallet that is not on the allowlist", async () => {
    const response = await review(memberStake);
    expect(response.status).toBe(404);
  });

  it("lets an allowlisted wallet past the gate", async () => {
    const response = await review(adminStake);
    expect(response.status).toBe(400);
  });
});
