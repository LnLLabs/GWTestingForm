import { bech32 } from "bech32";
import { describe, expect, it } from "vitest";
import {
  bech32FromAddressHex,
  isMainnetPaymentAddress,
  isTestnetStakeAddress,
} from "@/lib/addresses";

function encode(prefix: string, type: number, network: number, seed: number) {
  const bodyLength = type === 0 || type === 1 || type === 2 || type === 3 ? 56 : 28;
  const bytes = [
    (type << 4) | network,
    ...Array.from({ length: bodyLength }, (_, index) => (index + seed) & 0xff),
  ];
  return {
    address: bech32.encode(prefix, bech32.toWords(bytes), 1000),
    hex: Buffer.from(bytes).toString("hex"),
  };
}

describe("address classification", () => {
  const mainnet = encode("addr", 0, 1, 1);
  const enterprise = encode("addr", 6, 1, 3);
  const testnetPayment = encode("addr_test", 0, 0, 4);
  const mainnetStake = encode("stake", 14, 1, 5);
  const preprodStake = encode("stake_test", 14, 0, 6);

  it("accepts a mainnet payment address for rewards", () => {
    expect(isMainnetPaymentAddress(mainnet.address)).toBe(true);
    expect(isMainnetPaymentAddress(enterprise.address)).toBe(true);
  });

  it("rejects testnet payment addresses and stake addresses as a payout address", () => {
    expect(isMainnetPaymentAddress(testnetPayment.address)).toBe(false);
    expect(isMainnetPaymentAddress(mainnetStake.address)).toBe(false);
    expect(isMainnetPaymentAddress(preprodStake.address)).toBe(false);
    expect(isMainnetPaymentAddress("addr1not-an-address")).toBe(false);
  });

  it("accepts only a preprod stake address as an account id", () => {
    expect(isTestnetStakeAddress(preprodStake.address)).toBe(true);
    expect(isTestnetStakeAddress(mainnetStake.address)).toBe(false);
    expect(isTestnetStakeAddress(mainnet.address)).toBe(false);
    expect(bech32FromAddressHex(preprodStake.hex)).toBe(preprodStake.address);
  });
});
