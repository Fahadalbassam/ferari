"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";

export default function TestDrivePage() {
  const { data: session } = useSession();
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");

  if (!session?.user) {
    return (
      <main className="min-h-screen bg-white px-6 py-10 text-neutral-900">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
          <h1 className="text-2xl font-semibold">Test Drive</h1>
          <p className="text-sm text-neutral-600">Please sign in to request a test drive.</p>
          <Link
            href="/auth/signin"
            className="w-fit rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800"
          >
            Sign in
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-6 py-10 text-neutral-900">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold">Book a Test Drive</h1>
          <p className="text-sm text-neutral-600">We’ll follow up to confirm availability.</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-6">
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm font-medium text-neutral-800">Preferred date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-neutral-400 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-neutral-800">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-neutral-400 focus:outline-none"
                rows={3}
              />
            </div>
            <button className="w-full rounded-md bg-neutral-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800">
              Submit request
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}


