import { NextResponse } from "next/server";
import { isTestnetStakeAddress } from "@/lib/addresses";
import { jsonError, readJson } from "@/lib/http";
import { loginMessage } from "@/lib/messages";
import { consumeNonce } from "@/lib/nonces";
import { signatureMatches } from "@/lib/signature";
import {
  SESSION_COOKIE,
  createSessionToken,
  isSameOrigin,
  sessionCookieOptions,
} from "@/lib/session";
import { ensureParticipant } from "@/lib/store";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return jsonError("This request was refused.", 403);

  const body = await readJson(request);
  if (!body || typeof body !== "object") {
    return jsonError("The sign-in could not be read.", 400);
  }

  const { stakeAddress, nonce, signature, key } = body as Record<string, unknown>;
  if (
    typeof stakeAddress !== "string" ||
    typeof nonce !== "string" ||
    typeof signature !== "string" ||
    typeof key !== "string" ||
    !isTestnetStakeAddress(stakeAddress)
  ) {
    return jsonError("Use a staked preprod wallet to sign in.", 400);
  }

  const message = loginMessage(stakeAddress, nonce);
  if (!signatureMatches(signature, key, message, stakeAddress)) {
    return jsonError("The wallet signature did not match this sign-in.", 401);
  }

  if (!consumeNonce(nonce, "login")) {
    return jsonError("This sign-in expired. Request a new message and sign again.", 401);
  }

  ensureParticipant(stakeAddress);
  const token = await createSessionToken(stakeAddress);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
  return response;
}
