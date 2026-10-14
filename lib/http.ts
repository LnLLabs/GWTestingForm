import "server-only";

import { NextResponse } from "next/server";
import { isSameOrigin, sessionFromRequest } from "@/lib/session";

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function requireSession(request: Request): Promise<
  { stakeAddress: string } | { response: NextResponse }
> {
  if (!isSameOrigin(request)) {
    return { response: jsonError("This request was refused.", 403) };
  }
  const stakeAddress = await sessionFromRequest(request);
  if (!stakeAddress) {
    return { response: jsonError("Sign in again to continue.", 401) };
  }
  return { stakeAddress };
}
