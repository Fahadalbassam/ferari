import { NextResponse } from "next/server";
import { sampleOrders } from "@/lib/adminSample";
import { getServerAuthSession } from "@/lib/auth";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

function ensureAdminSession(session: { user?: { id?: string; role?: string } } | null) {
  const cookie = cookies().get("admin_session");
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

export async function PATCH(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerAuthSession();
  if (!ensureAdminSession(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const order = sampleOrders.find((o) => o.id === params.id);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Stub: accept patch but do not persist in sample data
  return NextResponse.json({ ok: true, order });
}

