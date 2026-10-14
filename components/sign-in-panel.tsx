"use client";

import { MeshCardanoBrowserWallet, useWalletList } from "@meshsdk/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { rememberWallet } from "@/components/account-wallet";
import { postJson } from "@/components/api";
import { primaryButton, secondaryButton } from "@/components/styles";
import { WalletIcon } from "@/components/wallet-icon";
import { isTestnetStakeAddress } from "@/lib/addresses";
import { loginMessage, messageToHex } from "@/lib/messages";

export function SignInPanel() {
  const router = useRouter();
  const wallets = useWalletList();
  const [wallet, setWallet] = useState<MeshCardanoBrowserWallet | null>(null);
  const [walletName, setWalletName] = useState("");
  const [stakeAddress, setStakeAddress] = useState("");
  const [nonce, setNonce] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function chooseWallet(walletId: string, name: string) {
    setError("");
    setMessage("");
    setPending(true);
    try {
      const cardano = (
        globalThis as {
          cardano?: Record<string, { supportedExtensions?: { cip: number }[] } | undefined>;
        }
      ).cardano;
      const instance = await MeshCardanoBrowserWallet.enable(
        walletId,
        cardano?.[walletId]?.supportedExtensions,
      );
      const networkId = await instance.getNetworkId();
      if (networkId !== 0) {
        setError("Switch this wallet to preprod, then choose it again.");
        return;
      }
      const [stake] = await instance.getRewardAddressesBech32();
      if (!stake || !isTestnetStakeAddress(stake)) {
        setError("This wallet has no preprod stake address. Use a staked preprod wallet.");
        return;
      }
      const issued = (await postJson("/api/auth/nonce", { purpose: "login" })) as {
        nonce?: string;
      };
      if (!issued.nonce) throw new Error("The sign-in message could not be prepared.");
      rememberWallet(walletId);
      setWallet(instance);
      setWalletName(name);
      setStakeAddress(stake);
      setNonce(issued.nonce);
      setMessage(loginMessage(stake, issued.nonce));
    } catch (caught) {
      setWallet(null);
      setError(caught instanceof Error ? caught.message : "The wallet could not be opened.");
    } finally {
      setPending(false);
    }
  }

  async function signIn() {
    if (!wallet) return;
    setError("");
    setPending(true);
    try {
      const [rewardHex] = await wallet.getRewardAddresses();
      if (!rewardHex) {
        setError("This wallet has no preprod stake address. Use a staked preprod wallet.");
        return;
      }
      const signed = await wallet.signData(rewardHex, messageToHex(message));
      await postJson("/api/auth/verify", {
        stakeAddress,
        nonce,
        signature: signed.signature,
        key: signed.key,
      });
      router.push("/account");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The wallet did not sign the message.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="rounded-3xl border border-line bg-card p-5 sm:p-6">
      <h2 className="text-2xl">Sign in</h2>
      <p className="mt-2 text-sm leading-6 text-muted">
        Connect the preprod wallet you used on the demo. You will sign the message shown
        here. That signature proves you control the wallet.
      </p>

      {wallets.length === 0 ? (
        <p className="mt-4 text-sm leading-6">
          No Cardano wallet was found in this browser. Install Eternl, Lace, Yoroi, or Vespr,
          switch it to preprod, then reload this page.
        </p>
      ) : (
        <ul className="mt-4 flex flex-wrap gap-2">
          {wallets.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className={walletName === item.name && message ? secondaryButton : primaryButton}
                disabled={pending}
                onClick={() => void chooseWallet(item.id, item.name)}
              >
                <WalletIcon icon={item.icon} />
                {item.name}
              </button>
            </li>
          ))}
        </ul>
      )}

      {message ? (
        <div className="mt-5">
          <pre className="overflow-x-auto rounded-xl border border-line bg-raised p-3 font-mono text-xs leading-5 whitespace-pre-wrap">
            {message}
          </pre>
          <div className="mt-3 flex flex-wrap gap-3">
            <button type="button" className={primaryButton} disabled={pending} onClick={signIn}>
              Sign and enter
            </button>
            <button
              type="button"
              className={secondaryButton}
              disabled={pending}
              onClick={() => {
                setWallet(null);
                setWalletName("");
                setMessage("");
                setStakeAddress("");
                setNonce("");
              }}
            >
              Disconnect
            </button>
          </div>
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="mt-4 text-sm text-clay">
          {error}
        </p>
      ) : null}
    </section>
  );
}
