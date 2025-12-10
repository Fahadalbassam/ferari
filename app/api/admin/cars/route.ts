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
  const { model, price, currency, type, colors, images, inventory, status } = body || {};
  if (!model || !price || !currency || !type) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const car = await createCar({
    model,
    price: Number(price),
    currency,
    type,
    colors: colors ?? [],
    images: images ?? [],
    inventory: inventory ?? 0,
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

