import { NextResponse } from "next/server";
import { CONSENT_VERSION } from "@/content/privacy";
import { parseFeedbackInput } from "@/lib/domain";
import { jsonError, readJson, requireSession } from "@/lib/http";
import { addFeedback, getParticipant, updateParticipantContact } from "@/lib/store";

export async function POST(request: Request) {
  const access = await requireSession(request);
  if ("response" in access) return access.response;

  const participant = getParticipant(access.stakeAddress);
  if (!participant?.mainnetAddress) {
    return jsonError("Sign your mainnet reward address before sending a rating.", 403);
  }

  const parsed = parseFeedbackInput(await readJson(request));
  if (!parsed.ok) return jsonError(parsed.error, 400);

  const { email, consentTestContact, consentProductUpdates, ...rating } = parsed.value;
  if (email) {
    updateParticipantContact(access.stakeAddress, {
      email,
      consentTestContact,
      consentProductUpdates,
      consentVersion: CONSENT_VERSION,
    });
  }
  addFeedback(access.stakeAddress, rating);
  return NextResponse.json({ ok: true });
}
