"use client";
import { FortuneEditor } from "@/components/fortune-editor";
import type { Fortune } from "@/lib/types";

const f = { id: "1", text: "A smooth sea never made a skilled sailor.", category: "wisdom", points: 10, nsfw: false, year: 2026, releaseDate: "2026-09-21", submissionStatus: "approved", used: true, usedDate: "2026-09-01", creatorId: "abc123" } as unknown as Fortune;

export default function Preview() {
  return (
    <div className="space-y-4 p-6">
      <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">Error banner</p>
      <div className="grid grid-cols-3 gap-3">
        {["Total", "Used", "Pending"].map((l) => (
          <div key={l} className="rounded-xl border border-line bg-surface p-4 hover:border-line-strong">
            <p className="text-sm text-muted">{l}</p><p className="mt-2 text-3xl font-semibold text-foreground">12</p>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-950 dark:text-violet-300">Feature request</span>
        <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-medium text-sky-700 dark:bg-sky-950 dark:text-sky-300">Feedback</span>
        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">not refreshed</span>
        <button className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white">Approve</button>
        <button className="rounded-md bg-red-100 px-3 py-1.5 text-sm font-medium text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-100">Deny</button>
        <button className="rounded-md bg-surface-2 px-3 py-1.5 text-sm text-foreground">Active nav</button>
        <button className="px-3 py-1.5 text-sm text-muted">Inactive nav</button>
        <span className="border-b-2 border-foreground px-3 py-2 text-sm text-foreground">Tab</span>
      </div>
      <div className="rounded-xl border border-line bg-surface p-4">
        <p className="text-foreground">{f.text}</p>
        <p className="text-xs text-subtle">approved · wisdom · 10 pts</p>
        <FortuneEditor fortune={f} />
      </div>
    </div>
  );
}
