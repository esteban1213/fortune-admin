"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useFortunes } from "@/lib/use-fortunes";
import { FortuneEditor } from "@/components/fortune-editor";
import type { Fortune } from "@/lib/types";

type Tab = "pending" | "scheduled" | "unscheduled" | "used" | "denied";

const TABS: { key: Tab; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "scheduled", label: "Scheduled" },
  { key: "unscheduled", label: "Approved (unscheduled)" },
  { key: "used", label: "Used" },
  { key: "denied", label: "Denied" },
];

function ScheduleRow({ fortune }: { fortune: Fortune }) {
  const [releaseDate, setReleaseDate] = useState(fortune.releaseDate ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const dirty = (fortune.releaseDate ?? "") !== releaseDate;

  async function save() {
    setSaving(true);
    setError(null);
    try {
      await updateDoc(doc(db, "fortunes", fortune.id), { releaseDate: releaseDate || null });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="break-words text-foreground sm:truncate">{fortune.text}</p>
          <p className="mt-1 text-xs text-subtle">
            {fortune.submissionStatus} &middot; {fortune.category} &middot; {fortune.points} pts
            {fortune.usedDate && <> &middot; used {fortune.usedDate}</>}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {fortune.submissionStatus === "approved" && !fortune.used && (
            <>
              <input
                type="date"
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
                className="rounded-md border border-line-strong bg-surface-2 px-2 py-1.5 text-sm text-foreground"
              />
              <button
                onClick={save}
                disabled={!dirty || saving}
                className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-40"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </>
          )}
          <button
            onClick={() => setEditing((v) => !v)}
            className="rounded-md border border-line-strong px-3 py-1.5 text-sm text-foreground-soft hover:bg-surface-2"
          >
            {editing ? "Close" : "Edit"}
          </button>
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
      {editing && <FortuneEditor fortune={fortune} onDone={() => setEditing(false)} />}
    </div>
  );
}

export default function FortunesPage() {
  const { fortunes, loading, error } = useFortunes();
  const [tab, setTab] = useState<Tab>("pending");

  const filtered = useMemo(() => {
    switch (tab) {
      case "pending":
        return fortunes.filter((f) => f.submissionStatus === "submitted");
      case "scheduled":
        return fortunes.filter(
          (f) => f.submissionStatus === "approved" && !f.used && f.releaseDate,
        );
      case "unscheduled":
        return fortunes.filter(
          (f) => f.submissionStatus === "approved" && !f.used && !f.releaseDate,
        );
      case "used":
        return fortunes.filter((f) => f.used);
      case "denied":
        return fortunes.filter((f) => f.submissionStatus === "denied");
    }
  }, [fortunes, tab]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="mb-1 text-2xl font-semibold text-foreground">Fortunes & Scheduling</h1>
          <p className="text-sm text-muted">
            Every fortune lives here, no matter who submitted it or its status — click Edit
            on any row to change text, category, points, status, or scheduling.
          </p>
        </div>
        <Link
          href="/fortunes/new"
          className="shrink-0 self-start rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover sm:py-1.5"
        >
          New fortune
        </Link>
      </div>

      <div className="-mx-4 mb-6 flex gap-1 overflow-x-auto border-b border-line px-4 md:mx-0 md:px-0">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`shrink-0 whitespace-nowrap px-3 py-2.5 text-sm md:py-2 ${
              tab === t.key
                ? "border-b-2 border-foreground text-foreground"
                : "text-subtle hover:text-foreground-soft"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <p className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-subtle">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-subtle">Nothing here.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((f) => (
            <ScheduleRow key={f.id} fortune={f} />
          ))}
        </div>
      )}
    </div>
  );
}
