import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import nodemailer from "nodemailer";
import { getCarById, adjustInventory } from "@/lib/models/cars";
import { createOrder } from "@/lib/models/orders";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { carId, buyerEmail, buyerName, address, notes } = body || {};
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
      carType: car.type,
      carDescription: car.details,
      carImages: car.images,
      price: car.price,
      currency: car.currency,
      buyerEmail,
      buyerName,
      address,
      notes,
    });
    await maybeSendInvoiceEmail({
      to: buyerEmail,
      buyerName,
      orderNumber: order.orderNumber,
      carModel: car.model,
      carType: car.type,
      carDescription: car.details,
      carImages: car.images,
      price: car.price,
      currency: car.currency,
      address,
    });
    return NextResponse.json({ order });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

async function maybeSendInvoiceEmail(opts: {
  to: string;
  buyerName: string;
  orderNumber: string;
  carModel: string;
  carType?: string;
  carDescription?: string;
  carImages?: string[];
  price: number;
  currency: string;
  address?: string;
}) {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  if (!host || !user || !pass || !from) {
    console.warn("SMTP env not set; skipping invoice email.");
    return;
  }
  const transport = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: { user, pass },
  });
  const imageLines = (opts.carImages || []).slice(0, 5).map((img, idx) => `Image ${idx + 1}: ${img}`);
  const body = [
    `Hi ${opts.buyerName || "there"},`,
    "",
    `Thanks for your purchase request. Order ${opts.orderNumber}`,
    `Vehicle: ${opts.carModel}${opts.carType ? ` (${opts.carType})` : ""}`,
    `Amount: ${opts.currency} ${opts.price.toLocaleString()}`,
    opts.carDescription ? `Description: ${opts.carDescription}` : "",
    opts.address ? `Shipping/Billing: ${opts.address}` : "",
    imageLines.length ? "Images:" : "",
    ...imageLines,
    "",
    "Our team will follow up to complete your invoice and delivery steps.",
    "",
    "Ferrari Team",
  ]
    .filter(Boolean)
    .join("\n");
  await transport.sendMail({
    from,
    to: opts.to,
    subject: `Invoice for ${opts.carModel} (${opts.orderNumber})`,
    text: body,
  });
}





