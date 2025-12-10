import { NextRequest, NextResponse } from "next/server";
import { getCarById, adjustInventory } from "@/lib/models/cars";
import { createOrder } from "@/lib/models/orders";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { carId, buyerEmail, buyerName, address } = body || {};
    if (!carId || !buyerEmail || !buyerName) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    const car = await getCarById(carId);
    if (!car || car.status !== "active") {
      return NextResponse.json({ error: "Car not available" }, { status: 400 });
    }
    if (car.inventory <= 0) {
      return NextResponse.json({ error: "Out of stock" }, { status: 400 });
    }
    const updated = await adjustInventory(carId, -1);
    if (!updated) {
      return NextResponse.json({ error: "Inventory conflict" }, { status: 409 });
    }
    const order = await createOrder({
      carId: new ObjectId(carId),
      carModel: car.model,
      price: car.price,
      currency: car.currency,
      buyerEmail,
      buyerName,
      address,
    });
    return NextResponse.json({ order });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}


