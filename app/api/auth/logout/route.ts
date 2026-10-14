import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, isSameOrigin } from "@/lib/session";
import { jsonError } from "@/lib/http";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return jsonError("This request was refused.", 403);
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  return NextResponse.json({ ok: true });
}
