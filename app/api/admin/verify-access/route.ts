import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getServerAuthSession } from "@/lib/auth";

const COOKIE_NAME = "admin_session";
const MAX_AGE = 60 * 30; // 30 minutes

function makeCookie(payload: { userId: string; expiresAt: number }) {
  const value = Buffer.from(JSON.stringify(payload)).toString("base64");
  const secure = process.env.NODE_ENV === "production";
  return {
    name: COOKIE_NAME,
    value,
    httpOnly: true,
    sameSite: "strict" as const,
    secure,
    path: "/",
    maxAge: MAX_AGE,
  };
}

function readCookie() {
  const value = cookies().get(COOKIE_NAME)?.value;
  if (!value) return null;
  try {
    const parsed = JSON.parse(Buffer.from(value, "base64").toString());
    if (!parsed.userId || !parsed.expiresAt) return null;
    if (Date.now() > parsed.expiresAt) return null;
    return parsed as { userId: string; expiresAt: number };
  } catch {
    return null;
  }
}

export async function GET() {
  const session = await getServerAuthSession();
  const cookieData = readCookie();
  if (!session?.user?.id || !cookieData || cookieData.userId !== session.user.id) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true, expiresAt: new Date(cookieData.expiresAt).toISOString() });
}

export async function POST(req: Request) {
  if (!process.env.ADMIN_ROOT_PASSWORD) {
    return NextResponse.json({ error: "ADMIN_ROOT_PASSWORD not set" }, { status: 500 });
  }

  const session = await getServerAuthSession();
  if (!session?.user?.id || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  if (body.password !== process.env.ADMIN_ROOT_PASSWORD) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const expiresAt = Date.now() + MAX_AGE * 1000;
  const cookie = makeCookie({ userId: session.user.id, expiresAt });
  const res = NextResponse.json({
    authenticated: true,
    expiresAt: new Date(expiresAt).toISOString(),
  });
  res.cookies.set(cookie);
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ cleared: true });
  res.cookies.set({
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return res;
}

