"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "./firebase";
import type { Fortune } from "./types";

// Fetches the whole fortunes collection and keeps it live. Fine at this
// project's scale (a few hundred fortunes at most); revisit with
// pagination/queries if the collection grows into the thousands.
export function useFortunes() {
  const [fortunes, setFortunes] = useState<Fortune[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "fortunes"), orderBy("year", "desc"));
    return onSnapshot(
      q,
      (snap) => {
        setFortunes(snap.docs.map((d) => ({ ...(d.data() as Fortune), id: d.id })));
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );
  }, []);

  return { fortunes, loading, error };
}
