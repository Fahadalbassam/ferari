"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Car = {
  _id: string;
  slug: string;
  model: string;
  price: number;
  currency: string;
  type: "buy" | "rent" | "both";
  inventory?: number;
};

function CheckoutInner() {
  const params = useSearchParams();
  const slug = params.get("slug");
  const mode = params.get("mode") === "rent" ? "rent" : "buy";
  const prefillEmail = params.get("prefillEmail") || "";
  const prefillName = params.get("prefillName") || "";
  const prefillAddress = params.get("prefillAddress") || "";
  const router = useRouter();

  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (prefillEmail) setEmail(prefillEmail);
    if (prefillName) setName(prefillName);
    if (prefillAddress) setAddress(prefillAddress);
  }, [prefillAddress, prefillEmail, prefillName]);

  useEffect(() => {
    const load = async () => {
      if (!slug) {
        setLoading(false);
        setError("Missing car slug");
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/cars/${slug}`, { next: { revalidate: 0 } });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setCar(data.car || null);
      } catch (err) {
        setError("Failed to load car.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  const basePrice = useMemo(() => car?.price ?? 0, [car]);
  const fee = useMemo(() => Math.round(basePrice * 0.02), [basePrice]);
  const total = basePrice + fee;
  const hasInventory = (car?.inventory ?? 0) > 0;

  const handleSubmit = async () => {
    if (!car) return;
    if (!name || !email || !address) {
      setError("Name, email, and address are required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carId: car._id,
          buyerEmail: email,
          buyerName: name,
          address,
          notes,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Order failed");
      }
      const data = await res.json();
      router.push(`/thank-you?order=${encodeURIComponent(data.order?.orderNumber || "")}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-white px-6 py-10 text-neutral-900">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold">Checkout</h1>
          <p className="text-sm text-neutral-600">
            {car ? `Completing ${mode} for: ${car.model}` : slug ? `Loading ${slug}...` : "Complete your order"}
          </p>
        </div>

        {loading ? (
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-6 text-sm text-neutral-700">Loading...</div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}</div>
        ) : !car ? (
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-6 text-sm text-neutral-700">Car not found</div>
        ) : (
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-6 shadow-sm">
            <div className="mb-3 text-sm text-neutral-700">
              {car.currency} {car.price.toLocaleString()} · {hasInventory ? `In stock: ${car.inventory ?? 0}` : "Out of stock"}
            </div>
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

            <button
              disabled={submitting || !hasInventory}
              onClick={handleSubmit}
              className="mt-6 w-full rounded-md bg-neutral-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-60"
            >
              {submitting ? "Placing..." : hasInventory ? "Place order" : "Out of stock"}
            </button>
          </div>
        )}
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

