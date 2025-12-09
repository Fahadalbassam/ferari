"use client";

import { signIn } from "next-auth/react";
import Image from "next/image";
import { FormEvent, useState } from "react";
import Link from "next/link";

const oauthButtons = [
  { provider: "google", label: "Sign in with Google" },
  { provider: "github", label: "Sign in with GitHub" },
];

export default function SignInPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    const res = await signIn("credentials", {
      redirect: false,
      identifier,
      password,
      callbackUrl: "/",
    });
    if (res?.error) {
      setError("Invalid credentials. Please try again.");
      setIsSubmitting(false);
      return;
    }
    window.location.href = "/";
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-10">
      <div className="w-full max-w-md rounded-xl border border-neutral-200 bg-white p-8 shadow-lg">
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-neutral-700 transition hover:text-neutral-900"
          >
            ← Back to home
          </Link>
        </div>
        <div className="mb-6 flex items-center gap-3">
          <Image
            src="/ferrari-logo-png_seeklogo-512505.png"
            alt="Ferrari logo"
            width={44}
            height={44}
            priority
          />
          <div>
            <h1 className="text-xl font-semibold text-neutral-900">Sign in</h1>
            <p className="text-sm text-neutral-600">Welcome back</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-neutral-800">Email</label>
            <input
              type="email"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="mt-1 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 shadow-inner focus:border-neutral-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-neutral-800">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 shadow-inner focus:border-neutral-400 focus:outline-none"
            />
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-60"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-neutral-400">
          <span className="h-px flex-1 bg-neutral-200" />
          Or
          <span className="h-px flex-1 bg-neutral-200" />
        </div>

        <div className="space-y-3">
          {oauthButtons.map((btn) => (
            <button
              key={btn.provider}
              onClick={() => signIn(btn.provider, { callbackUrl: "/" })}
              className="w-full rounded-md border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:border-neutral-300"
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}