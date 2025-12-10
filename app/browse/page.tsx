"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Suspense, useEffect, useMemo, useState } from "react";
import FilterSidebar from "@/components/filter-sidebar";
import { useFilters } from "@/hooks/use-filters";

const StaticCar = dynamic(() => import("@/components/StaticCar"), {
  ssr: false,
  loading: () => <div className="h-[32vh] w-full bg-[#f4ede3]" />,
});

type Car = {
  _id: string;
  slug: string;
  model: string;
  price: number;
  rentalPrice?: number;
  currency: string;
  type: "buy" | "rent" | "both";
  category?: string;
  year?: number;
  images?: string[];
  inventory?: number;
};

const ITEMS_PER_PAGE = 24;

function BrowsePageContent() {
  const { filters, effectiveFilters, setFilter, clearFilters } = useFilters();
  const [currentPage, setCurrentPage] = useState(1);
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/cars", { cache: "no-store" });
        if (!res.ok) {
          const msg = await res.text().catch(() => "");
          throw new Error(msg || `Request failed (${res.status})`);
        }
        const data = await res.json();
        setCars(data.cars || []);
      } catch (err) {
        setError("Failed to load cars. Please try again.");
        console.error("Failed to load cars", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    effectiveFilters.search,
    effectiveFilters.type,
    effectiveFilters.priceRange,
    effectiveFilters.availability,
    effectiveFilters.carType,
    effectiveFilters.yearRange,
  ]);

  const filtered = useMemo(() => {
    return cars
      .filter((c) =>
        effectiveFilters.search
          ? c.model.toLowerCase().includes(effectiveFilters.search.toLowerCase())
          : true,
      )
      .filter((c) => (effectiveFilters.type === "all" ? true : c.type === effectiveFilters.type))
      .filter(
        (c) =>
          c.price >= effectiveFilters.priceRange[0] &&
          c.price <= effectiveFilters.priceRange[1],
      )
      .filter((c) =>
        effectiveFilters.carType === "all" ? true : (c.category ?? "general") === effectiveFilters.carType,
      )
      .filter((c) => {
        if (!c.year) return true;
        return c.year >= effectiveFilters.yearRange[0] && c.year <= effectiveFilters.yearRange[1];
      })
      .filter((c) =>
        effectiveFilters.availability === "in-stock" ? (c.inventory ?? 0) > 0 : true,
      )
      .sort((a, b) => {
        if (effectiveFilters.sort === "price-low") return a.price - b.price;
        if (effectiveFilters.sort === "price-high") return b.price - a.price;
        return b._id.localeCompare(a._id);
      });
  }, [cars, effectiveFilters]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
  const currentSlice = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, filtered]);

  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-900">
      <div className="w-full bg-[#f4ede3]">
        <StaticCar />
      </div>

      <div className="border-b border-neutral-200 px-6 py-6 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Browse</h1>
            <p className="text-sm text-neutral-600">Discover active Ferrari listings pulled from live inventory.</p>
          </div>
          <div className="rounded-md border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 bg-neutral-50">Live inventory</div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-6 bg-white py-6 px-4 lg:px-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <FilterSidebar
            filters={filters}
            effectiveFilters={effectiveFilters}
            onChange={setFilter}
            onClear={() => {
              clearFilters();
              setCurrentPage(1);
            }}
          />

          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
              <div className="text-sm text-neutral-700">
                Showing {Math.min(total, (currentPage - 1) * ITEMS_PER_PAGE + 1)}-
                {Math.min(total, currentPage * ITEMS_PER_PAGE)} of {total} results
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-700">
                <span className="hidden text-neutral-600 sm:inline">Sort</span>
          <select
                  value={filters.sort}
                  onChange={(e) => setFilter({ sort: e.target.value as typeof filters.sort })}
                  className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200"
          >
            <option value="recent">Most recent</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
          </select>
              </div>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 rounded-xl bg-neutral-100" />
            ))}
          </div>
        ) : currentSlice.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {currentSlice.map((car) => (
              <Card key={car._id} car={car} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-10 text-center text-neutral-700">
            No results. Try adjusting filters.
            {error && <div className="mt-2 text-sm text-red-500">{error}</div>}
          </div>
        )}

        <div className="flex items-center justify-center gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-800 disabled:opacity-40"
          >
            Previous
          </button>
          <div className="text-sm text-neutral-700">Page {currentPage} of {totalPages}</div>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-800 disabled:opacity-40"
          >
            Next
          </button>
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t border-neutral-200 bg-white px-6 py-8 text-neutral-800">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Image src="/Ferari footer.png" alt="Ferrari footer logo" width={160} height={60} className="h-10 w-auto" />
            <div className="text-sm text-neutral-600">Driving passion and performance.</div>
          </div>

          <div className="text-center text-sm text-neutral-600 md:flex-1">© {new Date().getFullYear()} Ferrari. All rights reserved.</div>

          <div className="flex flex-wrap items-center justify-start gap-4 text-sm text-neutral-700 md:justify-end">
            <a href="#" className="transition hover:text-neutral-900">Instagram</a>
            <a href="#" className="transition hover:text-neutral-900">YouTube</a>
            <a href="#" className="transition hover:text-neutral-900">X</a>
            <a href="#" className="transition hover:text-neutral-900">Terms of Service</a>
            <a href="#" className="transition hover:text-neutral-900">User Agreement</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-neutral-600">Loading filters…</div>}>
      <BrowsePageContent />
    </Suspense>
  );
}

function Card({ car }: { car: Car }) {
  const isSar = (car.currency || "").toUpperCase() === "SAR";
  const priceLabel = `${car.currency} ${car.price.toLocaleString()}`;
  const hasInventory = (car.inventory ?? 0) > 0;
  const cover = car.images?.[0];
  return (
    <Link
      href={`/browse/${car.slug}`}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition hover:border-neutral-300 hover:shadow-lg"
    >
      <div className="relative w-full overflow-hidden bg-neutral-100" style={{ aspectRatio: "16 / 9" }}>
        {cover ? (
          <Image
            src={cover}
            alt={car.model}
            fill
            sizes="(min-width: 1024px) 33vw, 50vw"
            className="object-cover transition duration-300 group-hover:scale-[1.02]"
            priority={false}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-neutral-500">No image</div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            <div className="text-xs uppercase tracking-wide text-neutral-500">{car.category ?? "general"}</div>
            <div className="text-base font-semibold line-clamp-2">{car.model}</div>
            {car.year ? <div className="text-xs text-neutral-600">Year {car.year}</div> : null}
          </div>
          <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs text-neutral-800">{car.type}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-lg font-semibold">
            {isSar && <Image src="/SAR.png" alt="SAR" width={18} height={12} className="h-4 w-auto" />}
            <span>{priceLabel}</span>
          </div>
          <div className="text-xs text-neutral-600">{hasInventory ? `In stock: ${car.inventory ?? 0}` : "Out of stock"}</div>
        </div>
        <div className="mt-auto rounded-md bg-neutral-900 px-3 py-2 text-sm font-semibold text-white transition group-hover:bg-neutral-800">View details</div>
      </div>
    </Link>
  );
}
