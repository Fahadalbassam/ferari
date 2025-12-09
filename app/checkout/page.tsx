"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

function CheckoutInner() {
  const params = useSearchParams();
  const slug = params.get("slug");
  const mode = params.get("mode") === "rent" ? "rent" : "buy";

  const basePrice = useMemo(() => (mode === "rent" ? 5000 : 250000), [mode]);
  const fee = Math.round(basePrice * 0.02);
  const total = basePrice + fee;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  return (
    <main className="min-h-screen bg-white px-6 py-10 text-neutral-900">
      <div className="mx-auto flex w/full max-w-3xl flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold">Checkout</h1>
          <p className="text-sm text-neutral-600">{slug ? `Completing ${mode} for: ${slug}` : "Complete your order"}</p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium text-neutral-800">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-neutral-400 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-neutral-800">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-neutral-400 focus:outline-none"
              />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <label className="text-sm font-medium text-neutral-800">Address</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-neutral-400 focus:outline-none"
              rows={3}
            />
          </div>
          <div className="mt-4 space-y-1">
            <label className="text-sm font-medium text-neutral-800">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-neutral-400 focus:outline-none"
              rows={3}
            />
          </div>

          <div className="mt-6 rounded-lg border border-neutral-200 bg-white p-4 text-sm text-neutral-800">
            <div className="flex items-center justify-between">
              <span>Base price</span>
              <span>{basePrice.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Fee (2%)</span>
              <span>{fee.toLocaleString()}</span>
            </div>
            <div className="mt-2 border-t border-neutral-200 pt-2 flex items-center justify-between font-semibold">
              <span>Total</span>
              <span>{total.toLocaleString()}</span>
            </div>
          </div>

          <button className="mt-6 w-full rounded-md bg-neutral-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800">
            Place order
          </button>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="p-6 text-neutral-700">Loading checkout...</div>}>
      <CheckoutInner />
    </Suspense>
  );
}

