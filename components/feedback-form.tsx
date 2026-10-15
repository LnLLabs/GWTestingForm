"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { postJson } from "@/components/api";
import { fieldClass, labelClass, primaryButton } from "@/components/styles";

export function FeedbackForm({
  locked,
  initialStars,
  initialComment,
  initialChanges,
  initialMainnetUse,
}: {
  locked: boolean;
  initialStars: number | null;
  initialComment: string;
  initialChanges: string;
  initialMainnetUse: string;
}) {
  const router = useRouter();
  const [stars, setStars] = useState(initialStars ?? 0);
  const [comment, setComment] = useState(initialComment);
  const [changes, setChanges] = useState(initialChanges);
  const [mainnetUse, setMainnetUse] = useState(initialMainnetUse);
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
    setPending(true);
    try {
      await postJson("/api/feedback", { stars, comment, changes, mainnetUse });
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
        One score for the demo, a comment, and two questions. Saving again keeps a new copy,
        and the latest one is the feedback on file.
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
