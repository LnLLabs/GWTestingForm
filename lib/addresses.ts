import { bech32 } from "bech32";

const BECH32_LIMIT = 1000;

export function classifyAddress(
  address: string,
): "mainnet-payment" | "testnet-stake" | "other" {
  let decoded: { prefix: string; words: number[] };
  try {
    decoded = bech32.decode(address.trim(), BECH32_LIMIT);
  } catch {
    return "other";
  }

  if (decoded.prefix !== decoded.prefix.toLowerCase()) return "other";

  let bytes: number[];
  try {
    bytes = bech32.fromWords(decoded.words);
  } catch {
    return "other";
  }

  if (bytes.length < 29) return "other";

  const header = bytes[0] ?? 0;
  const type = header >> 4;
  const network = header & 0x0f;

  if (decoded.prefix === "addr" && network === 1 && type >= 0 && type <= 7) {
    return "mainnet-payment";
  }

  if (
    decoded.prefix === "stake_test" &&
    network === 0 &&
    (type === 14 || type === 15)
  ) {
    return "testnet-stake";
  }

  return "other";
}

export function isMainnetPaymentAddress(address: string): boolean {
  return classifyAddress(address) === "mainnet-payment";
}

export function isTestnetStakeAddress(address: string): boolean {
  return classifyAddress(address) === "testnet-stake";
}

export function bech32FromAddressHex(hex: string): string {
  const normalized = hex.trim().toLowerCase().replace(/^0x/, "");
  if (!/^[0-9a-f]+$/.test(normalized) || normalized.length < 58 || normalized.length % 2 !== 0) {
    throw new Error("Wallet returned an address this app could not read.");
  }

  const bytes = new Uint8Array(normalized.length / 2);
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = Number.parseInt(normalized.slice(i * 2, i * 2 + 2), 16);
  }

  const header = bytes[0] ?? 0;
  const type = header >> 4;
  const network = header & 0x0f;
  const prefix =
    type === 14 || type === 15
      ? network === 1
        ? "stake"
        : "stake_test"
      : network === 1
        ? "addr"
        : "addr_test";

  return bech32.encode(prefix, bech32.toWords(bytes), BECH32_LIMIT);
}

export function shortAddress(address: string): string {
  if (address.length <= 20) return address;
  return `${address.slice(0, 14)}…${address.slice(-6)}`;
}
