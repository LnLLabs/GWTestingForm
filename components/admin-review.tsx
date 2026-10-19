"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { patchJson } from "@/components/api";
import { fieldClass, primaryButton } from "@/components/styles";
import {
  SEVERITIES,
  STATUSES,
  severityLabel,
  statusLabel,
  type BugStatus,
  type Severity,
} from "@/lib/domain";
import { shortAddress } from "@/lib/addresses";

export type ReviewParticipant = {
  stakeAddress: string;
  mainnetAddress: string | null;
  email: string | null;
  consentTestContact: boolean;
  consentProductUpdates: boolean;
  stars: number | null;
  comment: string;
  changes: string;
  mainnetUse: string;
  bugCount: number;
  createdAt: number;
};

export type ReviewBug = {
  id: number;
  stakeAddress: string;
  title: string;
  steps: string;
  expected: string;
  actual: string;
  suggestedSeverity: Severity;
  officialSeverity: Severity | null;
  status: BugStatus;
  createdAt: number;
};

export function AdminReview({
  participants,
  bugs,
}: {
  participants: ReviewParticipant[];
  bugs: ReviewBug[];
}) {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl">Participants</h2>
        {participants.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No one has signed in yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {participants.map((participant) => (
              <li key={participant.stakeAddress} className="rounded-2xl border border-line bg-card p-4 text-sm">
                <p className="font-mono text-xs" title={participant.stakeAddress}>
                  {shortAddress(participant.stakeAddress)}
                </p>
                <p className="mt-2 break-all">
                  {participant.mainnetAddress ?? "No reward address yet"}
                </p>
                {participant.email ? (
                  <>
                    <p className="mt-2 break-all">{participant.email}</p>
                    <p className="mt-1 text-muted">
                      {[
                        participant.consentTestContact ? "Test contact" : null,
                        participant.consentProductUpdates ? "Product updates" : null,
                      ]
                        .filter(Boolean)
                        .join(" · ") || "No email consent on file"}
                    </p>
                  </>
                ) : (
                  <p className="mt-2 text-muted">No email</p>
                )}
                <p className="mt-2 text-muted">
                  {participant.stars ? `${participant.stars} stars` : "No rating"} ·{" "}
                  {participant.bugCount} bug{participant.bugCount === 1 ? "" : "s"}
                </p>
                {participant.comment ? (
                  <p className="mt-2 whitespace-pre-wrap leading-6">{participant.comment}</p>
                ) : null}
                {participant.changes ? (
                  <p className="mt-2 whitespace-pre-wrap leading-6">
                    <span className="text-muted">Would change or add: </span>
                    {participant.changes}
                  </p>
                ) : null}
                {participant.mainnetUse ? (
                  <p className="mt-2 whitespace-pre-wrap leading-6">
                    <span className="text-muted">Would use on mainnet: </span>
                    {participant.mainnetUse}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
      <section>
        <h2 className="text-2xl">Bugs</h2>
        {bugs.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No bugs have been filed.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {bugs.map((bug) => (
              <ReviewBugCard key={bug.id} bug={bug} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function ReviewBugCard({ bug }: { bug: ReviewBug }) {
  const router = useRouter();
  const [status, setStatus] = useState<BugStatus>(bug.status);
  const [officialSeverity, setOfficialSeverity] = useState<string>(bug.officialSeverity ?? "");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function save() {
    setError("");
    setPending(true);
    try {
      await patchJson(`/api/admin/bugs/${bug.id}`, {
        status,
        officialSeverity: officialSeverity || null,
      });
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The review could not be saved.");
    } finally {
      setPending(false);
    }
  }

  return (
    <li className="rounded-2xl border border-line bg-card p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-medium">{bug.title}</h3>
        <span className="font-mono text-xs text-muted" title={bug.stakeAddress}>
          {shortAddress(bug.stakeAddress)}
        </span>
      </div>
      <dl className="mt-3 space-y-2 text-sm leading-6">
        <div>
          <dt className="text-muted">What they did</dt>
          <dd className="whitespace-pre-wrap">{bug.steps}</dd>
        </div>
        <div>
          <dt className="text-muted">Expected</dt>
          <dd className="whitespace-pre-wrap">{bug.expected}</dd>
        </div>
        <div>
          <dt className="text-muted">What happened</dt>
          <dd className="whitespace-pre-wrap">{bug.actual}</dd>
        </div>
      </dl>
      <p className="mt-3 text-xs text-muted">
        Suggested {severityLabel(bug.suggestedSeverity)} · {new Date(bug.createdAt).toLocaleString()}
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          Status
          <select
            className={`${fieldClass} mt-1`}
            value={status}
            onChange={(event) => setStatus(event.target.value as BugStatus)}
          >
            {STATUSES.map((item) => (
              <option key={item} value={item}>
                {statusLabel(item)}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Official severity
          <select
            className={`${fieldClass} mt-1`}
            value={officialSeverity}
            onChange={(event) => setOfficialSeverity(event.target.value)}
          >
            <option value="">Not set</option>
            {SEVERITIES.map((severity) => (
              <option key={severity} value={severity}>
                {severityLabel(severity)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <button type="button" className={`${primaryButton} mt-3`} disabled={pending} onClick={save}>
        Save review
      </button>
      {error ? (
        <p role="alert" className="mt-3 text-sm text-clay">
          {error}
        </p>
      ) : null}
    </li>
  );
}
