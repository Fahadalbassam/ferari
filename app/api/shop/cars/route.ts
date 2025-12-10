import { NextResponse } from "next/server";
import { queryCars } from "@/lib/models/cars";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") || undefined;
  const type = (searchParams.get("type") as "buy" | "rent" | "both" | null) || undefined;
  const search = searchParams.get("q") || undefined;
  const priceMin = parseNumber(searchParams.get("priceMin"));
  const priceMax = parseNumber(searchParams.get("priceMax"));
  const location = searchParams.get("location") || undefined;
  const limitParam = parseInt(searchParams.get("limit") || "", 10);
  const limit = Number.isFinite(limitParam) ? limitParam : 24;
  const skipParam = parseInt(searchParams.get("skip") || "", 10);
  const skip = Number.isFinite(skipParam) ? skipParam : 0;
  const sortParam = searchParams.get("sort");
  const sort = sortParam === "price-asc" || sortParam === "price-desc" ? sortParam : "recent";

  const conditionsParam = searchParams.get("conditions");
  const conditions = conditionsParam
    ? (conditionsParam.split(",").filter(Boolean) as Array<"new" | "used" | "certified">)
    : undefined;

  const { cars, total } = await queryCars({
    status: "active",
    category,
    type,
    search,
    priceMin,
    priceMax,
    location,
    conditions,
    limit,
    skip,
    sort,
    includeTotal: true,
  });

  return NextResponse.json({
    cars,
    total,
    limit,
    skip,
    hasMore: skip + cars.length < total,
  });
}

function parseNumber(value: string | null) {
  if (!value) return undefined;
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
}

