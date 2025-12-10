/*
  Car detail page wired to live car API.
  - Fetches car by slug via /api/cars/[slug]
  - Supports buy and test-drive actions using POST /api/orders and /api/testdrive
  - Disables actions when inventory is 0
*/
"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type Car = {
  _id: string;
  slug: string;
  model: string;
  price: number;
  currency: string;
  type: "buy" | "rent" | "both";
  colors?: string[];
  images?: string[];
  inventory?: number;
};

export default function PostDetail() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [orderName, setOrderName] = useState("");
  const [orderEmail, setOrderEmail] = useState("");
  const [orderAddress, setOrderAddress] = useState("");
  const [tdName, setTdName] = useState("");
  const [tdEmail, setTdEmail] = useState("");
  const [tdDate, setTdDate] = useState("");
  const [tdNotes, setTdNotes] = useState("");
  const [submitting, setSubmitting] = useState<"order" | "testdrive" | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!slug) return;
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

  const showBuy = car?.type === "buy" || car?.type === "both";
  const showTestDrive = !!car;
  const hasInventory = (car?.inventory ?? 0) > 0;

  const handleOrder = async () => {
    if (!car || !orderName || !orderEmail) {
      setError("Name and email are required to place an order.");
      return;
    }
    setSubmitting("order");
    setError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carId: car._id,
          buyerEmail: orderEmail,
          buyerName: orderName,
          address: orderAddress,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Order failed");
      }
      alert("Order placed successfully.");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(null);
    }
  };

  const handleTestDrive = async () => {
    if (!car || !tdName || !tdEmail || !tdDate) {
      setError("Name, email, and preferred date are required for a test drive.");
      return;
    }
    setSubmitting("testdrive");
    setError(null);
    try {
      const res = await fetch("/api/testdrive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carId: car._id,
          customerEmail: tdEmail,
          customerName: tdName,
          preferredDate: tdDate,
          notes: tdNotes,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Request failed");
      }
      alert("Test drive requested. We will confirm soon.");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 lg:px-0">
        {loading ? (
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-10 text-center text-neutral-700">Loading...</div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-10 text-center text-red-700">{error}</div>
        ) : !car ? (
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-10 text-center text-neutral-700">Not found</div>
        ) : (
          <>
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="relative w-full overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100" style={{ aspectRatio: "16 / 9" }}>
                {car.images?.[0] ? (
                  <Image
                    src={car.images[0]}
                    alt={car.model}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-neutral-500">No image</div>
                )}
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="text-xs uppercase tracking-wide text-neutral-500">{car.type}</div>
                  <h1 className="text-2xl font-semibold">{car.model}</h1>
                </div>
                <div className="flex items-center gap-3 text-lg font-semibold">
                  <span>
                    {car.currency} {car.price.toLocaleString()}
                  </span>
                  <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-800">
                    {hasInventory ? `In stock: ${car.inventory ?? 0}` : "Out of stock"}
                  </span>
                </div>
                {car.colors?.length ? (
                  <div className="flex flex-wrap gap-2 text-sm text-neutral-700">
                    <span className="rounded-full bg-neutral-100 px-3 py-1">Colors: {car.colors.join(", ")}</span>
                  </div>
                ) : null}
                <div className="space-y-2 rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
                  <div className="font-semibold text-neutral-900">Actions</div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {showBuy && (
                      <button
                        onClick={handleOrder}
                        disabled={submitting === "order" || !hasInventory}
                        className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-60"
                      >
                        {submitting === "order" ? "Placing..." : hasInventory ? "Buy now" : "Out of stock"}
                      </button>
                    )}
                    {showTestDrive && (
                      <button
                        onClick={handleTestDrive}
                        disabled={submitting === "testdrive" || !hasInventory}
                        className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:border-neutral-500 disabled:opacity-60"
                      >
                        {submitting === "testdrive" ? "Submitting..." : hasInventory ? "Book test drive" : "No slots"}
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <div className="text-sm font-semibold text-neutral-900">Purchase details</div>
                    <input
                      value={orderName}
                      onChange={(e) => setOrderName(e.target.value)}
                      placeholder="Your name"
                      className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900"
                    />
                    <input
                      value={orderEmail}
                      onChange={(e) => setOrderEmail(e.target.value)}
                      placeholder="Email"
                      className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900"
                    />
                    <textarea
                      value={orderAddress}
                      onChange={(e) => setOrderAddress(e.target.value)}
                      placeholder="Address (optional)"
                      className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-semibold text-neutral-900">Test-drive details</div>
                    <input
                      value={tdName}
                      onChange={(e) => setTdName(e.target.value)}
                      placeholder="Your name"
                      className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900"
                    />
                    <input
                      value={tdEmail}
                      onChange={(e) => setTdEmail(e.target.value)}
                      placeholder="Email"
                      className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900"
                    />
                    <input
                      type="date"
                      value={tdDate}
                      onChange={(e) => setTdDate(e.target.value)}
                      className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900"
                    />
                    <textarea
                      value={tdNotes}
                      onChange={(e) => setTdNotes(e.target.value)}
                      placeholder="Notes (optional)"
                      className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900"
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-5 text-sm text-neutral-700">
              <div className="mb-2 text-base font-semibold text-neutral-900">Vehicle highlights</div>
              <ul className="list-disc space-y-1 pl-5">
                <li>Type: {car.type}</li>
                <li>Inventory: {car.inventory ?? 0}</li>
                <li>Slug: {car.slug}</li>
              </ul>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

