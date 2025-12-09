import { NextResponse } from "next/server";
import type { Session } from "next-auth";
import { getServerAuthSession } from "@/lib/auth";
import { clearLegacyAuthCookies } from "@/lib/clearLegacyAuthCookies";

export async function GET() {
  const session = (await getServerAuthSession()) as (Session & { expires?: string }) | null;

  const res = NextResponse.json({
    user: session?.user?.id
      ? {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          role: session.user.role ?? "user",
        }
      : null,
    expires: session?.expires ?? null,
  });

  clearLegacyAuthCookies(res);
  return res;
}

