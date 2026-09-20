"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";
import type { Feedback } from "./types";

// Fetches the whole feedback collection and keeps it live, newest first.
// Sorted client-side (rather than orderBy) so docs missing createdAt still show.
export function useFeedback() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return onSnapshot(
      collection(db, "feedback"),
      (snap) => {
        const items = snap.docs.map((d) => ({ ...(d.data() as Feedback), id: d.id }));
        items.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
        setFeedback(items);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );
  }, []);

  return { feedback, loading, error };
}
