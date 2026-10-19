import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { AppTabs } from "@/components/app-tabs";

export function SiteHeader({
  stakeAddress,
  isReviewer = false,
  signOut = null,
}: {
  stakeAddress?: string;
  isReviewer?: boolean;
  signOut?: ReactNode;
}) {
  return (
    <header className="mx-auto w-full max-w-3xl px-5 py-5">
      <div className="flex items-center justify-between gap-4">
        <Link href={stakeAddress ? "/account" : "/"} className="flex items-center gap-3">
          <Image src="/genwealth-logo.png" alt="" width={36} height={36} priority />
          <span className="text-lg font-semibold tracking-tight">GenWealth</span>
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/privacy" className="text-muted hover:text-ink">
            Privacy
          </Link>
          {stakeAddress ? (
            <span className="hidden font-mono text-xs text-muted sm:inline" title={stakeAddress}>
              {stakeAddress.slice(0, 14)}…{stakeAddress.slice(-4)}
            </span>
          ) : null}
          {signOut}
        </div>
      </div>
      {stakeAddress ? <AppTabs isReviewer={isReviewer} /> : null}
    </header>
  );
}
