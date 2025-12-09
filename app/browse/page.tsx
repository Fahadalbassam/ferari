"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSession, signOut } from "next-auth/react";

type Car = {
  _id: string;
  slug: string;
  model: string;
  price: number;
  currency: string;
  type: "buy" | "rent" | "both";
  images?: string[];
  inventory?: number;
};

const ITEMS_PER_PAGE = 24;

export default function BrowsePage() {
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "buy" | "rent" | "both">("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1500000]);
  const [appliedPriceRange, setAppliedPriceRange] = useState<[number, number]>([0, 1500000]);
  const [sortBy, setSortBy] = useState<"recent" | "price-low" | "price-high">("recent");
  const [currentPage, setCurrentPage] = useState(1);
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/cars", { next: { revalidate: 0 } });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setCars(data.cars || []);
      } catch (err) {
        setError("Failed to load cars. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    return cars
      .filter((c) => (searchQuery ? c.model.toLowerCase().includes(searchQuery.toLowerCase()) : true))
      .filter((c) => (typeFilter === "all" ? true : c.type === typeFilter))
      .filter((c) => c.price >= appliedPriceRange[0] && c.price <= appliedPriceRange[1])
      .sort((a, b) => {
        if (sortBy === "price-low") return a.price - b.price;
        if (sortBy === "price-high") return b.price - a.price;
        return b._id.localeCompare(a._id);
      });
  }, [cars, searchQuery, typeFilter, appliedPriceRange, sortBy]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
  const currentSlice = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, filtered]);

  const handlePriceCommit = () => {
    setAppliedPriceRange(priceRange);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setTypeFilter("all");
    setPriceRange([0, 1500000]);
    setAppliedPriceRange([0, 1500000]);
    setCurrentPage(1);
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-900">
      <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Image src="/ferrari-logo-png_seeklogo-512505.png" alt="Ferrari logo" width={44} height={44} priority />
        </div>
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex text-neutral-800">
          {[
            { label: "Home", href: "/" },
            { label: "Browse", href: "/browse" },
            { label: "Test Drive", href: "/test-drive" },
            { label: "More About Ferrari", href: "/more-about" },
          ].map((item) => (
            <Link key={item.label} href={item.href} className="text-neutral-700 transition hover:text-neutral-900">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {session?.user ? (
            <>
              <Link
                href="/orders"
                className="hidden rounded-md border border-neutral-300 px-3 py-1 text-xs font-semibold text-neutral-800 transition hover:border-neutral-500 md:inline-flex"
              >
                Orders
              </Link>
              {(session.user as { role?: string }).role === "admin" && (
                <Link
                  href="/admin-dashboard"
                  className="hidden rounded-md border border-neutral-300 px-3 py-1 text-xs font-semibold text-neutral-800 transition hover:border-neutral-500 md:inline-flex"
                >
                  Admin
                </Link>
              )}
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="hidden rounded-md border border-neutral-300 px-3 py-1 text-xs font-semibold text-neutral-800 transition hover:border-neutral-500 md:inline-flex"
              >
                Logout
              </button>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-900 text-sm font-semibold text-white">
                {session.user.email?.slice(0, 2).toUpperCase()}
              </div>
            </>
          ) : (
            <Link
              href="/auth/signin"
              className="rounded-md border border-neutral-300 px-3 py-2 text-sm font-semibold text-neutral-800 transition hover:border-neutral-500"
            >
              Sign In
            </Link>
          )}
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex items-center justify-center rounded-md border border-neutral-300 px-3 py-2 text-neutral-800 shadow-sm transition hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-300 md:hidden"
            aria-label="Open menu"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 stroke-current text-neutral-800" role="img">
              <line x1="4" y1="7" x2="20" y2="7" strokeWidth="2" strokeLinecap="round" />
              <line x1="4" y1="12" x2="20" y2="12" strokeWidth="2" strokeLinecap="round" />
              <line x1="4" y1="17" x2="20" y2="17" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </header>

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
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[260px]">
            <input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search models..."
              className="w-full rounded-md border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-900 placeholder:text-neutral-500"
              onKeyDown={(e) => {
                if (e.key === "Enter") setCurrentPage(1);
              }}
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value as typeof typeFilter);
              setCurrentPage(1);
            }}
            className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900"
          >
            <option value="all">All types</option>
            <option value="buy">Buy</option>
            <option value="rent">Rent</option>
            <option value="both">Buy or rent</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900"
          >
            <option value="recent">Most recent</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
          </select>
          <button
            onClick={() => setFiltersOpen((o) => !o)}
            className="rounded-md border border-neutral-300 px-3 py-2 text-xs font-medium text-neutral-800 hover:border-neutral-400"
          >
            {filtersOpen ? "Hide price" : "Price range"}
          </button>
          <button
            onClick={clearFilters}
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-800 hover:border-neutral-400"
          >
            Clear
          </button>
        </div>

        {filtersOpen && (
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-4">
            <div className="flex items-center justify-between text-sm text-neutral-700">
              <div>Price range</div>
              <div className="flex items-center gap-2 text-xs">
                <Image src="/SAR.png" alt="SAR" width={18} height={12} className="h-3 w-auto" />
                <span>
                  {priceRange[0].toLocaleString()} - {priceRange[1].toLocaleString()}
                </span>
              </div>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <input
                type="range"
                min={0}
                max={1500000}
                step={10000}
                value={priceRange[0]}
                onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                className="w-full accent-neutral-900"
              />
              <input
                type="range"
                min={0}
                max={1500000}
                step={10000}
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                className="w-full accent-neutral-900"
              />
            </div>
            <button
              onClick={handlePriceCommit}
              className="mt-3 w-full rounded-md bg-neutral-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800 sm:w-auto"
            >
              Apply price
            </button>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
          <div className="text-sm text-neutral-700">
            Showing {Math.min(total, (currentPage - 1) * ITEMS_PER_PAGE + 1)}-
            {Math.min(total, currentPage * ITEMS_PER_PAGE)} of {total} results
          </div>
          <div className="text-sm text-neutral-600">Inventory refreshes from Mongo-backed API endpoints.</div>
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

      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-200 ${sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-72 flex-col border-l border-neutral-200 bg-white shadow-xl transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "translate-x-full"}`}
        aria-label="Sidebar"
      >
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
          <div className="text-lg font-semibold">Menu</div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-md px-2 py-1 text-sm text-neutral-700 transition hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-300"
          >
            Close
          </button>
        </div>
        <div className="flex flex-1 items-center justify-center px-5">
          <Link
            href="/auth/signin"
            className="w-full rounded-md bg-neutral-900 px-4 py-3 text-sm font-semibold text-white text-center transition hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-300"
          >
            Sign In
          </Link>
        </div>
      </aside>
    </div>
  );
}

function Card({ car }: { car: Car }) {
  const priceLabel = `${car.currency} ${car.price.toLocaleString()}`;
  const hasInventory = (car.inventory ?? 0) > 0;
  return (
    <Link
      href={`/browse/${car.slug}`}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition hover:border-neutral-300 hover:shadow-lg"
    >
      <div className="relative h-44 w-full bg-neutral-100">
        {car.images?.[0] ? (
          <Image src={car.images[0]} alt={car.model} fill sizes="(min-width: 1024px) 33vw, 50vw" className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-neutral-500">No image</div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="text-base font-semibold line-clamp-2">{car.model}</div>
          <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs text-neutral-800">{car.type}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <span>{priceLabel}</span>
          </div>
          <div className="text-xs text-neutral-600">{hasInventory ? `In stock: ${car.inventory ?? 0}` : "Out of stock"}</div>
        </div>
        <div className="mt-auto rounded-md bg-neutral-900 px-3 py-2 text-sm font-semibold text-white transition group-hover:bg-neutral-800">View details</div>
      </div>
    </Link>
  );
}

