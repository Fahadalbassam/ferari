import { NextRequest, NextResponse } from "next/server";
import { getCarById, adjustInventory } from "@/lib/models/cars";
import { createTestDrive, listTestDrivesForEmail } from "@/lib/models/testdrives";
import { getServerAuthSession } from "@/lib/auth";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { carId, customerEmail, customerName, preferredDate, notes } = body || {};
    if (!carId || !customerEmail || !customerName || !preferredDate) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    const car = await getCarById(carId);
    if (!car || car.status !== "active") {
      return NextResponse.json({ error: "Car not available" }, { status: 400 });
    }
    if (car.inventory <= 0) {
      return NextResponse.json({ error: "No inventory available to reserve" }, { status: 400 });
    }
    const updated = await adjustInventory(carId, -1);
    if (!updated) {
      return NextResponse.json({ error: "Inventory conflict" }, { status: 409 });
    }
    const request = await createTestDrive({
      carId: new ObjectId(carId),
      carModel: car.model,
      customerEmail,
      customerName,
      preferredDate,
      notes,
    });
    return NextResponse.json({ request: { ...request, id: request._id.toString() } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  const session = await getServerAuthSession();
  const email = (session as { user?: { email?: string } } | null)?.user?.email;
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const requests = await listTestDrivesForEmail(email);
  const normalized = requests.map((r) => ({ ...r, id: r._id.toString() }));
  return NextResponse.json({ requests: normalized });
}





