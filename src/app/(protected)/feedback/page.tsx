"use client";

import { useState } from "react";
import { useFeedback } from "@/lib/use-feedback";
import type { Feedback, FeedbackKind } from "@/lib/types";

type Filter = "all" | FeedbackKind;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "feature", label: "Feature requests" },
  { value: "feedback", label: "Feedback" },
];

const KIND_STYLES: Record<FeedbackKind, string> = {
  feature: "bg-violet-950 text-violet-300",
  feedback: "bg-sky-950 text-sky-300",
};

const KIND_LABELS: Record<FeedbackKind, string> = {
  feature: "Feature request",
  feedback: "Feedback",
};

function FeedbackCard({ item }: { item: Feedback }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            KIND_STYLES[item.kind] ?? "bg-neutral-800 text-neutral-300"
          }`}
        >
          {KIND_LABELS[item.kind] ?? item.kind}
        </span>
        {item.createdAt && (
          <time className="text-xs text-neutral-500">
            {new Date(item.createdAt).toLocaleString()}
          </time>
        )}
      </div>
      <p className="whitespace-pre-wrap break-words text-neutral-100">{item.message}</p>
      <p className="mt-3 break-all text-xs text-neutral-500">
        {item.email ?? item.userId ?? "Anonymous"}
      </p>
    </div>
  );
}

export default function FeedbackPage() {
  const { feedback, loading, error } = useFeedback();
  const [filter, setFilter] = useState<Filter>("all");

  const visible = filter === "all" ? feedback : feedback.filter((f) => f.kind === filter);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-neutral-100">Feedback</h1>
      <p className="mb-6 text-sm text-neutral-400">
        Feature requests and feedback sent from the app, newest first.
      </p>

      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const count =
            f.value === "all"
              ? feedback.length
              : feedback.filter((i) => i.kind === f.value).length;
          const active = filter === f.value;
          return (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`rounded-md px-3 py-1.5 text-sm ${
                active
                  ? "bg-neutral-800 text-neutral-100"
                  : "text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200"
              }`}
            >
              {f.label} <span className="text-neutral-500">{count}</span>
            </button>
          );
        })}
      </div>

      {error && (
        <p className="mb-6 rounded-md border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-neutral-500">Loading...</p>
      ) : visible.length === 0 ? (
        <p className="text-neutral-500">No feedback yet.</p>
      ) : (
        <div className="space-y-4">
          {visible.map((item) => (
            <FeedbackCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
