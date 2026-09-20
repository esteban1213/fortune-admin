"use client";

import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Fortune } from "@/lib/types";

const CATEGORIES = ["general", "love", "career", "luck", "wisdom", "humor"];
const STATUSES: Fortune["submissionStatus"][] = ["submitted", "approved", "denied"];

// Full edit form for a single fortune — every field, regardless of who
// submitted it or its current status. Firestore rules already grant the
// admin account unrestricted read/update/delete on the fortunes collection
// (no creatorId check), so this works the same for any fortune.
export function FortuneEditor({
  fortune,
  onDone,
}: {
  fortune: Fortune;
  onDone?: () => void;
}) {
  const [text, setText] = useState(fortune.text);
  const [category, setCategory] = useState(fortune.category);
  const [points, setPoints] = useState(fortune.points);
  const [nsfw, setNsfw] = useState(fortune.nsfw);
  const [year, setYear] = useState(fortune.year);
  const [releaseDate, setReleaseDate] = useState(fortune.releaseDate ?? "");
  const [submissionStatus, setSubmissionStatus] = useState(fortune.submissionStatus);
  const [used, setUsed] = useState(fortune.used);
  const [usedDate, setUsedDate] = useState(fortune.usedDate);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    const trimmed = text.trim();
    if (!trimmed) {
      setError("Fortune text can't be empty.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await updateDoc(doc(db, "fortunes", fortune.id), {
        text: trimmed,
        category,
        points,
        nsfw,
        year,
        releaseDate: releaseDate || null,
        submissionStatus,
        used,
        usedDate: used ? usedDate : "",
      });
      onDone?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save changes.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-3 space-y-3 border-t border-neutral-800 pt-3">
      <div>
        <label className="mb-1 block text-xs text-neutral-400">Text</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          maxLength={500}
          className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-2 py-1.5 text-sm text-neutral-100"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
          <label className="mb-1 block text-xs text-neutral-400">Year</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-2 py-1.5 text-sm text-neutral-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-neutral-400">Status</label>
          <select
            value={submissionStatus}
            onChange={(e) =>
              setSubmissionStatus(e.target.value as Fortune["submissionStatus"])
            }
            className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-2 py-1.5 text-sm text-neutral-100"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <label className="mb-1 block text-xs text-neutral-400">Release date</label>
          <input
            type="date"
            value={releaseDate}
            onChange={(e) => setReleaseDate(e.target.value)}
            className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-2 py-1.5 text-sm text-neutral-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-neutral-400">Used date</label>
          <input
            type="date"
            value={usedDate}
            disabled={!used}
            onChange={(e) => setUsedDate(e.target.value)}
            className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-2 py-1.5 text-sm text-neutral-100 disabled:opacity-40"
          />
        </div>
        <div className="flex items-end gap-2">
          <label className="flex items-center gap-2 text-sm text-neutral-300">
            <input
              type="checkbox"
              checked={used}
              onChange={(e) => setUsed(e.target.checked)}
              className="h-4 w-4 rounded border-neutral-700 bg-neutral-800"
            />
            Used
          </label>
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

      <p className="text-xs text-neutral-500">
        Submitted by {fortune.creatorId}
      </p>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-md bg-neutral-100 px-3 py-1.5 text-sm font-medium text-neutral-900 hover:bg-white disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
        <button
          onClick={() => onDone?.()}
          className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm text-neutral-300 hover:bg-neutral-800"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
