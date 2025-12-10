import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { listCars, createCar, updateCar } from "@/lib/models/cars";
import { validateAdminSession } from "@/lib/models/admin-sessions";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getServerAuthSession();
  if (!(await validateAdminSession(session as { user?: { id?: string; accountType?: string } } | null))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") as "active" | "inactive" | null;
  const cars = await listCars({ status: status ?? undefined });
  return NextResponse.json({ cars });
}

export async function POST(req: NextRequest) {
  const session = await getServerAuthSession();
  if (!(await validateAdminSession(session as { user?: { id?: string; accountType?: string } } | null))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const { model, price, currency, type, colors, images, inventory, status, details, year, category } = body || {};
  const numericYear = Number(year);
  const numericPrice = Number(price);
  const numericInventory = Number(inventory ?? 0);
  if (
    !model ||
    !currency ||
    !type ||
    !category ||
    !Number.isFinite(numericYear) ||
    numericYear < 1900 ||
    !Number.isFinite(numericPrice) ||
    numericPrice <= 0 ||
    !Number.isFinite(numericInventory) ||
    numericInventory < 0
  ) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const car = await createCar({
    model,
    price: numericPrice,
    currency,
    type,
    year: numericYear,
    category,
    colors: colors ?? [],
    images: images ?? [],
    details,
    inventory: numericInventory ?? 0,
    status: status ?? "active",
  });
  return NextResponse.json({ car });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerAuthSession();
  if (!(await validateAdminSession(session as { user?: { id?: string; accountType?: string } } | null))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const { id, ...rest } = body || {};
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const car = await updateCar(id, rest);
  return NextResponse.json({ car });
}

