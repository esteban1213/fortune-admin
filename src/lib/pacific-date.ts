// Matches FORTUNE_TIME_ZONE / todayDateString() in functions/src/index.ts —
// "today" for the fortune app is always Pacific time, not the admin's local time.
export function pacificToday(): string {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Los_Angeles",
  });
}
