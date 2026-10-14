import { NextResponse } from "next/server";
import { isSameOrigin, sessionFromRequest } from "@/lib/session";
import { issueNonce } from "@/lib/nonces";
import { jsonError, readJson } from "@/lib/http";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return jsonError("This request was refused.", 403);

  const body = await readJson(request);
  const purpose =
    body && typeof body === "object" && "purpose" in body
      ? (body as { purpose?: unknown }).purpose
      : undefined;

  if (purpose !== "login" && purpose !== "reward") {
    return jsonError("Choose a sign-in or reward-address nonce.", 400);
  }

  if (purpose === "reward") {
    const stakeAddress = await sessionFromRequest(request);
    if (!stakeAddress) return jsonError("Sign in again to continue.", 401);
  }

  return NextResponse.json({ nonce: issueNonce(purpose) });
}
