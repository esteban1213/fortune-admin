"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signInWithCustomToken } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { auth, requestOtpCallable, verifyOtpCallable } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleRequestCode(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await requestOtpCallable({ email: email.trim() });
      setStep("code");
    } catch (err) {
      setError(
        err instanceof FirebaseError ? err.message : "Couldn't send the code.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleVerifyCode(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const result = await verifyOtpCallable({
        email: email.trim(),
        code: code.trim(),
      });
      await signInWithCustomToken(auth, result.data.token);
      router.push("/");
    } catch (err) {
      setError(
        err instanceof FirebaseError
          ? err.message
          : "Couldn't verify the code.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-xl border border-line bg-surface p-6 sm:p-8">
        <h1 className="mb-1 text-xl font-semibold text-foreground">
          Fortune Admin
        </h1>
        <p className="mb-6 text-sm text-muted">
          Sign in with the same account you use in the Daily Fortune app.
        </p>

        {step === "email" ? (
          <form
            onSubmit={handleRequestCode}
            className="space-y-4"
          >
            <div>
              <label
                className="mb-1 block text-sm text-foreground-soft"
                htmlFor="email"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-line-strong bg-surface-2 px-3 py-2 text-foreground outline-none focus:border-subtle"
              />
            </div>
            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
            >
              {busy ? "Sending..." : "Send code"}
            </button>
          </form>
        ) : (
          <form
            onSubmit={handleVerifyCode}
            className="space-y-4"
          >
            <div>
              <label
                className="mb-1 block text-sm text-foreground-soft"
                htmlFor="code"
              >
                6-digit code
              </label>
              <input
                id="code"
                type="text"
                inputMode="numeric"
                required
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
                className="w-full rounded-md border border-line-strong bg-surface-2 px-3 py-2 tracking-widest text-foreground outline-none focus:border-subtle"
              />
              <p className="mt-1 text-xs text-subtle">Sent to {email}</p>
            </div>
            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
            >
              {busy ? "Verifying..." : "Sign in"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("email");
                setCode("");
                setError(null);
              }}
              className="w-full text-center text-xs text-subtle hover:text-foreground-soft"
            >
              Use a different email
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
