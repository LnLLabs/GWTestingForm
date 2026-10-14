import type { Severity } from "@/lib/domain";

export const pointsRules = [
  "Activity points and bug points add together. Each listed action counts once per tester.",
  "Bug points are paid only when a reviewer sets the bug to accepted. The official severity is the one that counts. Suggested severity, duplicates, and rejected bugs are worth nothing.",
  "This page does not show a personal total or an ADA amount.",
];

export const activityPoints = [
  { action: "Create a vault", points: 1 },
  { action: "Deposit into the vault", points: 1 },
  { action: "Send from the vault", points: 1 },
  { action: "Stake ADA from the vault", points: 1 },
  { action: "Create an inheritance plan with 2 inheritors", points: 2 },
  { action: "Assign specific assets to an inheritor", points: 1 },
  { action: "Assign an executor", points: 1 },
  { action: "Update the proof-of-life deadline", points: 1 },
  { action: "Create a recovery plan", points: 1 },
  { action: "Have the executor trigger inheritance", points: 1 },
  { action: "Close a DeFi position as executor", points: 1 },
  { action: "Fractionalize an asset", points: 1 },
  { action: "Un-fractionalize an asset", points: 1 },
  { action: "Swap on Minswap from the vault", points: 1 },
  { action: "Provide or withdraw Minswap liquidity", points: 1 },
  { action: "Start an owner change", points: 1 },
  { action: "Cancel an owner change", points: 1 },
  { action: "Finalize an owner change", points: 1 },
  { action: "Claim stage 1 (specific assets)", points: 5 },
  { action: "Claim stage 2 (your share)", points: 5 },
  { action: "Run recovery to a new owner wallet", points: 5 },
] as const;

export const unscoredActions =
  "Connecting a wallet, opening a vault you already have, copying a receive address, and local contacts or email settings are not scored. Those do not change the vault.";

export const bugPointValues: Record<Severity, number> = {
  informational: 0,
  low: 1,
  medium: 5,
  high: 20,
  critical: 50,
};

export const severityGuide: Record<Severity, string> = {
  informational: "A typo, unclear wording, or a suggestion. Nothing is broken.",
  low: "A small mistake with an easy way around it.",
  medium: "A step fails, and testers can still finish by another route.",
  high: "A main flow fails, or a vault, will, or claim shows the wrong result, and there is no easy way around it.",
  critical:
    "Assets can be lost, the wallet is asked to sign the wrong thing, or inheritance or recovery can start by mistake.",
};

export function pointsLabel(points: number): string {
  return points === 1 ? "1 point" : `${points} points`;
}
