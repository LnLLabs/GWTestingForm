import { NextResponse } from "next/server";
import { isAdminStake } from "@/lib/env";
import { parseReviewInput } from "@/lib/domain";
import { jsonError, readJson } from "@/lib/http";
import { isSameOrigin, sessionFromRequest } from "@/lib/session";
import { reviewBug } from "@/lib/store";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isSameOrigin(request)) return jsonError("This request was refused.", 403);

  const stakeAddress = await sessionFromRequest(request);
  if (!stakeAddress || !isAdminStake(stakeAddress)) {
    return jsonError("Not found.", 404);
  }

  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isInteger(id) || id < 1) return jsonError("Not found.", 404);

  const input = parseReviewInput(await readJson(request));
  if (!input) {
    return jsonError("Choose a status. Accepted bugs also need a severity.", 400);
  }

  if (!reviewBug(id, stakeAddress, input)) return jsonError("Not found.", 404);
  return NextResponse.json({ ok: true });
}
