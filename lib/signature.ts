import "server-only";

import { createRequire } from "node:module";
import path from "node:path";
import { isTestnetStakeAddress } from "@/lib/addresses";

type VerifyDataSignature = (
  signature: string,
  key: string,
  message?: string,
  address?: string,
) => boolean;

const require = createRequire(path.join(process.cwd(), "package.json"));
const loadedVerifier = require("@cardano-foundation/cardano-verify-datasignature") as
  | VerifyDataSignature
  | { default: VerifyDataSignature };

const verifyDataSignature =
  typeof loadedVerifier === "function" ? loadedVerifier : loadedVerifier.default;

export function signatureMatches(
  signature: string,
  key: string,
  message: string,
  stakeAddress: string,
): boolean {
  if (!isTestnetStakeAddress(stakeAddress)) return false;
  if (!/^[0-9a-fA-F]+$/.test(signature) || !/^[0-9a-fA-F]+$/.test(key)) return false;

  const hexMessage = Buffer.from(message, "utf8").toString("hex");
  for (const candidate of [message, hexMessage]) {
    try {
      if (verifyDataSignature(signature, key, candidate, stakeAddress)) return true;
    } catch {
      continue;
    }
  }
  return false;
}
