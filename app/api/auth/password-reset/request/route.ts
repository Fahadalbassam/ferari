import { NextResponse } from "next/server";
import { createOtp } from "@/lib/models/otps";
import { getDb } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    const normalizedEmail = email.toLowerCase().trim();

    const db = await getDb();
    const user = await db.collection("users").findOne({ email: normalizedEmail });
    if (!user) {
      // Avoid leaking which emails exist; respond OK but do nothing
      return NextResponse.json({ ok: true });
    }

    const { otp } = await createOtp(normalizedEmail, "password_reset");

    // In lieu of email delivery, log the OTP so admins/dev can retrieve it.
    console.log(`[password-reset] OTP for ${normalizedEmail}: ${otp}`);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("password-reset request error", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}


