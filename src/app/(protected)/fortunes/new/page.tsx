"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";

const CATEGORIES = ["general", "love", "career", "luck", "wisdom", "humor"];

export default function NewFortunePage() {
  const router = useRouter();
  const { user } = useAuth();

  const [text, setText] = useState("");
  const [category, setCategory] = useState("general");
  const [points, setPoints] = useState(10);
  const [nsfw, setNsfw] = useState(false);
  const [releaseDate, setReleaseDate] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) {
      setError("Enter the fortune text first.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const ref = doc(collection(db, "fortunes"));
      await setDoc(ref, {
        id: ref.id,
        text: trimmed,
        category,
        releaseDate: releaseDate || null,
        nsfw,
        creatorId: user?.uid ?? "admin",
        submissionStatus: "approved",
        year,
        used: false,
        usedDate: "",
        points,
      });
      router.push("/fortunes");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create that fortune.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-xl">
      <Link href="/fortunes" className="mb-4 inline-block text-sm text-subtle hover:text-foreground-soft">
        &larr; Back to fortunes
      </Link>
      <h1 className="mb-1 text-2xl font-semibold text-foreground">New fortune</h1>
      <p className="mb-8 text-sm text-muted">
        Created fortunes are auto-approved and enter the pool immediately (or on the
        release date you pick).
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm text-foreground-soft" htmlFor="text">
            Fortune text
          </label>
          <textarea
            id="text"
            required
            maxLength={500}
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Good things come to those who..."
            className="w-full rounded-md border border-line-strong bg-surface-2 px-3 py-2 text-foreground outline-none focus:border-subtle"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs text-muted">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-md border border-line-strong bg-surface-2 px-2 py-1.5 text-sm text-foreground"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted">Points</label>
            <input
              type="number"
              min={0}
              value={points}
              onChange={(e) => setPoints(Number(e.target.value))}
              className="w-full rounded-md border border-line-strong bg-surface-2 px-2 py-1.5 text-sm text-foreground"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted">Year</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full rounded-md border border-line-strong bg-surface-2 px-2 py-1.5 text-sm text-foreground"
            />
          </div>
          <div className="flex items-end gap-2">
            <label className="flex items-center gap-2 text-sm text-foreground-soft">
              <input
                type="checkbox"
                checked={nsfw}
                onChange={(e) => setNsfw(e.target.checked)}
                className="h-4 w-4 rounded border-line-strong bg-surface-2"
              />
              NSFW
            </label>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs text-muted">
            Release date (optional — leave blank to join the random pool)
          </label>
          <input
            type="date"
            value={releaseDate}
            onChange={(e) => setReleaseDate(e.target.value)}
            className="w-full rounded-md border border-line-strong bg-surface-2 px-2 py-1.5 text-sm text-foreground sm:w-auto"
          />
        </div>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
        >
          {submitting ? "Creating..." : "Create fortune"}
        </button>
      </form>
    </div>
  );
}
