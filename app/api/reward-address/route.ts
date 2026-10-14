import { NextResponse } from "next/server";
import { isMainnetPaymentAddress } from "@/lib/addresses";
import { jsonError, readJson, requireSession } from "@/lib/http";
import { rewardMessage } from "@/lib/messages";
import { consumeNonce } from "@/lib/nonces";
import { signatureMatches } from "@/lib/signature";
import { saveRewardAddress } from "@/lib/store";

export async function POST(request: Request) {
  const access = await requireSession(request);
  if ("response" in access) return access.response;

  const body = await readJson(request);
  if (!body || typeof body !== "object") {
    return jsonError("The reward address could not be read.", 400);
  }

  const { mainnetAddress, nonce, signature, key } = body as Record<string, unknown>;
  if (
    typeof mainnetAddress !== "string" ||
    typeof nonce !== "string" ||
    typeof signature !== "string" ||
    typeof key !== "string" ||
    !isMainnetPaymentAddress(mainnetAddress)
  ) {
    return jsonError("Enter a mainnet address that starts with addr1.", 400);
  }

  const message = rewardMessage(access.stakeAddress, mainnetAddress.trim(), nonce);
  if (!signatureMatches(signature, key, message, access.stakeAddress)) {
    return jsonError("The wallet signature did not match this reward address.", 401);
  }

  if (!consumeNonce(nonce, "reward")) {
    return jsonError("This confirmation expired. Review the message and sign again.", 401);
  }

  saveRewardAddress({
    stakeAddress: access.stakeAddress,
    mainnetAddress: mainnetAddress.trim(),
    message,
    signature,
    key,
  });

  return NextResponse.json({ ok: true });
}
