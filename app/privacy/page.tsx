import { SignOutButton } from "@/components/sign-out-button";
import { SiteHeader } from "@/components/site-header";
import { CONSENT_VERSION, EMAIL_RETENTION } from "@/content/privacy";
import { isEmailAddress } from "@/lib/domain";
import { getEnv, isAdminStake } from "@/lib/env";
import { sessionFromCookies } from "@/lib/session";

export default async function PrivacyPage() {
  const stakeAddress = await sessionFromCookies();
  const { privacyControllerName, privacyContactEmail } = getEnv();
  const controllerNamed = privacyControllerName.length > 0;
  const contactReady = isEmailAddress(privacyContactEmail);

  return (
    <>
      <SiteHeader
        stakeAddress={stakeAddress ?? undefined}
        isReviewer={stakeAddress ? isAdminStake(stakeAddress) : false}
        signOut={stakeAddress ? <SignOutButton /> : null}
      />
      <main className="mx-auto w-full max-w-3xl flex-1 space-y-8 px-5 pb-16">
        <section>
          <h1 className="text-4xl">Privacy notice</h1>
          <p className="mt-3 text-sm text-muted">Version {CONSENT_VERSION}</p>
        </section>
        <section className="space-y-3 text-sm leading-6">
          <h2 className="text-2xl">Who is responsible</h2>
          <p>
            GenWealth is a project in formation. It is not a legal entity. Until a company
            exists, the person responsible for tester data from this site is{" "}
            {controllerNamed ? privacyControllerName : "not named yet"}.
          </p>
          {contactReady ? (
            <p>
              Contact{" "}
              <a
                className="text-accent underline-offset-4 hover:underline"
                href={`mailto:${privacyContactEmail}`}
              >
                {privacyContactEmail}
              </a>{" "}
              to ask what we hold, correct it, delete it, or withdraw consent.
            </p>
          ) : (
            <p>
              A contact email is not configured yet. Set{" "}
              <span className="font-mono">PRIVACY_CONTACT_EMAIL</span> before collecting
              addresses.
            </p>
          )}
        </section>
        <section className="space-y-3 text-sm leading-6">
          <h2 className="text-2xl">What we store</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>Your preprod stake address, when you sign in.</li>
            <li>A mainnet reward address, and the signature that shows you control it.</li>
            <li>Demo ratings, comments, and bug reports.</li>
            <li>An email address, only if you choose to give one.</li>
          </ul>
        </section>
        <section className="space-y-3 text-sm leading-6">
          <h2 className="text-2xl">Email</h2>
          <p>Email is optional. We use it only for a purpose you tick:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Contact about your testing, rewards, and follow-up on what you submitted.</li>
            <li>Product updates and early access.</li>
          </ul>
          <p>
            Product updates are sent only if you tick that box. Leaving feedback without an
            email, or without that box, is not a request for product mail.
          </p>
          <p>{EMAIL_RETENTION}</p>
          <p>
            Wallet identifiers, ratings, and bug reports stay for the tester program and later
            reward checks. We delete them when you ask, or when the program no longer needs
            them.
          </p>
        </section>
        <section className="space-y-3 text-sm leading-6">
          <h2 className="text-2xl">After a company is formed</h2>
          <p>
            This notice will name that company as the controller, and say that tester data has
            moved to it. Until then, the named person above is the controller.
          </p>
        </section>
      </main>
    </>
  );
}
