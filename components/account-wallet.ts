import { MeshCardanoBrowserWallet } from "@meshsdk/react";

const STORAGE_KEY = "gw_tester_wallet";

type InjectedWallet = {
  name?: string;
  enable?: () => Promise<unknown>;
  isEnabled?: () => Promise<boolean>;
  supportedExtensions?: { cip: number }[];
};

function injectedWallets(): Record<string, InjectedWallet> {
  const cardano = (globalThis as { cardano?: Record<string, InjectedWallet> }).cardano;
  return cardano ?? {};
}

export function rememberWallet(walletId: string) {
  localStorage.setItem(STORAGE_KEY, walletId);
}

export async function enableAccountWallet(): Promise<MeshCardanoBrowserWallet> {
  const wallets = injectedWallets();
  const remembered = localStorage.getItem(STORAGE_KEY);

  if (remembered && wallets[remembered]?.enable) {
    return MeshCardanoBrowserWallet.enable(
      remembered,
      wallets[remembered].supportedExtensions,
    );
  }

  for (const [id, entry] of Object.entries(wallets)) {
    if (!entry?.name || !entry.enable) continue;
    const allowed = await entry.isEnabled?.().catch(() => false);
    if (!allowed) continue;
    return MeshCardanoBrowserWallet.enable(id, entry.supportedExtensions);
  }

  throw new Error("Open the preprod wallet you used to sign in, then try again.");
}
