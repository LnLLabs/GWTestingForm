import { PointsRules } from "@/components/points-rules";
import { SignOutButton } from "@/components/sign-out-button";
import { SiteHeader } from "@/components/site-header";
import { isAdminStake } from "@/lib/env";
import { sessionFromCookies } from "@/lib/session";

export default async function PointsPage() {
  const stakeAddress = await sessionFromCookies();

  return (
    <>
      <SiteHeader
        stakeAddress={stakeAddress ?? undefined}
        isReviewer={stakeAddress ? isAdminStake(stakeAddress) : false}
        signOut={stakeAddress ? <SignOutButton /> : null}
      />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 pb-16">
        <PointsRules />
      </main>
    </>
  );
}
