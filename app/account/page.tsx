import { redirect } from "next/navigation";
import { Checklist } from "@/components/checklist";
import { FeedbackForm } from "@/components/feedback-form";
import { RewardAddressForm } from "@/components/reward-address-form";
import { SignOutButton } from "@/components/sign-out-button";
import { SiteHeader } from "@/components/site-header";
import { isAdminStake } from "@/lib/env";
import { sessionFromCookies } from "@/lib/session";
import { getParticipant, latestFeedback, ensureParticipant } from "@/lib/store";

export default async function AccountPage() {
  const stakeAddress = await sessionFromCookies();
  if (!stakeAddress) redirect("/");

  ensureParticipant(stakeAddress);
  const participant = getParticipant(stakeAddress);
  const feedback = latestFeedback(stakeAddress);
  const locked = !participant?.mainnetAddress;

  return (
    <>
      <SiteHeader
        stakeAddress={stakeAddress}
        isReviewer={isAdminStake(stakeAddress)}
        signOut={<SignOutButton />}
      />
      <main className="mx-auto w-full max-w-3xl flex-1 space-y-8 px-5 pb-16">
        <section>
          <h1 className="text-4xl">Your account</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
            This account is your preprod stake key. Come back with the same wallet to update
            your reward address and demo rating.
          </p>
        </section>
        <section className="rounded-3xl border border-line bg-card p-5 sm:p-6">
          <h2 className="text-2xl">What to do</h2>
          <div className="mt-4">
            <Checklist />
          </div>
        </section>
        <RewardAddressForm
          stakeAddress={stakeAddress}
          currentAddress={participant?.mainnetAddress ?? null}
        />
        <FeedbackForm
          locked={locked}
          initialStars={feedback?.stars ?? null}
          initialComment={feedback?.comment ?? ""}
          initialChanges={feedback?.changes ?? ""}
          initialMainnetUse={feedback?.mainnetUse ?? ""}
          initialEmail={participant?.email ?? ""}
          initialConsentTestContact={participant?.consentTestContact ?? false}
          initialConsentProductUpdates={participant?.consentProductUpdates ?? false}
        />
      </main>
    </>
  );
}
