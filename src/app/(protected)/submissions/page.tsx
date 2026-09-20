"use client";

import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useFortunes } from "@/lib/use-fortunes";
import type { Fortune } from "@/lib/types";

const CATEGORIES = ["general", "love", "career", "luck", "wisdom", "humor"];

function SubmissionCard({ fortune }: { fortune: Fortune }) {
  const [text, setText] = useState(fortune.text);
  const [category, setCategory] = useState(fortune.category || "general");
  const [points, setPoints] = useState(10);
  const [nsfw, setNsfw] = useState(fortune.nsfw);
  const [releaseDate, setReleaseDate] = useState("");
  const [busy, setBusy] = useState<"save" | "approve" | "deny" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    const trimmed = text.trim();
    if (!trimmed) {
      setError("Fortune text can't be empty.");
      return;
    }
    setBusy("save");
    setError(null);
    try {
      await updateDoc(doc(db, "fortunes", fortune.id), {
        text: trimmed,
        category,
        points,
        nsfw,
        releaseDate: releaseDate || null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save changes.");
    } finally {
      setBusy(null);
    }
  }

  async function approve() {
    const trimmed = text.trim();
    if (!trimmed) {
      setError("Fortune text can't be empty.");
      return;
    }
    setBusy("approve");
    setError(null);
    try {
      await updateDoc(doc(db, "fortunes", fortune.id), {
        submissionStatus: "approved",
        text: trimmed,
        category,
        points,
        nsfw,
        releaseDate: releaseDate || null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't approve this fortune.");
    } finally {
      setBusy(null);
    }
  }

  async function deny() {
    setBusy("deny");
    setError(null);
    try {
      await updateDoc(doc(db, "fortunes", fortune.id), { submissionStatus: "denied" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't deny this fortune.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 sm:p-5">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={2}
        maxLength={500}
        className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-2 py-1.5 text-neutral-100"
      />
      <p className="mt-1 break-all text-xs text-neutral-500">
        {fortune.year} &middot; from {fortune.creatorId}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <label className="mb-1 block text-xs text-neutral-400">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-2 py-1.5 text-sm text-neutral-100"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-neutral-400">Points</label>
          <input
            type="number"
            min={0}
            value={points}
            onChange={(e) => setPoints(Number(e.target.value))}
            className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-2 py-1.5 text-sm text-neutral-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-neutral-400">Release date (optional)</label>
          <input
            type="date"
            value={releaseDate}
            onChange={(e) => setReleaseDate(e.target.value)}
            className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-2 py-1.5 text-sm text-neutral-100"
          />
        </div>
        <div className="flex items-end gap-2">
          <label className="flex items-center gap-2 text-sm text-neutral-300">
            <input
              type="checkbox"
              checked={nsfw}
              onChange={(e) => setNsfw(e.target.checked)}
              className="h-4 w-4 rounded border-neutral-700 bg-neutral-800"
            />
            NSFW
          </label>
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={approve}
          disabled={busy !== null}
          className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
        >
          {busy === "approve" ? "Approving..." : "Approve"}
        </button>
        <button
          onClick={deny}
          disabled={busy !== null}
          className="rounded-md bg-red-900 px-3 py-1.5 text-sm font-medium text-red-100 hover:bg-red-800 disabled:opacity-50"
        >
          {busy === "deny" ? "Denying..." : "Deny"}
        </button>
        <button
          onClick={save}
          disabled={busy !== null}
          className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm text-neutral-300 hover:bg-neutral-800 disabled:opacity-40"
        >
          {busy === "save" ? "Saving..." : "Save changes"}
        </button>
      </div>
    </div>
  );
}

export default function SubmissionsPage() {
  const { fortunes, loading, error } = useFortunes();
  const pending = fortunes.filter((f) => f.submissionStatus === "submitted");

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-neutral-100">Submissions</h1>
      <p className="mb-8 text-sm text-neutral-400">
        Review user-submitted fortunes. Approving sets the points and category that get
        used once it&apos;s published.
      </p>

      {error && (
        <p className="mb-6 rounded-md border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-neutral-500">Loading...</p>
      ) : pending.length === 0 ? (
        <p className="text-neutral-500">No pending submissions.</p>
      ) : (
        <div className="space-y-4">
          {pending.map((f) => (
            <SubmissionCard key={f.id} fortune={f} />
          ))}
        </div>
      )}
    </div>
  );
}
