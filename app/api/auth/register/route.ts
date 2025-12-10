import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }
    const normalizedEmail = email.toLowerCase().trim();
    const db = await getDb();
    const existing = await db.collection("users").findOne({ email: normalizedEmail });
    if (existing) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 });
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
    console.error("register error", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

