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

    // Send email via Resend if configured, otherwise log for dev.
    const resendApiKey = process.env.RESEND_API_KEY;
    const resendFrom = process.env.RESEND_FROM_EMAIL || process.env.RESEND_FROM;
    if (resendApiKey && resendFrom) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: resendFrom,
            to: normalizedEmail,
            subject: "Your Ferrari password reset code",
            text: `Your OTP is: ${otp}\nThis code expires in 10 minutes.`,
          }),
        });
      } catch (err) {
        console.error("Resend send failed, falling back to log", err);
        console.log(`[password-reset] OTP for ${normalizedEmail}: ${otp}`);
      }
    } else {
      // fallback for dev
      console.log(`[password-reset] OTP for ${normalizedEmail}: ${otp}`);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("password-reset request error", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}


