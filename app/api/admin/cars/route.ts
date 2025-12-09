import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getServerAuthSession } from "@/lib/auth";
import { listCars, createCar, updateCar } from "@/lib/models/cars";

export const dynamic = "force-dynamic";

async function ensureAdminSession(session: { user?: { id?: string; role?: string } } | null) {
  const cookieStore = await cookies();
  const cookie = cookieStore.get("admin_session");
  if (!cookie) return false;
  try {
    const parsed = JSON.parse(Buffer.from(cookie.value, "base64").toString());
    if (!parsed.userId || !parsed.expiresAt) return false;
    if (Date.now() > parsed.expiresAt) return false;
    if (!session?.user?.id || parsed.userId !== session.user.id) return false;
    if ((session.user as { role?: string }).role !== "admin") return false;
    return true;
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerAuthSession();
  if (!(await ensureAdminSession(session as { user?: { id?: string; role?: string } } | null))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") as "active" | "inactive" | null;
  const cars = await listCars({ status: status ?? undefined });
  return NextResponse.json({ cars });
}

export async function POST(req: NextRequest) {
  const session = await getServerAuthSession();
  if (!(await ensureAdminSession(session as { user?: { id?: string; role?: string } } | null))) {
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
  if (!(await ensureAdminSession(session as { user?: { id?: string; role?: string } } | null))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const { id, ...rest } = body || {};
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const car = await updateCar(id, rest);
  return NextResponse.json({ car });
}

