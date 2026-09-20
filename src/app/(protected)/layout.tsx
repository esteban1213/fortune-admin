"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";

const NAV_ITEMS = [
  { href: "/", label: "Overview" },
  { href: "/submissions", label: "Submissions" },
  { href: "/fortunes", label: "Fortunes & Scheduling" },
  { href: "/feedback", label: "Feedback" },
];

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-neutral-400">
        Loading...
      </div>
    );
  }

  if (!user) return null; // redirecting to /login

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-lg font-semibold text-neutral-100">Not authorized</h1>
        <p className="max-w-sm text-sm text-neutral-400">
          Signed in as {user.email}, which isn&apos;t the admin account for this dashboard.
        </p>
        <button
          onClick={() => signOut()}
          className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm text-neutral-300 hover:bg-neutral-800"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-56 shrink-0 flex-col border-r border-neutral-800 bg-neutral-950 p-4">
        <div className="mb-6 px-2">
          <p className="text-sm font-semibold text-neutral-100">Fortune Admin</p>
          <p className="truncate text-xs text-neutral-500">{user.email}</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-2 text-sm ${
                  active
                    ? "bg-neutral-800 text-neutral-100"
                    : "text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={() => signOut()}
          className="rounded-md px-3 py-2 text-left text-sm text-neutral-500 hover:bg-neutral-900 hover:text-neutral-300"
        >
          Sign out
        </button>
      </aside>
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
