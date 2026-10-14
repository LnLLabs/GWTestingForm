export function messageToHex(message: string): string {
  return Array.from(new TextEncoder().encode(message), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

export function loginMessage(stakeAddress: string, nonce: string): string {
  return [
    "GenWealth tester login",
    `Stake address: ${stakeAddress}`,
    `Nonce: ${nonce}`,
  ].join("\n");
}

export function rewardMessage(
  stakeAddress: string,
  mainnetAddress: string,
  nonce: string,
): string {
  return [
    "GenWealth tester reward address",
    `Stake address: ${stakeAddress}`,
    `Mainnet address: ${mainnetAddress}`,
    `Nonce: ${nonce}`,
  ].join("\n");
}
