"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { enableAccountWallet } from "@/components/account-wallet";
import { postJson } from "@/components/api";
import { fieldClass, labelClass, primaryButton, secondaryButton } from "@/components/styles";
import { isMainnetPaymentAddress, isTestnetStakeAddress } from "@/lib/addresses";
import { messageToHex, rewardMessage } from "@/lib/messages";

export function RewardAddressForm({
  stakeAddress,
  currentAddress,
}: {
  stakeAddress: string;
  currentAddress: string | null;
}) {
  const router = useRouter();
  const [mainnetAddress, setMainnetAddress] = useState(currentAddress ?? "");
  const [nonce, setNonce] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function reviewMessage() {
    setError("");
    setMessage("");
    const trimmed = mainnetAddress.trim();
    if (!isMainnetPaymentAddress(trimmed)) {
      setError("Enter a mainnet address that starts with addr1.");
      return;
    }
    setPending(true);
    try {
      const issued = (await postJson("/api/auth/nonce", { purpose: "reward" })) as {
        nonce?: string;
      };
      if (!issued.nonce) throw new Error("The confirmation could not be prepared.");
      setNonce(issued.nonce);
      setMessage(rewardMessage(stakeAddress, trimmed, issued.nonce));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The confirmation could not be prepared.");
    } finally {
      setPending(false);
    }
  }

  async function save() {
    setError("");
    setPending(true);
    try {
      const wallet = await enableAccountWallet();
      const networkId = await wallet.getNetworkId();
      if (networkId !== 0) {
        setError("Switch this wallet to preprod, then sign again.");
        return;
      }
      const [stake] = await wallet.getRewardAddressesBech32();
      if (stake !== stakeAddress || !isTestnetStakeAddress(stakeAddress)) {
        setError("Use the preprod wallet that belongs to this account.");
        return;
      }
      const [rewardHex] = await wallet.getRewardAddresses();
      if (!rewardHex) {
        setError("This wallet has no preprod stake address.");
        return;
      }
      const signed = await wallet.signData(rewardHex, messageToHex(message));
      await postJson("/api/reward-address", {
        mainnetAddress: mainnetAddress.trim(),
        nonce,
        signature: signed.signature,
        key: signed.key,
      });
      setMessage("");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The wallet did not sign the message.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="rounded-3xl border border-line bg-card p-5 sm:p-6">
      <h2 className="text-2xl">Reward address</h2>
      <p className="mt-2 text-sm leading-6 text-muted">
        This is the mainnet address that should receive rewards. Saving it asks your preprod
        wallet to sign, so the address stays tied to this account.
      </p>
      <label className={`${labelClass} mt-4`} htmlFor="mainnet-address">
        Mainnet address
      </label>
      <input
        id="mainnet-address"
        className={fieldClass}
        value={mainnetAddress}
        autoComplete="off"
        spellCheck={false}
        placeholder="addr1..."
        onChange={(event) => {
          setMainnetAddress(event.target.value);
          setMessage("");
        }}
      />
      <div className="mt-4">
        <button type="button" className={secondaryButton} disabled={pending} onClick={reviewMessage}>
          Review message
        </button>
      </div>

      {message ? (
        <div className="mt-4">
          <pre className="overflow-x-auto rounded-xl border border-line bg-raised p-3 font-mono text-xs leading-5 whitespace-pre-wrap">
            {message}
          </pre>
          <button type="button" className={`${primaryButton} mt-3`} disabled={pending} onClick={save}>
            Sign and save
          </button>
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
