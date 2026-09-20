"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

export interface TodaysFortune {
  fortuneId: string;
  text: string;
  category: string;
  points: number;
  date: string;
}

export function useTodaysFortune() {
  const [todaysFortune, setTodaysFortune] = useState<TodaysFortune | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onSnapshot(doc(db, "todaysFortune", "current"), (snap) => {
      setTodaysFortune(snap.exists() ? (snap.data() as TodaysFortune) : null);
      setLoading(false);
    });
  }, []);

  return { todaysFortune, loading };
}
