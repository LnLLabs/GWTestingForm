"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { postJson } from "@/components/api";
import { fieldClass, labelClass, primaryButton } from "@/components/styles";
import { EMAIL_RETENTION } from "@/content/privacy";
import { feedbackContactError } from "@/lib/domain";

export function FeedbackForm({
  locked,
  initialStars,
  initialComment,
  initialChanges,
  initialMainnetUse,
  initialEmail,
  initialConsentTestContact,
  initialConsentProductUpdates,
}: {
  locked: boolean;
  initialStars: number | null;
  initialComment: string;
  initialChanges: string;
  initialMainnetUse: string;
  initialEmail: string;
  initialConsentTestContact: boolean;
  initialConsentProductUpdates: boolean;
}) {
  const router = useRouter();
  const [stars, setStars] = useState(initialStars ?? 0);
  const [comment, setComment] = useState(initialComment);
  const [changes, setChanges] = useState(initialChanges);
  const [mainnetUse, setMainnetUse] = useState(initialMainnetUse);
  const [email, setEmail] = useState(initialEmail);
  const [consentTestContact, setConsentTestContact] = useState(initialConsentTestContact);
  const [consentProductUpdates, setConsentProductUpdates] = useState(
    initialConsentProductUpdates,
  );
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setError("");
    setSaved(false);
    if (stars < 1) {
      setError("Choose a rating from 1 to 5.");
      return;
    }
    const contactError = feedbackContactError({
      email,
      consentTestContact,
      consentProductUpdates,
    });
    if (contactError) {
      setError(contactError);
      return;
    }
    setPending(true);
    try {
      await postJson("/api/feedback", {
        stars,
        comment,
        changes,
        mainnetUse,
        email,
        consentTestContact,
        consentProductUpdates,
      });
      setSaved(true);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The feedback could not be saved.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="rounded-3xl border border-line bg-card p-5 sm:p-6">
      <h2 className="text-2xl">Demo rating</h2>
      <p className="mt-2 text-sm leading-6 text-muted">
        One score for the demo, a comment, and two questions. An email is optional. Saving
        again keeps a new copy of the rating, and the latest one is the feedback on file.
      </p>
      <fieldset disabled={locked || pending} className="mt-4 disabled:opacity-60">
        <legend className="sr-only">Rating from 1 to 5</legend>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={stars === value}
              aria-label={`${value} star${value === 1 ? "" : "s"}`}
              className={`h-10 w-10 rounded-full border text-lg ${
                value <= stars
                  ? "border-gold bg-gold text-white"
                  : "border-line bg-raised text-muted"
              }`}
              onClick={() => {
                setStars(value);
                setSaved(false);
              }}
            >
              {value}
            </button>
          ))}
        </div>
        <label className={`${labelClass} mt-4`} htmlFor="demo-comment">
          Comment
        </label>
        <textarea
          id="demo-comment"
          className={`${fieldClass} min-h-28`}
          value={comment}
          maxLength={4000}
          onChange={(event) => {
            setComment(event.target.value);
            setSaved(false);
          }}
        />
        <label className={`${labelClass} mt-4`} htmlFor="demo-changes">
          What would you change or add to the solution?
        </label>
        <textarea
          id="demo-changes"
          className={`${fieldClass} min-h-28`}
          value={changes}
          maxLength={4000}
          onChange={(event) => {
            setChanges(event.target.value);
            setSaved(false);
          }}
        />
        <label className={`${labelClass} mt-4`} htmlFor="demo-mainnet-use">
          Would you use this solution for yourself when it&apos;s live on Mainnet? Why or why
          not?
        </label>
        <textarea
          id="demo-mainnet-use"
          className={`${fieldClass} min-h-28`}
          value={mainnetUse}
          maxLength={4000}
          onChange={(event) => {
            setMainnetUse(event.target.value);
            setSaved(false);
          }}
        />
        <label className={`${labelClass} mt-4`} htmlFor="demo-email">
          Email (optional)
        </label>
        <input
          id="demo-email"
          type="email"
          autoComplete="email"
          className={fieldClass}
          value={email}
          maxLength={254}
          onChange={(event) => {
            setEmail(event.target.value);
            setSaved(false);
          }}
        />
        <div className="mt-4 space-y-3 text-sm leading-6">
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              className="mt-1"
              checked={consentTestContact}
              onChange={(event) => {
                setConsentTestContact(event.target.checked);
                setSaved(false);
              }}
            />
            <span>Email me about my testing, rewards, and follow-up on what I submitted.</span>
          </label>
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              className="mt-1"
              checked={consentProductUpdates}
              onChange={(event) => {
                setConsentProductUpdates(event.target.checked);
                setSaved(false);
              }}
            />
            <span>Email me GenWealth product updates and early-access news.</span>
          </label>
        </div>
        <p className="mt-3 text-sm leading-6 text-muted">
          {EMAIL_RETENTION} To withdraw consent or delete your email, use the contact on the{" "}
          <Link href="/privacy" className="text-accent underline-offset-4 hover:underline">
            privacy notice
          </Link>
          .
        </p>
        <button type="button" className={`${primaryButton} mt-4`} onClick={save}>
          Save feedback
        </button>
      </fieldset>
      {locked ? (
        <p className="mt-3 text-sm text-muted">Sign a mainnet reward address before rating the demo.</p>
      ) : null}
      {saved ? <p className="mt-3 text-sm text-accent">Feedback saved.</p> : null}
      {error ? (
        <p role="alert" className="mt-3 text-sm text-clay">
          {error}
        </p>
      ) : null}
    </section>
  );
}
