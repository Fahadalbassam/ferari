import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { listOrders, updateOrder, type OrderStatus } from "@/lib/models/orders";
import { adjustInventory } from "@/lib/models/cars";
import { validateAdminSession } from "@/lib/models/admin-sessions";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getServerAuthSession();
  if (!(await validateAdminSession(session as { user?: { id?: string; accountType?: string } } | null))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const statusParam = searchParams.get("status") as OrderStatus | null;
  const q = searchParams.get("q") ?? "";
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = parseInt(searchParams.get("limit") ?? "10", 10);

  const { total, orders } = await listOrders({ status: statusParam ?? undefined, q, page, limit });
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return NextResponse.json({ total, page, limit, totalPages, orders });
}

export async function PATCH(req: Request) {
  const session = await getServerAuthSession();
  if (!(await validateAdminSession(session as { user?: { id?: string; accountType?: string } } | null))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const { id, status, tracking } = body || {};
  if (!id || !status) return NextResponse.json({ error: "Missing id or status" }, { status: 400 });

  const order = await updateOrder(id, { status, tracking });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (status === "cancelled") {
    await adjustInventory(order.carId.toString(), 1);
  } else if (order.status === "cancelled" && status !== "cancelled") {
    await adjustInventory(order.carId.toString(), -1);
  }

  return NextResponse.json({ order });
}

