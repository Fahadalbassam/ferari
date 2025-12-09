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
  const [mode, setMode] = useState<"signin" | "reset">("signin");
  const [resetStage, setResetStage] = useState<"request" | "verify">("request");
  const [resetEmail, setResetEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);

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

  const handleSendOtp = async () => {
    setResetError(null);
    setResetMessage(null);
    if (!resetEmail) {
      setResetError("Enter your email to receive an OTP.");
      return;
    }
    setResetLoading(true);
    const res = await fetch("/api/auth/password-reset/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: resetEmail }),
    });
    setResetLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setResetError(data.error || "Failed to send OTP.");
      return;
    }
    setResetStage("verify");
    setResetMessage("OTP sent. Check your email (or server logs in dev).");
  };

  const handleConfirmReset = async () => {
    setResetError(null);
    setResetMessage(null);
    if (!resetEmail || !otp || !newPassword || !confirmPassword) {
      setResetError("Fill all fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError("Passwords do not match.");
      return;
    }
    setResetLoading(true);
    const res = await fetch("/api/auth/password-reset/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: resetEmail, otp, newPassword }),
    });
    setResetLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setResetError(data.error || "Failed to reset password.");
      return;
    }
    setResetMessage("Password updated. Logging you in...");
    const loginRes = await signIn("credentials", {
      redirect: false,
      identifier: resetEmail,
      password: newPassword,
      callbackUrl: "/",
    });
    if (loginRes?.error) {
      setResetError("Password changed, but login failed. Please sign in manually.");
      setMode("signin");
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
            <h1 className="text-xl font-semibold text-neutral-900">
              {mode === "signin" ? "Sign in" : "Password reset"}
            </h1>
            <p className="text-sm text-neutral-600">
              {mode === "signin" ? "Welcome back" : "Reset your password with OTP"}
            </p>
          </div>
        </div>

        {mode === "signin" && (
          <>
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

            <div className="mt-3 text-right">
              <button
                type="button"
                onClick={() => {
                  setMode("reset");
                  setResetStage("request");
                  setResetError(null);
                  setResetMessage(null);
                  setOtp("");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                className="text-sm font-medium text-neutral-700 underline-offset-4 hover:underline"
              >
                Forgot password?
              </button>
            </div>
          </>
        )}

        {mode === "reset" && (
          <div className="space-y-4">
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setResetStage("request");
                  setResetError(null);
                  setResetMessage(null);
                  setOtp("");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                className="text-sm font-medium text-neutral-700 underline-offset-4 hover:underline"
              >
                ← Back to sign in
              </button>
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-800">Email</label>
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="mt-1 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 shadow-inner focus:border-neutral-400 focus:outline-none"
              />
            </div>

            {resetStage === "verify" && (
              <>
                <div>
                  <label className="text-sm font-medium text-neutral-800">OTP</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="mt-1 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 shadow-inner focus:border-neutral-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-800">New password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="mt-1 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 shadow-inner focus:border-neutral-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-800">Confirm password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 shadow-inner focus:border-neutral-400 focus:outline-none"
                  />
                </div>
              </>
            )}

            {resetError && <div className="text-sm text-red-600">{resetError}</div>}
            {resetMessage && <div className="text-sm text-green-600">{resetMessage}</div>}

            <div className="flex items-center gap-3">
              {resetStage === "request" ? (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={resetLoading}
                  className="w-full rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-60"
                >
                  {resetLoading ? "Sending..." : "Send OTP"}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleConfirmReset}
                    disabled={resetLoading}
                    className="w-full rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-60"
                  >
                    {resetLoading ? "Updating..." : "Update & sign in"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setResetStage("request");
                      setOtp("");
                      setNewPassword("");
                      setConfirmPassword("");
                      setResetMessage(null);
                      setResetError(null);
                    }}
                    className="rounded-md border border-neutral-200 px-3 py-2 text-sm font-semibold text-neutral-800 transition hover:border-neutral-300"
                  >
                    Resend
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {mode === "signin" && (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}