import Link from "next/link";
import { redirect } from "next/navigation";
import { brief } from "@/content/brief";
import { SignInPanel } from "@/components/sign-in-panel";
import { SiteHeader } from "@/components/site-header";
import { sessionFromCookies } from "@/lib/session";

export default async function HomePage() {
  const stakeAddress = await sessionFromCookies();
  if (stakeAddress) redirect("/account");

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 space-y-8 px-5 pb-16">
        <section>
          <p className="text-xs font-medium tracking-[0.16em] text-muted uppercase">
            {brief.eyebrow}
          </p>
          <h1 className="mt-2 text-4xl leading-tight sm:text-5xl">{brief.title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted">{brief.intro}</p>
          <p className="mt-3 max-w-2xl text-sm leading-6">{brief.seedPhrase}</p>
          <p className="mt-3">
            <Link
              href="/points"
              className="text-sm font-medium text-accent underline-offset-4 hover:underline"
            >
              How points work
            </Link>
          </p>
        </section>
        <SignInPanel />
      </main>
    </>
  );
}
