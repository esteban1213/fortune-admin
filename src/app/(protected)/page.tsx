"use client";

import Link from "next/link";
import { useFortunes } from "@/lib/use-fortunes";
import { TodaysFortuneCard } from "@/components/todays-fortune-card";

function StatCard({ label, value, href }: { label: string; value: number | string; href?: string }) {
  const content = (
    <div className="rounded-xl border border-line bg-surface p-4 transition sm:p-5 hover:border-line-strong">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-foreground">{value}</p>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

export default function OverviewPage() {
  const { fortunes, loading, error } = useFortunes();

  const total = fortunes.length;
  const used = fortunes.filter((f) => f.used).length;
  const pending = fortunes.filter((f) => f.submissionStatus === "submitted").length;
  const approved = fortunes.filter((f) => f.submissionStatus === "approved").length;
  const denied = fortunes.filter((f) => f.submissionStatus === "denied").length;
  const scheduled = fortunes.filter((f) => f.releaseDate && !f.used).length;

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-foreground">Overview</h1>
      <p className="mb-6 text-sm text-muted sm:mb-8">
        Live counts across the fortunes collection.
      </p>

      {error && (
        <p className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
          {error}
        </p>
      )}

      {!loading && <TodaysFortuneCard fortunes={fortunes} />}

      {loading ? (
        <p className="text-subtle">Loading...</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          <StatCard label="Total fortunes" value={total} href="/fortunes" />
          <StatCard label="Used" value={used} />
          <StatCard label="Pending submissions" value={pending} href="/submissions" />
          <StatCard label="Approved" value={approved} />
          <StatCard label="Denied" value={denied} />
          <StatCard label="Scheduled (unused)" value={scheduled} href="/fortunes" />
        </div>
      )}
    </div>
  );
}
