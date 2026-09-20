export interface User {
  uid: string;
  email: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  emailMarketingOptIn: boolean;
  score: number;
  // "YYYY-MM-DD"; semantics (when a day counts, timezone) get wired up
  // alongside whatever actually increments this later.
  streak: { count: number; lastActiveDate: string | null };
  fortunesDiscovered: string[];
}

export interface TodaysFortune {
  fortuneId: string;
  text: string;
  category: string;
  points: number;
  date: string; // "YYYY-MM-DD", Pacific time — the source of truth for "today"
  // Author's display name, copied over when the fortune is published (user
  // docs are owner-readable only). Absent/null: no signature on the paper.
  creatorName?: string | null;
  upvotes: number;
  downvotes: number;
}

export type Vote = "up" | "down" | null;

export interface CollectedFortune {
  fortuneId: string;
  text: string;
  category: string;
  points: number;
  date: string;
}

export interface Fortune {
  id: string; // unique identifier
  text: string; // the actual fortune
  category: string;
  releaseDate: null | string; // if it should release on a specific date
  nsfw: boolean; // yes or no
  creatorId: string; // who made this fortune
  submissionStatus: "submitted" | "approved" | "denied";
  year: number; // what year it should be released at random
  used: boolean; // has this cookie been used? Yes or no
  usedDate: string; // When this fortune was used
  points: number; // how many points it's worth
  downvotes: number;
  upvotes: number;
  // Client-set ms timestamp, absent on fortunes submitted before this field
  // existed. Used only to sort "my submissions" newest-first.
  createdAt?: number;
}

export type FeedbackKind = "feature" | "feedback";

export interface Feedback {
  id: string;
  kind: FeedbackKind;
  message: string;
  // Null when the sender wasn't signed in.
  userId: string | null;
  email: string | null;
  createdAt: number; // ms timestamp
}
