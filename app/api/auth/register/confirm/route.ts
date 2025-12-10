import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";
import { verifyAndConsumeOtp } from "@/lib/models/otps";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { email, otp, password, name } = await req.json();
    if (!email || !otp || !password) {
      return NextResponse.json({ error: "Email, OTP, and password are required" }, { status: 400 });
    }
    const normalizedEmail = email.toLowerCase().trim();
    const db = await getDb();
    const existing = await db.collection("users").findOne({ email: normalizedEmail });
    if (existing) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 });
    }

    const verify = await verifyAndConsumeOtp(normalizedEmail, otp, "register");
    if (!verify.ok) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const now = new Date();
    await db.collection("users").insertOne({
      email: normalizedEmail,
      passwordHash,
      name: name || normalizedEmail,
      role: "user",
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("register confirm error", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

