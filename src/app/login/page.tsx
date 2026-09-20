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
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-4">
      <div className="w-full max-w-sm rounded-xl border border-neutral-800 bg-neutral-900 p-8">
        <h1 className="mb-1 text-xl font-semibold text-neutral-100">
          Fortune Admin
        </h1>
        <p className="mb-6 text-sm text-neutral-400">
          Sign in with the same account you use in the Daily Fortune app.
        </p>

        {step === "email" ? (
          <form
            onSubmit={handleRequestCode}
            className="space-y-4"
          >
            <div>
              <label
                className="mb-1 block text-sm text-neutral-300"
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
                className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-100 outline-none focus:border-neutral-500"
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-md bg-neutral-100 px-3 py-2 text-sm font-medium text-neutral-900 hover:bg-white disabled:opacity-50"
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
                className="mb-1 block text-sm text-neutral-300"
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
                className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 tracking-widest text-neutral-100 outline-none focus:border-neutral-500"
              />
              <p className="mt-1 text-xs text-neutral-500">Sent to {email}</p>
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-md bg-neutral-100 px-3 py-2 text-sm font-medium text-neutral-900 hover:bg-white disabled:opacity-50"
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
              className="w-full text-center text-xs text-neutral-500 hover:text-neutral-300"
            >
              Use a different email
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
