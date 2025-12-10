import { NextResponse } from "next/server";
import { createOtp } from "@/lib/models/otps";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    const normalizedEmail = email.toLowerCase().trim();
    const db = await getDb();
    const existing = await db.collection("users").findOne({ email: normalizedEmail });
    if (existing) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 });
    }

    const { otp } = await createOtp(normalizedEmail, "register");

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
            subject: "Your Ferrari signup code",
            text: `Your OTP is: ${otp}\nThis code expires in 10 minutes.`,
          }),
        });
      } catch (err) {
        console.error("Resend send failed, falling back to log", err);
        console.log(`[register] OTP for ${normalizedEmail}: ${otp}`);
      }
    } else {
      console.log(`[register] OTP for ${normalizedEmail}: ${otp}`);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("register request-otp error", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

