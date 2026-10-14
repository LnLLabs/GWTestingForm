import { bugPointValues, activityPoints, pointsLabel, pointsRules, unscoredActions } from "@/content/points";
import { SEVERITIES, severityLabel } from "@/lib/domain";

export function PointsRules() {
  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-4xl">Points</h1>
        <div className="mt-4 max-w-2xl space-y-3 text-sm leading-6 text-muted">
          {pointsRules.map((rule) => (
            <p key={rule}>{rule}</p>
          ))}
        </div>
      </section>
      <section className="rounded-3xl border border-line bg-card p-5 sm:p-6">
        <h2 className="text-2xl">Demo actions</h2>
        <PointsTable
          rows={activityPoints.map((row) => ({
            label: row.action,
            points: row.points,
          }))}
        />
        <p className="mt-4 text-sm leading-6 text-muted">{unscoredActions}</p>
      </section>
      <section className="rounded-3xl border border-line bg-card p-5 sm:p-6">
        <h2 className="text-2xl">Accepted bugs</h2>
        <PointsTable
          rows={[...SEVERITIES].reverse().map((severity) => ({
            label: severityLabel(severity),
            points: bugPointValues[severity],
          }))}
        />
      </section>
    </div>
  );
}

function PointsTable({ rows }: { rows: { label: string; points: number }[] }) {
  return (
    <table className="mt-4 w-full text-sm">
      <thead>
        <tr className="text-left text-muted">
          <th className="pb-2 font-medium">What you do</th>
          <th className="pb-2 text-right font-medium">Points</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.label} className="border-t border-line">
            <td className="py-2.5 pr-4">{row.label}</td>
            <td className="py-2.5 text-right tabular-nums">{pointsLabel(row.points)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
