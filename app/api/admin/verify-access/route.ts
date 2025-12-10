import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getServerAuthSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import {
  AdminCookiePayload,
  createAdminSession,
  deleteAdminSessionsForUser,
  getAdminCookieName,
  readAdminCookie,
  validateAdminSession,
} from "@/lib/models/admin-sessions";

const COOKIE_NAME = getAdminCookieName();
const MAX_AGE_SECONDS = 60 * 30; // 30 minutes
const ADMIN_COOKIE_DOMAIN = process.env.ADMIN_COOKIE_DOMAIN;

if (!process.env.ADMIN_ROOT_PASSWORD) {
  throw new Error("ADMIN_ROOT_PASSWORD must be set for admin access checks.");
}

function buildCookie(payload: AdminCookiePayload) {
  const value = Buffer.from(JSON.stringify(payload)).toString("base64");
  const secure = process.env.NODE_ENV === "production";
  return {
    name: COOKIE_NAME,
    value,
    httpOnly: true,
    sameSite: "strict" as const,
    secure,
    path: "/",
    maxAge: MAX_AGE_SECONDS,
    ...(ADMIN_COOKIE_DOMAIN ? { domain: ADMIN_COOKIE_DOMAIN } : {}),
  };
}

export async function GET() {
  const session = (await getServerAuthSession()) as { user?: { id?: string; role?: string; accountType?: string } } | null;
  // Simplify: if the user is an admin by role/accountType, grant access without requiring the admin cookie handshake.
  const role = session?.user?.role || session?.user?.accountType;
  if (session?.user?.id && role === "admin") {
    return NextResponse.json({ authenticated: true });
  }

  // Fallback to legacy cookie validation if present.
  const isValid = await validateAdminSession(session);
  const cookiePayload = await readAdminCookie();
  if (!isValid || !cookiePayload) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({
    authenticated: true,
    expiresAt: new Date(cookiePayload.expiresAt).toISOString(),
  });
}

export async function POST(req: Request) {
  const session = (await getServerAuthSession()) as { user?: { id?: string } } | null;
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDb();
  const user = await db.collection("users").findOne({ _id: new ObjectId(session.user.id) });
  const accountType = (user as { accountType?: string; role?: string } | null)?.accountType || (user as { role?: string } | null)?.role;
  const isAdmin = accountType === "admin";
  if (!user || !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!user.userId) {
    // For now, allow admin role even without userId handle.
    return NextResponse.json({ authenticated: true });
  }
  if (user.isBanned || user.isActive === false) {
    return NextResponse.json({ error: "Account disabled" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  if (body.password && body.password !== process.env.ADMIN_ROOT_PASSWORD) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const expiresAt = Date.now() + MAX_AGE_SECONDS * 1000;
  const payload: AdminCookiePayload = {
    userId: session.user.id,
    timestamp: Date.now(),
    expiresAt,
  };

  await deleteAdminSessionsForUser(session.user.id);
  await createAdminSession({
    userId: session.user.id,
    email: user.email,
    userIdHandle: user.userId,
    ttlMs: MAX_AGE_SECONDS * 1000,
  });

  const cookie = buildCookie(payload);
  const res = NextResponse.json({
    authenticated: true,
    expiresAt: new Date(expiresAt).toISOString(),
  });
  res.cookies.set(cookie);
  return res;
}

export async function DELETE() {
  const session = (await getServerAuthSession()) as { user?: { id?: string } } | null;
  if (session?.user?.id) {
    await deleteAdminSessionsForUser(session.user.id);
  }
  const res = NextResponse.json({ cleared: true });
  res.cookies.set({
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
    ...(ADMIN_COOKIE_DOMAIN ? { domain: ADMIN_COOKIE_DOMAIN } : {}),
  });
  return res;
}

