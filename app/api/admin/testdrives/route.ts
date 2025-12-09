import { NextResponse } from "next/server";
import { sampleTestDrives } from "@/lib/adminSample";
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

export async function GET(req: Request) {
  const session = await getServerAuthSession();
  if (!ensureAdminSession(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const q = searchParams.get("q")?.toLowerCase() ?? "";
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = parseInt(searchParams.get("limit") ?? "10", 10);

  let data = sampleTestDrives;
  if (status) data = data.filter((r) => r.status === status);
  if (q) {
    data = data.filter((r) => r.requestNumber.toLowerCase().includes(q) || r.email.toLowerCase().includes(q));
  }

  const total = data.length;
  const start = (page - 1) * limit;
  const end = start + limit;
  const paged = data.slice(start, end);

  return NextResponse.json({ total, page, limit, requests: paged });
}

