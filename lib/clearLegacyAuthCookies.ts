import { NextResponse } from "next/server";

// Remove only known legacy auth cookies to avoid 431s. Do NOT touch the canonical next-auth cookies.
const LEGACY_COOKIES = [
  "session",
  "auth-session",
  "auth.token",
  "auth_token",
  "legacy_session",
];

export function clearLegacyAuthCookies(res: NextResponse) {
  LEGACY_COOKIES.forEach((name) => res.cookies.delete(name));
  return res;
}

