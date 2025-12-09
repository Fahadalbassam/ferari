import { NextResponse } from "next/server";
import { listCars } from "@/lib/models/cars";

export const dynamic = "force-dynamic";

export async function GET() {
  const cars = await listCars({ status: "active" });
  return NextResponse.json({ cars });
}

