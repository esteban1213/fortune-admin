// Server-side admin check. ADMIN_EMAIL is a private env var (no NEXT_PUBLIC_
// prefix), so it never ships to the browser — clients only learn yes/no.
// The ID token is verified by Firebase's Identity Toolkit, which returns the
// account's email only if the token is valid.
export async function POST(request: Request) {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const { idToken } = (await request.json().catch(() => ({}))) as { idToken?: string };

  if (!adminEmail || !apiKey || !idToken) return Response.json({ isAdmin: false });

  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    },
  );
  if (!res.ok) return Response.json({ isAdmin: false });

  const data = (await res.json()) as { users?: { email?: string; emailVerified?: boolean }[] };
  const email = data.users?.[0]?.email?.toLowerCase();
  return Response.json({ isAdmin: !!email && email === adminEmail });
}
