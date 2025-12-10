"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { Filters } from "@/hooks/use-filters";

type FilterSidebarProps = {
  filters: Filters;
  effectiveFilters: Filters;
  onChange: (next: Partial<Filters>) => void;
  onClear: () => void;
};

export default function FilterSidebar({
  filters,
  effectiveFilters,
  onChange,
  onClear,
}: FilterSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const stored = window.localStorage.getItem("browse-filter-collapsed");
    return stored === "1";
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("browse-filter-collapsed", collapsed ? "1" : "0");
  }, [collapsed]);

  const priceLabel = useMemo(
    () =>
      `${effectiveFilters.priceRange[0].toLocaleString()} - ${effectiveFilters.priceRange[1].toLocaleString()}`,
    [effectiveFilters.priceRange],
  );

  return (
    <>
      <div className="mb-4 flex items-center justify-between lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-800 shadow-sm transition hover:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-300"
          aria-label="Open filters"
        >
          Filters
          {badgeCount(effectiveFilters) > 0 && (
            <span className="rounded-full bg-neutral-900 px-2 py-0.5 text-xs font-semibold text-white">
              {badgeCount(effectiveFilters)}
            </span>
          )}
        </button>
        <button
          onClick={onClear}
          className="text-sm font-medium text-neutral-700 underline-offset-4 hover:underline"
        >
          Clear
        </button>
      </div>

      <div
        className={`fixed inset-0 z-30 bg-black/40 transition-opacity duration-200 ${mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"} lg:hidden`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={`z-40 w-full max-w-full rounded-none border border-neutral-200 bg-white shadow-sm transition-transform duration-200 motion-reduce:transform-none motion-reduce:transition-none lg:sticky lg:top-24 lg:z-0 lg:-ml-6 lg:max-w-[320px] lg:translate-x-0 ${
          collapsed ? "lg:max-w-[72px] lg:w-[72px]" : "lg:max-w-[320px]"
        } ${
          mobileOpen
            ? "fixed left-0 top-0 h-full max-w-[320px] translate-x-0"
            : "lg:block lg:relative -translate-x-full lg:translate-x-0"
        }`}
        aria-label="Filters"
      >
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCollapsed((v) => !v)}
              className="rounded-none border border-neutral-200 px-2 py-1 text-xs font-semibold text-neutral-800 transition hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-300"
              aria-expanded={!collapsed}
              aria-label={collapsed ? "Expand filters" : "Collapse filters"}
            >
              {collapsed ? ">>" : "<<"}
            </button>
            {badgeCount(effectiveFilters) > 0 && (
              <span className="rounded-full bg-neutral-900 px-2 py-0.5 text-xs font-semibold text-white">
                {badgeCount(effectiveFilters)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!collapsed && (
              <button
                onClick={onClear}
                className="hidden text-xs font-semibold text-neutral-700 underline-offset-4 hover:underline lg:inline"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => setMobileOpen(false)}
              className="rounded-md border border-neutral-200 px-2 py-1 text-xs font-semibold text-neutral-700 transition hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-300 lg:hidden"
            >
              Close
            </button>
          </div>
        </div>

        <div
          className={`transition-opacity duration-200 ease-in-out motion-reduce:transition-none ${
            collapsed ? "opacity-0 invisible pointer-events-none" : "opacity-100 visible"
          }`}
        >
          <div className="flex flex-col gap-4 px-4 py-4">
            <Section title="Search">
              <input
                value={filters.search}
                onChange={(e) => onChange({ search: e.target.value })}
                placeholder="Search models..."
                className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-500 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200"
                aria-label="Search models"
              />
            </Section>

            <Section title="Type">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "All", value: "all" },
                  { label: "Buy", value: "buy" },
                  { label: "Rent", value: "rent" },
                  { label: "Buy or rent", value: "both" },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`cursor-pointer rounded-md border px-3 py-2 text-sm font-medium transition hover:border-neutral-400 ${filters.type === option.value ? "border-neutral-900 text-neutral-900" : "border-neutral-200 text-neutral-700"}`}
                  >
                    <input
                      type="radio"
                      name="type"
                      value={option.value}
                      checked={filters.type === option.value}
                      onChange={() => onChange({ type: option.value as Filters["type"] })}
                      className="sr-only"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </Section>

            <Section title="Availability">
              <label className="flex items-center gap-3 text-sm text-neutral-800">
                <input
                  type="checkbox"
                  checked={filters.availability === "in-stock"}
                  onChange={(e) =>
                    onChange({ availability: e.target.checked ? "in-stock" : "all" })
                  }
                  className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-400"
                />
                In stock only
              </label>
            </Section>

            <Section title="Price range" hint={priceLabel}>
              <div className="flex items-center gap-2 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-700">
                <Image src="/SAR.png" alt="SAR" width={18} height={12} className="h-3 w-auto" />
                <span>{priceLabel}</span>
              </div>
              <div className="mt-3 space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm text-neutral-700">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-neutral-600">Min</label>
                    <input
                      type="number"
                      value={filters.priceRange[0]}
                      onChange={(e) =>
                        onChange({
                          priceRange: [Number(e.target.value), filters.priceRange[1]],
                        })
                      }
                      min={0}
                      max={filters.priceRange[1]}
                      className="w-full rounded-md border border-neutral-200 bg-white px-2 py-1 text-sm text-neutral-900 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-neutral-600">Max</label>
                    <input
                      type="number"
                      value={filters.priceRange[1]}
                      onChange={(e) =>
                        onChange({
                          priceRange: [filters.priceRange[0], Number(e.target.value)],
                        })
                      }
                      min={filters.priceRange[0]}
                      max={1_500_000}
                      className="w-full rounded-md border border-neutral-200 bg-white px-2 py-1 text-sm text-neutral-900 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <input
                    type="range"
                    min={0}
                    max={1_500_000}
                    step={10_000}
                    value={filters.priceRange[0]}
                    onChange={(e) =>
                      onChange({
                        priceRange: [Number(e.target.value), filters.priceRange[1]],
                      })
                    }
                    className="w-full accent-neutral-900"
                  />
                  <input
                    type="range"
                    min={0}
                    max={1_500_000}
                    step={10_000}
                    value={filters.priceRange[1]}
                    onChange={(e) =>
                      onChange({
                        priceRange: [filters.priceRange[0], Number(e.target.value)],
                      })
                    }
                    className="w-full accent-neutral-900"
                  />
                </div>
              </div>
            </Section>

            <Section title="Sort">
              <select
                value={filters.sort}
                onChange={(e) => onChange({ sort: e.target.value as Filters["sort"] })}
                className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200"
              >
                <option value="recent">Most recent</option>
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
              </select>
            </Section>

            <button
              onClick={() => {
                onClear();
                setMobileOpen(false);
              }}
              className="mt-2 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm font-semibold text-neutral-800 transition hover:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-300"
            >
              Reset filters
            </button>
            <button
              onClick={() => setMobileOpen(false)}
              className="w-full rounded-md bg-neutral-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-300 lg:hidden"
            >
              Apply & close
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2 rounded-lg border border-neutral-100 bg-white px-3 py-3 shadow-sm">
      <div className="flex items-center justify-between text-sm font-semibold text-neutral-900">
        <span>{title}</span>
        {hint ? <span className="text-xs font-normal text-neutral-500">{hint}</span> : null}
      </div>
      {children}
    </div>
  );
}

function badgeCount(filters: Filters) {
  let count = 0;
  if (filters.search) count += 1;
  if (filters.type !== "all") count += 1;
  if (filters.availability !== "all") count += 1;
  if (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 1_500_000) count += 1;
  if (filters.sort !== "recent") count += 1;
  return count;
}


