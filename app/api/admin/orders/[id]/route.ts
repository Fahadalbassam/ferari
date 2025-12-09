import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { cookies } from "next/headers";
import { getOrderById, updateOrder } from "@/lib/models/orders";

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

export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerAuthSession();
  if (!(await ensureAdminSession(session as { user?: { id?: string; role?: string } } | null))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const order = await getOrderById(id);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await updateOrder(id, {});
  return NextResponse.json({ ok: true, order: updated });
}

