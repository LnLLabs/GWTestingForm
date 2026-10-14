import { redirect } from "next/navigation";
import { BugSection, type BugView } from "@/components/bug-section";
import { SignOutButton } from "@/components/sign-out-button";
import { SiteHeader } from "@/components/site-header";
import { isSeverity, isBugStatus } from "@/lib/domain";
import { isAdminStake } from "@/lib/env";
import { sessionFromCookies } from "@/lib/session";
import { getParticipant, listOwnBugs, ensureParticipant } from "@/lib/store";

export default async function BugsPage() {
  const stakeAddress = await sessionFromCookies();
  if (!stakeAddress) redirect("/");

  ensureParticipant(stakeAddress);
  const participant = getParticipant(stakeAddress);
  const bugs: BugView[] = listOwnBugs(stakeAddress).flatMap((bug) => {
    if (!isSeverity(bug.suggestedSeverity) || !isBugStatus(bug.status)) return [];
    return [
      {
        id: bug.id,
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
      <SiteHeader
        stakeAddress={stakeAddress}
        isReviewer={isAdminStake(stakeAddress)}
        signOut={<SignOutButton />}
      />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 pb-16">
        <BugSection locked={!participant?.mainnetAddress} bugs={bugs} />
      </main>
    </>
  );
}
