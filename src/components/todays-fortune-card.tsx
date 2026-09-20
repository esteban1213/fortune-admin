"use client";

import { useMemo, useState } from "react";
import { useTodaysFortune } from "@/lib/use-todays-fortune";
import { publishAsTodaysFortune } from "@/lib/publish-fortune";
import { pacificToday } from "@/lib/pacific-date";
import type { Fortune } from "@/lib/types";

export function TodaysFortuneCard({ fortunes }: { fortunes: Fortune[] }) {
  const { todaysFortune, loading } = useTodaysFortune();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const candidates = useMemo(
    () =>
      fortunes
        .filter((f) => f.submissionStatus === "approved")
        .sort((a, b) => Number(a.used) - Number(b.used)),
    [fortunes],
  );

  async function handlePublish() {
    const fortune = candidates.find((f) => f.id === selectedId);
    if (!fortune) return;
    setPublishing(true);
    setError(null);
    try {
      await publishAsTodaysFortune(fortune);
      setPickerOpen(false);
      setSelectedId("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't publish that fortune.");
    } finally {
      setPublishing(false);
    }
  }

  const isStale = todaysFortune && todaysFortune.date !== pacificToday();

  return (
    <div className="mb-6 rounded-xl border border-line bg-surface p-4 sm:mb-8 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-muted">Today&apos;s fortune</p>
          {loading ? (
            <p className="mt-2 text-subtle">Loading...</p>
          ) : todaysFortune ? (
            <>
              <p className="mt-2 text-lg text-foreground">{todaysFortune.text}</p>
              <p className="mt-1 text-xs text-subtle">
                {todaysFortune.category} &middot; {todaysFortune.points} pts &middot;{" "}
                {todaysFortune.date}
                {isStale && (
                  <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                    not refreshed for today yet
                  </span>
                )}
              </p>
            </>
          ) : (
            <p className="mt-2 text-subtle">Nothing published yet.</p>
          )}
        </div>
        <button
          onClick={() => setPickerOpen((v) => !v)}
          className="shrink-0 rounded-md border border-line-strong px-3 py-1.5 text-sm text-foreground-soft hover:bg-surface-2"
        >
          {pickerOpen ? "Cancel" : "Override"}
        </button>
      </div>

      {pickerOpen && (
        <div className="mt-4 border-t border-line pt-4">
          <p className="mb-2 text-xs text-subtle">
            Hard-sets this as today&apos;s ({pacificToday()}) fortune immediately, replacing
            whatever&apos;s live. Marks it used so the nightly picker won&apos;t reuse it.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="flex-1 rounded-md border border-line-strong bg-surface-2 px-2 py-1.5 text-sm text-foreground"
            >
              <option value="">Select an approved fortune&hellip;</option>
              {candidates.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.used ? "[used] " : ""}
                  {f.text.slice(0, 70)}
                  {f.text.length > 70 ? "..." : ""}
                </option>
              ))}
            </select>
            <button
              onClick={handlePublish}
              disabled={!selectedId || publishing}
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-40"
            >
              {publishing ? "Publishing..." : "Publish now"}
            </button>
          </div>
          {candidates.length === 0 && (
            <p className="mt-2 text-sm text-subtle">
              No approved fortunes yet — approve one in Submissions first.
            </p>
          )}
          {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
        </div>
      )}
    </div>
  );
}
