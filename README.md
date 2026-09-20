# Fortune Admin

Admin dashboard for the [Daily Fortune](../fortune) app: view fortune stats, moderate
submissions, and schedule which fortune goes out on a given day.

## Getting Started

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with the admin email
(`NEXT_PUBLIC_ADMIN_EMAIL` in `.env.local`) using the same OTP flow the mobile app uses
— it calls the same `requestOtp`/`verifyOtp` Cloud Functions.

## How it's wired up

- **Auth**: Firebase client SDK, signed in via the fortune app's existing OTP Cloud
  Functions. No separate backend.
- **Data**: reads/writes the `fortunes` collection directly with the Firestore client
  SDK. Access is restricted in `../fortune/firestore.rules` to the single admin email
  above (`isAdmin()`) — everyone else keeps create-only access, matching the mobile app.
- **Pages**:
  - `/` — overview stats (total, used, pending, approved, denied, scheduled)
  - `/submissions` — approve/deny queue; approving sets category, points, nsfw, and an
    optional release date
  - `/fortunes` — browse approved/used/denied fortunes and schedule a `releaseDate` for
    any approved-but-unused one

## Known gaps

- No "views" metric — there's no view-tracking anywhere in the app or backend yet, so
  it's intentionally left out. Add instrumentation in the Expo app first if you want it.
- Admin is a single hardcoded email in the Firestore rules, not a role system. Fine for
  one person; revisit if more admins are added.
# fortune-admin
