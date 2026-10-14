"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { patchJson, postJson } from "@/components/api";
import { bugPointValues, pointsLabel, severityGuide } from "@/content/points";
import { fieldClass, labelClass, primaryButton, secondaryButton } from "@/components/styles";
import {
  SEVERITIES,
  severityLabel,
  statusLabel,
  type BugStatus,
  type Severity,
} from "@/lib/domain";

export type BugView = {
  id: number;
  title: string;
  steps: string;
  expected: string;
  actual: string;
  suggestedSeverity: Severity;
  officialSeverity: Severity | null;
  status: BugStatus;
  createdAt: number;
};

const emptyDraft = {
  title: "",
  steps: "",
  expected: "",
  actual: "",
  suggestedSeverity: "medium" as Severity,
};

export function BugSection({ locked, bugs }: { locked: boolean; bugs: BugView[] }) {
  return (
    <section className="rounded-3xl border border-line bg-card p-5 sm:p-6">
      <h2 className="text-2xl">Bugs</h2>
      <p className="mt-2 text-sm leading-6 text-muted">
        File a bug whenever you find one. You can edit it until a reviewer accepts it, marks
        it as a duplicate, or rejects it. Suggest a severity. The reviewer sets the one that
        counts toward a reward.
      </p>
      {locked ? (
        <p className="mt-3 text-sm text-muted">Sign a mainnet reward address before filing a bug.</p>
      ) : (
        <BugForm />
      )}
      <ul className="mt-6 space-y-4">
        {bugs.length === 0 ? (
          <li className="text-sm text-muted">No bugs filed yet.</li>
        ) : (
          bugs.map((bug) => <BugItem key={bug.id} bug={bug} />)
        )}
      </ul>
    </section>
  );
}

function BugForm() {
  const router = useRouter();
  const [draft, setDraft] = useState(emptyDraft);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit() {
    setError("");
    setPending(true);
    try {
      await postJson("/api/bugs", draft);
      setDraft(emptyDraft);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The bug could not be filed.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mt-4 space-y-3">
      <BugFields idPrefix="new" draft={draft} onChange={setDraft} />
      <button type="button" className={primaryButton} disabled={pending} onClick={submit}>
        File bug
      </button>
      {error ? (
        <p role="alert" className="text-sm text-clay">
          {error}
        </p>
      ) : null}
      <SeverityGuide />
    </div>
  );
}

function SeverityGuide() {
  return (
    <div className="rounded-2xl border border-line bg-raised px-4 py-3">
      <p className="text-sm font-medium">Severity guide</p>
      <ul className="mt-2 space-y-2">
        {SEVERITIES.map((severity) => (
          <li key={severity} className="text-sm leading-6">
            <span className="font-medium">{severityLabel(severity)}</span>
            <span className="text-muted">
              {" "}
              — {pointsLabel(bugPointValues[severity])}. {severityGuide[severity]}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BugItem({ bug }: { bug: BugView }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    title: bug.title,
    steps: bug.steps,
    expected: bug.expected,
    actual: bug.actual,
    suggestedSeverity: bug.suggestedSeverity,
  });
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const editable = bug.status === "submitted";

  async function save() {
    setPending(true);
    setError("");
    try {
      await patchJson(`/api/bugs/${bug.id}`, draft);
      setEditing(false);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The bug could not be updated.");
    } finally {
      setPending(false);
    }
  }

  return (
    <li className="rounded-2xl border border-line bg-raised p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-medium">{bug.title}</h3>
        <span className="text-xs font-medium tracking-wide text-muted uppercase">
          {statusLabel(bug.status)}
        </span>
      </div>
      <p className="mt-2 text-xs text-muted">
        Suggested {severityLabel(bug.suggestedSeverity)}
        {bug.officialSeverity
          ? ` · Reviewed as ${severityLabel(bug.officialSeverity)}`
          : ""}
        {" · "}
        {new Date(bug.createdAt).toLocaleString()}
      </p>
      {editing ? (
        <div className="mt-3 space-y-3">
          <BugFields idPrefix={`bug-${bug.id}`} draft={draft} onChange={setDraft} />
          <div className="flex gap-2">
            <button type="button" className={primaryButton} disabled={pending} onClick={save}>
              Save changes
            </button>
            <button type="button" className={secondaryButton} disabled={pending} onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <dl className="mt-3 space-y-2 text-sm leading-6">
          <div>
            <dt className="text-muted">What you did</dt>
            <dd className="whitespace-pre-wrap">{bug.steps}</dd>
          </div>
          <div>
            <dt className="text-muted">What you expected</dt>
            <dd className="whitespace-pre-wrap">{bug.expected}</dd>
          </div>
          <div>
            <dt className="text-muted">What happened</dt>
            <dd className="whitespace-pre-wrap">{bug.actual}</dd>
          </div>
        </dl>
      )}
      {editable && !editing ? (
        <button type="button" className={`${secondaryButton} mt-3`} onClick={() => setEditing(true)}>
          Edit
        </button>
      ) : null}
      {error ? (
        <p role="alert" className="mt-3 text-sm text-clay">
          {error}
        </p>
      ) : null}
    </li>
  );
}

function BugFields({
  idPrefix,
  draft,
  onChange,
}: {
  idPrefix: string;
  draft: typeof emptyDraft;
  onChange: (draft: typeof emptyDraft) => void;
}) {
  return (
    <>
      <label className={labelClass} htmlFor={`${idPrefix}-title`}>
        Title
      </label>
      <input
        id={`${idPrefix}-title`}
        className={fieldClass}
        value={draft.title}
        maxLength={160}
        onChange={(event) => onChange({ ...draft, title: event.target.value })}
      />
      <Field
        id={`${idPrefix}-steps`}
        label="What you did"
        value={draft.steps}
        onChange={(steps) => onChange({ ...draft, steps })}
      />
      <Field
        id={`${idPrefix}-expected`}
        label="What you expected"
        value={draft.expected}
        onChange={(expected) => onChange({ ...draft, expected })}
      />
      <Field
        id={`${idPrefix}-actual`}
        label="What happened"
        value={draft.actual}
        onChange={(actual) => onChange({ ...draft, actual })}
      />
      <label className={labelClass} htmlFor={`${idPrefix}-severity`}>
        Suggested severity
      </label>
      <select
        id={`${idPrefix}-severity`}
        className={fieldClass}
        value={draft.suggestedSeverity}
        onChange={(event) =>
          onChange({ ...draft, suggestedSeverity: event.target.value as Severity })
        }
      >
        {SEVERITIES.map((severity) => (
          <option key={severity} value={severity}>
            {severityLabel(severity)} — {pointsLabel(bugPointValues[severity])}
          </option>
        ))}
      </select>
      <p className="text-sm leading-6 text-muted">
        Only an accepted bug counts, and only at the severity a reviewer sets.
      </p>
    </>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <>
      <label className={labelClass} htmlFor={id}>
        {label}
      </label>
      <textarea
        id={id}
        className={`${fieldClass} min-h-24`}
        value={value}
        maxLength={8000}
        onChange={(event) => onChange(event.target.value)}
      />
    </>
  );
}
