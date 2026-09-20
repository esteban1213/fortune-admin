"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";

const NAV_ITEMS = [
  { href: "/", label: "Overview" },
  { href: "/submissions", label: "Submissions" },
  { href: "/fortunes", label: "Fortunes & Scheduling" },
  { href: "/feedback", label: "Feedback" },
];

function SidebarContent({
  email,
  pathname,
  onNavigate,
  onSignOut,
}: {
  email: string | null;
  pathname: string;
  onNavigate?: () => void;
  onSignOut: () => void;
}) {
  return (
    <>
      <div className="mb-6 px-2">
        <p className="text-sm font-semibold text-foreground">Fortune Admin</p>
        <p className="truncate text-xs text-subtle">{email}</p>
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`rounded-md px-3 py-2.5 text-sm md:py-2 ${
                active
                  ? "bg-surface-2 text-foreground"
                  : "text-muted hover:bg-surface hover:text-foreground"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <button
        onClick={onSignOut}
        className="rounded-md px-3 py-2.5 text-left text-sm text-subtle hover:bg-surface hover:text-foreground-soft md:py-2"
      >
        Sign out
      </button>
    </>
  );
}

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted">
        Loading...
      </div>
    );
  }

  if (!user) return null; // redirecting to /login

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-lg font-semibold text-foreground">Not authorized</h1>
        <p className="max-w-sm text-sm text-muted">
          Signed in as {user.email}, which isn&apos;t the admin account for this dashboard.
        </p>
        <button
          onClick={() => signOut()}
          className="rounded-md border border-line-strong px-3 py-1.5 text-sm text-foreground-soft hover:bg-surface-2"
        >
          Sign out
        </button>
      </div>
    );
  }

  const currentLabel = NAV_ITEMS.find((item) => item.href === pathname)?.label ?? "Fortune Admin";

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-background px-4 py-3 md:hidden">
        <button
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          aria-expanded={menuOpen}
          className="-ml-2 flex h-10 w-10 items-center justify-center rounded-md text-foreground-soft hover:bg-surface"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
            <path d="M3 5h14M3 10h14M3 15h14" />
          </svg>
        </button>
        <p className="truncate text-sm font-semibold text-foreground">{currentLabel}</p>
      </header>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute inset-y-0 left-0 flex w-64 max-w-[80vw] flex-col border-r border-line bg-background p-4">
            <SidebarContent
              email={user.email}
              pathname={pathname}
              onNavigate={() => setMenuOpen(false)}
              onSignOut={() => signOut()}
            />
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-line bg-background p-4 md:flex">
        <SidebarContent email={user.email} pathname={pathname} onSignOut={() => signOut()} />
      </aside>

      <main className="min-w-0 flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
    </div>
  );
}
