import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { listTestDrives, updateTestDrive, type TestDriveStatus } from "@/lib/models/testdrives";
import { adjustInventory } from "@/lib/models/cars";
import { validateAdminSession } from "@/lib/models/admin-sessions";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getServerAuthSession();
  if (!(await validateAdminSession(session as { user?: { id?: string; accountType?: string } } | null))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const statusParam = searchParams.get("status") as TestDriveStatus | null;
  const q = searchParams.get("q") ?? "";
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = parseInt(searchParams.get("limit") ?? "10", 10);

  const { total, requests } = await listTestDrives({ status: statusParam ?? undefined, q, page, limit });
  const normalized = requests.map((r) => ({
    ...r,
    id: r._id.toString(),
  }));
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return NextResponse.json({ total, page, limit, totalPages, requests: normalized });
}

export async function PATCH(req: Request) {
  const session = await getServerAuthSession();
  if (!(await validateAdminSession(session as { user?: { id?: string; accountType?: string } } | null))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const { id, status, notes } = body || {};
  if (!id || !status) return NextResponse.json({ error: "Missing id or status" }, { status: 400 });

  const before = await updateTestDrive(id, {});
  if (!before) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await updateTestDrive(id, { status, notes });

  if (updated && !updated.inventoryHoldReleased && (status === "cancelled" || status === "completed")) {
    await adjustInventory(updated.carId.toString(), 1);
    await updateTestDrive(id, { inventoryHoldReleased: true });
  }

  return NextResponse.json({
    request: updated
      ? {
          ...updated,
          id: updated._id.toString(),
        }
      : null,
  });
}

