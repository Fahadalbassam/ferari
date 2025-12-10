"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

type Car = {
  _id: string;
  model: string;
  slug: string;
};

type Booking = {
  _id: string;
  requestNumber: string;
  carModel: string;
  preferredDate: string;
  status: string;
  createdAt: string;
};

export default function TestDrivePage() {
  const { data: session } = useSession();
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [cars, setCars] = useState<Car[]>([]);
  const [selectedCar, setSelectedCar] = useState<string>("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCars = async () => {
      try {
        const res = await fetch("/api/cars", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        const list = (data.cars || []) as Car[];
        setCars(list);
        if (list.length && !selectedCar) {
          setSelectedCar(list[0].slug);
        }
      } catch {
        // ignore load errors silently for picker
      }
    };
    loadCars();

    const load = async () => {
      if (!session?.user?.email) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/testdrive", { cache: "no-store" });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to load bookings");
        }
        const data = await res.json();
        setBookings(data.requests || []);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [session?.user?.email, selectedCar]);

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
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/drive"
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800"
          >
            Start interactive test drive
          </Link>
          <div className="text-xs text-neutral-600">
            Arrow keys / WASD to drive, Space to brake, follow-cam toggle inside /drive.
          </div>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-6 space-y-6">
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm font-medium text-neutral-800">Select car from inventory</label>
              <select
                value={selectedCar}
                onChange={(e) => setSelectedCar(e.target.value)}
                className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-neutral-400 focus:outline-none"
              >
                {cars.length === 0 && <option value="">Loading cars…</option>}
                {cars.map((car) => (
                  <option key={car._id} value={car.slug}>
                    {car.model}
                  </option>
                ))}
              </select>
            </div>
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
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-900">Your bookings</h2>
              {bookings.length > 0 && (
                <Link
                  href="/drive"
                  className="rounded-md bg-neutral-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-neutral-800"
                >
                  Start test drive
                </Link>
              )}
            </div>
            {loading ? (
              <div className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700">Loading bookings…</div>
            ) : error ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
            ) : bookings.length === 0 ? (
              <div className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700">No bookings yet.</div>
            ) : (
              <div className="overflow-hidden rounded-md border border-neutral-200 bg-white">
                <table className="w-full text-sm text-neutral-800">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="px-3 py-2 text-left">Request #</th>
                      <th className="px-3 py-2 text-left">Vehicle</th>
                      <th className="px-3 py-2 text-left">Preferred</th>
                      <th className="px-3 py-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b) => (
                      <tr key={b._id} className="border-t border-neutral-200">
                        <td className="px-3 py-2">{b.requestNumber}</td>
                        <td className="px-3 py-2">{b.carModel}</td>
                        <td className="px-3 py-2">{b.preferredDate}</td>
                        <td className="px-3 py-2 capitalize">{b.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}





