import { doc, runTransaction } from "firebase/firestore";
import { db } from "./firebase";
import { pacificToday } from "./pacific-date";
import type { Fortune } from "./types";

// Hard-sets a fortune as today's fortune, overriding whatever
// selectDailyFortune already published. Mirrors that Cloud Function's own
// transaction (functions/src/index.ts) so history/used-state stay consistent
// whichever path publishes a fortune.
export async function publishAsTodaysFortune(fortune: Fortune) {
  const today = pacificToday();
  const fortuneRef = doc(db, "fortunes", fortune.id);
  const currentRef = doc(db, "todaysFortune", "current");
  const historyRef = doc(db, "todaysFortuneHistory", today);

  await runTransaction(db, async (tx) => {
    tx.update(fortuneRef, {
      used: true,
      usedDate: today,
      releaseDate: fortune.releaseDate ?? today,
    });

    const published = {
      fortuneId: fortune.id,
      text: fortune.text,
      category: fortune.category,
      points: fortune.points,
      date: today,
    };
    tx.set(currentRef, published);
    tx.set(historyRef, published);
  });
}
