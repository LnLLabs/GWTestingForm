import { NextResponse } from "next/server";
import { parseBugInput } from "@/lib/domain";
import { jsonError, readJson, requireSession } from "@/lib/http";
import { addBug, getParticipant } from "@/lib/store";

export async function POST(request: Request) {
  const access = await requireSession(request);
  if ("response" in access) return access.response;

  const participant = getParticipant(access.stakeAddress);
  if (!participant?.mainnetAddress) {
    return jsonError("Sign your mainnet reward address before filing a bug.", 403);
  }

  const input = parseBugInput(await readJson(request));
  if (!input) {
    return jsonError("Add a title, what you did, what you expected, and what happened.", 400);
  }

  const id = addBug(access.stakeAddress, input);
  return NextResponse.json({ ok: true, id });
}
