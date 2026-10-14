import { NextResponse } from "next/server";
import { parseFeedbackInput } from "@/lib/domain";
import { jsonError, readJson, requireSession } from "@/lib/http";
import { addFeedback, getParticipant } from "@/lib/store";

export async function POST(request: Request) {
  const access = await requireSession(request);
  if ("response" in access) return access.response;

  const participant = getParticipant(access.stakeAddress);
  if (!participant?.mainnetAddress) {
    return jsonError("Sign your mainnet reward address before sending a rating.", 403);
  }

  const input = parseFeedbackInput(await readJson(request));
  if (!input) return jsonError("Choose a rating from 1 to 5.", 400);

  addFeedback(access.stakeAddress, input.stars, input.comment);
  return NextResponse.json({ ok: true });
}
