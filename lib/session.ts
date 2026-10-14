import "server-only";

import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { isTestnetStakeAddress } from "@/lib/addresses";
import { getEnv } from "@/lib/env";

export const SESSION_COOKIE = "gw_tester_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

function secretKey() {
  return new TextEncoder().encode(getEnv().sessionSecret);
}

export async function createSessionToken(stakeAddress: string): Promise<string> {
  return new SignJWT({ sub: stakeAddress })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(stakeAddress)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey());
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: getEnv().secureCookies,
    path: "/",
    maxAge: SESSION_MAX_AGE,
  };
}

export async function readSessionToken(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    const stakeAddress = typeof payload.sub === "string" ? payload.sub : "";
    if (!isTestnetStakeAddress(stakeAddress)) return null;
    return stakeAddress;
  } catch {
    return null;
  }
}

export function tokenFromCookieHeader(header: string | null): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === SESSION_COOKIE) return decodeURIComponent(rest.join("="));
  }
  return undefined;
}

export async function sessionFromRequest(request: Request): Promise<string | null> {
  return readSessionToken(tokenFromCookieHeader(request.headers.get("cookie")));
}

export async function sessionFromCookies(): Promise<string | null> {
  const jar = await cookies();
  return readSessionToken(jar.get(SESSION_COOKIE)?.value);
}

export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!host) return false;
  try {
    return new URL(origin).host === host.split(",")[0]?.trim();
  } catch {
    return false;
  }
}
