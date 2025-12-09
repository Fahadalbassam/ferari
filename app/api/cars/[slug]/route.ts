import { NextResponse } from "next/server";
import { getCarBySlug } from "@/lib/models/cars";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const car = await getCarBySlug(slug);
  if (!car || car.status !== "active") return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ car });
}

