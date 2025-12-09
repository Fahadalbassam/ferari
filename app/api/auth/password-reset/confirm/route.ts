import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { verifyAndConsumeOtp } from "@/lib/models/otps";
import { getDb } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email, otp, newPassword } = await req.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    if (!otp || typeof otp !== "string") {
      return NextResponse.json({ error: "OTP is required" }, { status: 400 });
    }
    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }
    const normalizedEmail = email.toLowerCase().trim();

    const verification = await verifyAndConsumeOtp(normalizedEmail, otp, "password_reset");
    if (!verification.ok) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
    }

    const db = await getDb();
    const passwordHash = await hash(newPassword, 10);
    const res = await db
      .collection("users")
      .findOneAndUpdate(
        { email: normalizedEmail },
        { $set: { passwordHash, updatedAt: new Date() } },
        { returnDocument: "after" },
      );

    if (!res.value) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("password-reset confirm error", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}


