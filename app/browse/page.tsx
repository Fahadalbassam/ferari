"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import type { ShopPost } from "@/lib/samplePosts";
import { samplePosts } from "@/lib/samplePosts";

const ITEMS_PER_PAGE = 25;

const categories = [
  { id: "sports", label: "Sports Cars", subcategories: ["Track", "GT"] },
  { id: "classic", label: "Classic", subcategories: ["Vintage", "Restored"] },
  { id: "luxury", label: "Luxury", subcategories: ["Coupe", "Sedan"] },
  { id: "limited", label: "Limited Series", subcategories: ["Hypercar", "Special"] },
  { id: "race", label: "Racing", subcategories: ["F1", "Challenge"] },
  { id: "merch", label: "Merch", subcategories: ["Apparel", "Accessories"] },
  { id: "collectibles", label: "Collectibles", subcategories: ["Models", "Memorabilia"] },
];

const grades = ["new", "likeNew", "lightlyUsed", "noticeablyUsed", "refurbished"];

export default function BrowsePage() {
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1500000]);
  const [appliedPriceRange, setAppliedPriceRange] = useState<[number, number]>([0, 1500000]);
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"recent" | "price-low" | "price-high" | "popular">("recent");
  const [currentPage, setCurrentPage] = useState(1);
  const [showMoreCategories, setShowMoreCategories] = useState(false);
  const [loadError] = useState<string | null>(null);
  const isLoading = false;

  const visibleCategories = showMoreCategories ? categories : categories.slice(0, 6);

  const filteredPosts = useMemo(() => {
    return samplePosts
      .filter((p) =>
        searchQuery
          ? `${p.title} ${p.description}`.toLowerCase().includes(searchQuery.toLowerCase())
          : true,
      )
      .filter((p) => (selectedCategory ? p.category === selectedCategory : true))
      .filter((p) =>
        selectedSubcategories.length ? selectedSubcategories.includes(p.subcategory) : true,
      )
      .filter((p) => p.price >= appliedPriceRange[0] && p.price <= appliedPriceRange[1])
      .sort((a, b) => {
        if (sortBy === "price-low") return a.price - b.price;
        if (sortBy === "price-high") return b.price - a.price;
        if (sortBy === "popular") return b.reviewCount - a.reviewCount;
        return Date.parse(b.createdAt) - Date.parse(a.createdAt);
      });
  }, [
    appliedPriceRange,
    searchQuery,
    selectedCategory,
    selectedSubcategories,
    sortBy,
  ]);

  const total = filteredPosts.length;
  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
  const currentSlice = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPosts.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, filteredPosts]);

  // Reset pagination when filters/search change.
  const handlePriceCommit = () => {
    setAppliedPriceRange(priceRange);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedSubcategories([]);
    setSelectedGrades([]);
    setPriceRange([0, 1500000]);
    setAppliedPriceRange([0, 1500000]);
    setCurrentPage(1);
  };

  const categoryRowPosts = (categoryId: string, limit: number) =>
    samplePosts.filter((p) => p.category === categoryId).slice(0, limit);

  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-900">
      <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Image
            src="/ferrari-logo-png_seeklogo-512505.png"
            alt="Ferrari logo"
            width={44}
            height={44}
            priority
          />
        </div>
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex text-neutral-800">
          {[
            { label: "Home", href: "/" },
            { label: "Browse", href: "/browse" },
            { label: "Test Drive", href: "/test-drive" },
            { label: "More About Ferrari", href: "/more-about" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-neutral-700 transition hover:text-neutral-900"
            >
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
            <p className="text-sm text-neutral-600">
              Discover Ferrari listings with filters, search, and pagination.
            </p>
          </div>
          <button
            type="button"
            disabled
            className="cursor-not-allowed rounded-md border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-500 bg-neutral-100"
            title="Admins only"
          >
            Create Post (admins only)
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-6 py-6 px-4 lg:px-6 lg:pl-0 lg:flex-row bg-white">
        <aside
          className={`flex w-full flex-col border border-white/20 bg-[#050505] text-white transition-all duration-300 lg:shrink-0 lg:self-stretch ${
            filtersOpen ? "lg:w-72" : "lg:w-14"
          }`}
        >
          <button
            className="flex h-12 w-full items-center justify-center border-b border-white/20 text-xs font-semibold uppercase tracking-[0.3em]"
            onClick={() => setFiltersOpen((o) => !o)}
            aria-label="Toggle filters"
          >
            {filtersOpen ? (
              <span className="flex items-center gap-2">
                Hide
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-4 w-4 stroke-current"
                  role="img"
                >
                  <polyline
                    points="15 18 9 12 15 6"
                    fill="none"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            ) : (
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-4 w-4 stroke-current"
                role="img"
              >
                <polyline
                  points="9 18 15 12 9 6"
                  fill="none"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>

          <div
            className={`flex-1 overflow-y-auto px-4 py-5 transition-all duration-200 no-scrollbar ${
              filtersOpen ? "opacity-100 pointer-events-auto" : "lg:opacity-0 lg:pointer-events-none"
            }`}
          >
            {filtersOpen && (
              <div className="mb-4 space-y-2 rounded-md border border-white/20 bg-white/5 p-3 text-sm">
                {session?.user ? (
                  <>
                    <div className="font-semibold text-white">Signed in</div>
                    <div className="text-white/70">{session.user.email}</div>
                    <div className="flex gap-2">
                      <Link
                        href="/orders"
                        className="rounded-md bg-white px-3 py-1 text-xs font-semibold text-black transition hover:bg-white/80"
                      >
                        Orders
                      </Link>
                      <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="rounded-md border border-white/40 px-3 py-1 text-xs font-semibold text-white hover:border-white/70"
                      >
                        Sign out
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Not signed in</span>
                    <Link
                      href="/auth/signin"
                      className="rounded-md bg-white px-3 py-1 text-xs font-semibold text-black transition hover:bg-white/80"
                    >
                      Sign in
                    </Link>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-4">
            <div>
              <div className="text-xs uppercase text-white/60">Product condition</div>
              <div className="mt-2 space-y-2">
                {grades.map((grade) => {
                  const checked = selectedGrades.includes(grade);
                  return (
                    <label key={grade} className="flex items-center gap-2 text-sm text-white/80">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          setSelectedGrades((prev) =>
                            checked ? prev.filter((g) => g !== grade) : [...prev, grade],
                          );
                          setCurrentPage(1);
                        }}
                        className="accent-white"
                      />
                      {grade}
                    </label>
                  );
                })}
              </div>
            </div>

            {!selectedCategory && (
              <div>
                <div className="text-xs uppercase text-white/60">Categories</div>
                <div className="mt-2 space-y-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className="w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-left text-sm text-white/80 hover:border-white/30"
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedCategory && (
              <div>
                <div className="flex items-center justify-between">
                  <div className="text-xs uppercase text-white/60">Subcategories</div>
                  <button
                    className="text-xs text-white/70 underline"
                    onClick={() => setSelectedCategory(null)}
                  >
                    Clear category
                  </button>
                </div>
                <div className="mt-2 space-y-2">
                  {categories
                    .find((c) => c.id === selectedCategory)
                    ?.subcategories.map((sub) => {
                      const active = selectedSubcategories.includes(sub);
                      return (
                        <label key={sub} className="flex items-center gap-2 text-sm text-white/80">
                          <input
                            type="checkbox"
                            checked={active}
                            onChange={() => {
                              setSelectedSubcategories((prev) =>
                                active ? prev.filter((s) => s !== sub) : [...prev, sub],
                              );
                              setCurrentPage(1);
                            }}
                            className="accent-white"
                          />
                          {sub}
                        </label>
                      );
                    })}
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase text-white/60">Price range</div>
                <div className="flex items-center gap-2 text-xs text-white/70">
                  <Image src="/SAR.png" alt="SAR" width={18} height={12} className="h-3 w-auto" />
                  <span>
                    {priceRange[0].toLocaleString()} - {priceRange[1].toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="mt-3 space-y-2">
                <input
                  type="range"
                  min={0}
                  max={1500000}
                  step={10000}
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                  className="w-full accent-white"
                />
                <input
                  type="range"
                  min={0}
                  max={1500000}
                  step={10000}
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="w-full accent-white"
                />
                <button
                  onClick={handlePriceCommit}
                  className="w-full rounded-md bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/20"
                >
                  Apply price
                </button>
              </div>
            </div>

            <button
              onClick={clearFilters}
              className="w-full rounded-md border border-white/20 px-3 py-2 text-sm font-semibold text-white hover:border-white/40"
            >
              Clear filters
            </button>
          </div>
          </div>
        </aside>

        <div className="flex-1 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[260px]">
              <input
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search models, trims, locations..."
                className="w-full rounded-md border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-900 placeholder:text-neutral-500"
                onKeyDown={(e) => {
                  if (e.key === "Enter") setCurrentPage(1);
                }}
              />
            </div>
            <button
              onClick={() => setCurrentPage(1)}
              className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-800 hover:border-neutral-400"
            >
              Refresh
            </button>
            <button
              onClick={() => setFiltersOpen((o) => !o)}
              className="rounded-md border border-neutral-300 px-3 py-2 text-xs font-medium text-neutral-800 hover:border-neutral-400 lg:hidden"
            >
              {filtersOpen ? "Hide Filters" : "Show Filters"}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
            onClick={() => {
              setSelectedCategory(null);
              setSelectedSubcategories([]);
              setCurrentPage(1);
            }}
              className={`rounded-full px-4 py-2 text-sm ${
                !selectedCategory
                  ? "bg-neutral-900 text-white"
                  : "bg-neutral-100 text-neutral-800 hover:bg-neutral-200"
              }`}
            >
              All Categories
            </button>
            {visibleCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setSelectedSubcategories([]);
                  setCurrentPage(1);
                }}
                className={`rounded-full px-4 py-2 text-sm ${
                  selectedCategory === cat.id
                    ? "bg-neutral-900 text-white"
                    : "bg-neutral-100 text-neutral-800 hover:bg-neutral-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
            {categories.length > 6 && (
              <button
                onClick={() => setShowMoreCategories((s) => !s)}
                className="rounded-full px-4 py-2 text-sm bg-neutral-100 text-neutral-800 hover:bg-neutral-200"
              >
                {showMoreCategories ? "Less" : "More"}
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
            <div className="text-sm text-neutral-700">
              Showing {Math.min(total, (currentPage - 1) * ITEMS_PER_PAGE + 1)}-
              {Math.min(total, currentPage * ITEMS_PER_PAGE)} of {total} results
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900"
            >
              <option value="recent">Most recent</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
              <option value="popular">Most popular</option>
            </select>
          </div>

          {!selectedCategory && (
            <div className="space-y-6">
              {categories.map((cat) => {
                const posts = categoryRowPosts(cat.id, 4);
                if (!posts.length) return null;
                return (
                  <div key={cat.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-semibold">{cat.label}</div>
                      <button
                        onClick={() => setSelectedCategory(cat.id)}
                        className="text-sm text-neutral-700 underline"
                      >
                        View all
                      </button>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      {posts.map((post) => (
                        <Card key={post.id} post={post} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {(selectedCategory || searchQuery || selectedSubcategories.length) && (
            <div className="space-y-4">
              {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-64 rounded-xl bg-neutral-100" />
                  ))}
                </div>
              ) : currentSlice.length ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {currentSlice.map((post) => (
                    <Card key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-10 text-center text-neutral-700">
                  No results. Try adjusting filters.
                  {loadError && <div className="mt-2 text-sm text-red-500">{loadError}</div>}
                </div>
              )}
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
            <div className="text-sm text-neutral-700">
              Page {currentPage} of {totalPages}
            </div>
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

      <footer className="border-t border-neutral-200 bg-white px-6 py-8 text-neutral-800">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Image
              src="/Ferari footer.png"
              alt="Ferrari footer logo"
              width={160}
              height={60}
              className="h-10 w-auto"
            />
            <div className="text-sm text-neutral-600">Driving passion and performance.</div>
          </div>

          <div className="text-center text-sm text-neutral-600 md:flex-1">
            © {new Date().getFullYear()} Ferrari. All rights reserved.
          </div>

          <div className="flex flex-wrap items-center justify-start gap-4 text-sm text-neutral-700 md:justify-end">
            <a href="#" className="transition hover:text-neutral-900">
              Instagram
            </a>
            <a href="#" className="transition hover:text-neutral-900">
              YouTube
            </a>
            <a href="#" className="transition hover:text-neutral-900">
              X
            </a>
            <a href="#" className="transition hover:text-neutral-900">
              Terms of Service
            </a>
            <a href="#" className="transition hover:text-neutral-900">
              User Agreement
            </a>
          </div>
        </div>
      </footer>

      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-200 ${
          sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-72 flex-col border-l border-neutral-200 bg-white shadow-xl transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
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

function Card({ post }: { post: ShopPost }) {
  return (
    <Link
      href={`/browse/${post.slug}`}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition hover:border-neutral-300 hover:shadow-lg"
    >
      <div className="relative h-44 w-full bg-neutral-100">
        {post.images[0] ? (
          <Image
            src={post.images[0]}
            alt={post.title}
            fill
            sizes="(min-width: 1024px) 33vw, 50vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-neutral-500">
            No image
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="text-base font-semibold line-clamp-2">{post.title}</div>
          {post.priceNegotiable && (
            <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs text-neutral-800">Negotiable</span>
          )}
        </div>
        <div className="text-sm text-neutral-700 line-clamp-2">{post.description}</div>
        <div className="flex flex-wrap gap-2 text-xs text-neutral-700">
          <span className="rounded-full bg-neutral-100 px-2 py-1">{post.city}</span>
          <span className="rounded-full bg-neutral-100 px-2 py-1">{post.university}</span>
          <span className="rounded-full bg-neutral-100 px-2 py-1">{post.subcategory}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Image src="/SAR.png" alt="SAR" width={20} height={14} className="h-4 w-auto" />
            <span>{post.price.toLocaleString()}</span>
          </div>
          <div className="text-xs text-neutral-600">
            ★ {post.sellerRating.toFixed(1)} · {post.reviewCount}
          </div>
        </div>
        <div className="mt-auto rounded-md bg-neutral-900 px-3 py-2 text-sm font-semibold text-white transition group-hover:bg-neutral-800">
          View details
        </div>
      </div>
    </Link>
  );
}

