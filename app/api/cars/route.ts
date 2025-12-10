import { NextResponse } from "next/server";
import { queryCars } from "@/lib/models/cars";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = (searchParams.get("type") as "buy" | "rent" | "both" | null) || undefined;
  const search = searchParams.get("q") || undefined;
  const priceMin = parseNumber(searchParams.get("priceMin"));
  const priceMax = parseNumber(searchParams.get("priceMax"));
  const location = searchParams.get("location") || undefined;
  const category = searchParams.get("category") || undefined;
  const yearMin = parseNumber(searchParams.get("yearMin"));
  const yearMax = parseNumber(searchParams.get("yearMax"));
  const inStockOnly = searchParams.get("availability") === "in-stock";
  const sortParam = searchParams.get("sort");
  const sort = sortParam === "price-asc" || sortParam === "price-desc" ? sortParam : "recent";
  const limit = parseInt(searchParams.get("limit") || "", 10);
  const skip = parseInt(searchParams.get("skip") || "", 10);
  const conditionsParam = searchParams.get("conditions");
  const conditions = conditionsParam
    ? (conditionsParam.split(",").filter(Boolean) as Array<"new" | "used" | "certified">)
    : undefined;

  const { cars, total } = await queryCars({
    status: "active",
    type,
    search,
    priceMin,
    priceMax,
    location,
    category,
    yearMin,
    yearMax,
    inStockOnly,
    conditions,
    sort,
    limit: Number.isFinite(limit) ? limit : undefined,
    skip: Number.isFinite(skip) ? skip : undefined,
    includeTotal: true,
  });

  return NextResponse.json({ cars, total });
}

function parseNumber(value: string | null) {
  if (!value) return undefined;
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
}

