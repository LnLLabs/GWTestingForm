import { notFound, redirect } from "next/navigation";
import { AdminReview, type ReviewBug, type ReviewParticipant } from "@/components/admin-review";
import { SignOutButton } from "@/components/sign-out-button";
import { SiteHeader } from "@/components/site-header";
import { isBugStatus, isSeverity } from "@/lib/domain";
import { isAdminStake } from "@/lib/env";
import { sessionFromCookies } from "@/lib/session";
import { listBugsForReview, listParticipantsForReview } from "@/lib/store";

export default async function AdminPage() {
  const stakeAddress = await sessionFromCookies();
  if (!stakeAddress) redirect("/");
  if (!isAdminStake(stakeAddress)) notFound();

  const participants: ReviewParticipant[] = listParticipantsForReview().map((row) => ({
    stakeAddress: row.participant.stakeAddress,
    mainnetAddress: row.participant.mainnetAddress,
    email: row.participant.email,
    consentTestContact: row.participant.consentTestContact,
    consentProductUpdates: row.participant.consentProductUpdates,
    stars: row.latest?.stars ?? null,
    comment: row.latest?.comment ?? "",
    changes: row.latest?.changes ?? "",
    mainnetUse: row.latest?.mainnetUse ?? "",
    bugCount: row.bugCount,
    createdAt: row.participant.createdAt,
  }));

  const bugs: ReviewBug[] = listBugsForReview().flatMap((bug) => {
    if (!isSeverity(bug.suggestedSeverity) || !isBugStatus(bug.status)) return [];
    return [
      {
        id: bug.id,
        stakeAddress: bug.stakeAddress,
        title: bug.title,
        steps: bug.steps,
        expected: bug.expected,
        actual: bug.actual,
        suggestedSeverity: bug.suggestedSeverity,
        officialSeverity:
          bug.officialSeverity && isSeverity(bug.officialSeverity)
            ? bug.officialSeverity
            : null,
        status: bug.status,
        createdAt: bug.createdAt,
      },
    ];
  });

  return (
    <>
      <SiteHeader stakeAddress={stakeAddress} isReviewer signOut={<SignOutButton />} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 pb-16">
        <h1 className="text-4xl">Review</h1>
        <p className="mt-3 mb-8 text-sm leading-6 text-muted">
          Set the status and the severity that counts. Reward amounts are applied later, when
          payouts are calculated.
        </p>
        <AdminReview participants={participants} bugs={bugs} />
      </main>
    </>
  );
}
