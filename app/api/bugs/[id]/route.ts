import { NextResponse } from "next/server";
import { parseBugInput } from "@/lib/domain";
import { jsonError, readJson, requireSession } from "@/lib/http";
import { updateOwnBug } from "@/lib/store";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const access = await requireSession(request);
  if ("response" in access) return access.response;

  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isInteger(id) || id < 1) return jsonError("That bug was not found.", 404);

  const input = parseBugInput(await readJson(request));
  if (!input) {
    return jsonError("Add a title, what you did, what you expected, and what happened.", 400);
  }

  const result = updateOwnBug(access.stakeAddress, id, input);
  if (result === "missing") return jsonError("That bug was not found.", 404);
  if (result === "locked") {
    return jsonError("This bug has already been reviewed and can no longer be edited.", 409);
  }
  return NextResponse.json({ ok: true });
}
