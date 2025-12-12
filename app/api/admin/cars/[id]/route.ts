import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getServerAuthSession } from "@/lib/auth";
import { updateCar, getCarById } from "@/lib/models/cars";

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

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerAuthSession();
  if (!(await ensureAdminSession(session as { user?: { id?: string; role?: string } } | null))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const car = await updateCar(id, body);
  return NextResponse.json({ car });
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const car = await getCarById(id);
  if (!car) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ car });
}









