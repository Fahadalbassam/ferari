"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type Filters = {
  search: string;
  type: "all" | "buy" | "rent" | "both";
  priceRange: [number, number];
  availability: "all" | "in-stock";
  carType: "all" | "sedan" | "suv" | "truck" | "coupe" | "convertible" | "ev" | "hybrid" | "luxury" | "offroad" | "van" | "general";
  yearRange: [number, number];
  sort: "recent" | "price-low" | "price-high";
};

const CURRENT_YEAR = new Date().getFullYear();
const DEFAULT_FILTERS: Filters = {
  search: "",
  type: "all",
  priceRange: [0, 1_500_000],
  availability: "all",
  carType: "all",
  yearRange: [1990, CURRENT_YEAR + 1],
  sort: "recent",
};

const clampPrice = (value: number) =>
  Math.min(Math.max(Number.isFinite(value) ? value : 0, 0), 1_500_000);
const clampYear = (value: number) =>
  Math.min(Math.max(Number.isFinite(value) ? value : DEFAULT_FILTERS.yearRange[0], 1980), CURRENT_YEAR + 1);

export function useFilters() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const [filters, setFilters] = useState<Filters>(() => {
    const type = searchParams.get("type");
    const availability = searchParams.get("avail");
    const sort = searchParams.get("sort");
    const min = searchParams.get("min");
    const max = searchParams.get("max");
    const carType = searchParams.get("ctype");
    const yMin = searchParams.get("ymin");
    const yMax = searchParams.get("ymax");

    return {
      ...DEFAULT_FILTERS,
      search: searchParams.get("q") || "",
      type: type === "buy" || type === "rent" || type === "both" ? type : "all",
      availability: availability === "in-stock" ? "in-stock" : "all",
      carType:
        carType === "sedan" ||
        carType === "suv" ||
        carType === "truck" ||
        carType === "coupe" ||
        carType === "convertible" ||
        carType === "ev" ||
        carType === "hybrid" ||
        carType === "luxury" ||
        carType === "offroad" ||
        carType === "van" ||
        carType === "general"
          ? carType
          : "all",
      sort:
        sort === "price-low" || sort === "price-high"
          ? sort
          : "recent",
      priceRange: [
        clampPrice(min ? Number(min) : DEFAULT_FILTERS.priceRange[0]),
        clampPrice(max ? Number(max) : DEFAULT_FILTERS.priceRange[1]),
      ],
      yearRange: [
        clampYear(yMin ? Number(yMin) : DEFAULT_FILTERS.yearRange[0]),
        clampYear(yMax ? Number(yMax) : DEFAULT_FILTERS.yearRange[1]),
      ],
    };
  });

  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);
  const [debouncedPriceRange, setDebouncedPriceRange] = useState(filters.priceRange);
  const [debouncedYearRange, setDebouncedYearRange] = useState(filters.yearRange);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(filters.search), 250);
    return () => clearTimeout(id);
  }, [filters.search]);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedPriceRange(filters.priceRange), 250);
    return () => clearTimeout(id);
  }, [filters.priceRange]);
  useEffect(() => {
    const id = setTimeout(() => setDebouncedYearRange(filters.yearRange), 250);
    return () => clearTimeout(id);
  }, [filters.yearRange]);

  const effectiveFilters = useMemo(
    () => ({
      ...filters,
      search: debouncedSearch,
      priceRange: debouncedPriceRange,
      yearRange: debouncedYearRange,
    }),
    [filters, debouncedSearch, debouncedPriceRange, debouncedYearRange],
  );

  useEffect(() => {
    const params = new URLSearchParams();
    if (effectiveFilters.search) params.set("q", effectiveFilters.search);
    if (effectiveFilters.type !== "all") params.set("type", effectiveFilters.type);
    if (effectiveFilters.availability !== "all") params.set("avail", "in-stock");
    if (effectiveFilters.carType !== "all") params.set("ctype", effectiveFilters.carType);
    if (effectiveFilters.sort !== "recent") params.set("sort", effectiveFilters.sort);
    if (effectiveFilters.priceRange[0] !== DEFAULT_FILTERS.priceRange[0]) {
      params.set("min", String(effectiveFilters.priceRange[0]));
    }
    if (effectiveFilters.priceRange[1] !== DEFAULT_FILTERS.priceRange[1]) {
      params.set("max", String(effectiveFilters.priceRange[1]));
    }
    if (effectiveFilters.yearRange[0] !== DEFAULT_FILTERS.yearRange[0]) {
      params.set("ymin", String(effectiveFilters.yearRange[0]));
    }
    if (effectiveFilters.yearRange[1] !== DEFAULT_FILTERS.yearRange[1]) {
      params.set("ymax", String(effectiveFilters.yearRange[1]));
    }

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [effectiveFilters, pathname, router]);

  const setFilter = (partial: Partial<Filters>) => {
    setFilters((prev) => {
      const next: Filters = { ...prev, ...partial };
      const [min, max] = next.priceRange;
      next.priceRange = [clampPrice(min), clampPrice(Math.max(min, clampPrice(max)))];
      const [yMin, yMax] = next.yearRange;
      next.yearRange = [clampYear(yMin), clampYear(Math.max(yMin, clampYear(yMax)))];
      return next;
    });
  };

  const clearFilters = () => setFilters(DEFAULT_FILTERS);

  return {
    filters,
    effectiveFilters,
    setFilter,
    clearFilters,
    defaults: DEFAULT_FILTERS,
  };
}





