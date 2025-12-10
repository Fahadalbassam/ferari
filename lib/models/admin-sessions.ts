import { ObjectId } from "mongodb";
import { cookies } from "next/headers";
import { getDb } from "../db";

export type AdminSessionRecord = {
  _id: ObjectId;
  userId: ObjectId;
  email: string;
  userIdHandle: string;
  verifiedAt: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type AdminCookiePayload = {
  userId: string;
  timestamp: number;
  expiresAt: number;
};

const COOKIE_NAME = "admin_session";
const DEFAULT_TTL_MS = 30 * 60 * 1000;

export function getAdminCookieName() {
  return COOKIE_NAME;
}

export async function readAdminCookie(): Promise<AdminCookiePayload | null> {
  const store = await cookies();
  const cookie = store.get(COOKIE_NAME)?.value;
  if (!cookie) return null;
  try {
    const parsed = JSON.parse(Buffer.from(cookie, "base64").toString()) as AdminCookiePayload;
    if (!parsed?.userId || !parsed?.expiresAt || !parsed?.timestamp) return null;
    if (Date.now() > parsed.expiresAt) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function createAdminSession(input: {
  userId: string;
  email: string;
  userIdHandle: string;
  ttlMs?: number;
}) {
  const db = await getDb();
  const verifiedAt = new Date();
  const expiresAt = new Date(verifiedAt.getTime() + (input.ttlMs ?? DEFAULT_TTL_MS));
  const doc: Omit<AdminSessionRecord, "_id"> = {
    userId: new ObjectId(input.userId),
    email: input.email,
    userIdHandle: input.userIdHandle,
    verifiedAt,
    expiresAt,
    createdAt: verifiedAt,
    updatedAt: verifiedAt,
  };
  const res = await db.collection<AdminSessionRecord>("admin_sessions").insertOne(doc as AdminSessionRecord);
  return { ...doc, _id: res.insertedId } as AdminSessionRecord;
}

export async function deleteAdminSessionsForUser(userId: string) {
  const db = await getDb();
  await db.collection<AdminSessionRecord>("admin_sessions").deleteMany({ userId: new ObjectId(userId) });
}

export async function validateAdminSession(session: { user?: { id?: string; accountType?: string; role?: string; email?: string } } | null) {
  // Fast path: role/accountType already set on the session
  if (session?.user?.role === "admin" || session?.user?.accountType === "admin") return true;

  // If we have a user id, try to fetch role from DB
  if (session?.user?.id) {
    try {
      const db = await getDb();
      const user = await db.collection("users").findOne({ _id: new ObjectId(session.user.id) });
      const accountType =
        (user as { accountType?: string; role?: string } | null)?.accountType ||
        (user as { role?: string } | null)?.role;
      if (accountType === "admin") return true;
      if ((user as { isBanned?: boolean } | null)?.isBanned) return false;
      if ((user as { isActive?: boolean } | null)?.isActive === false) return false;
    } catch {
      // fall through to cookie validation
    }
  }

  // Legacy cookie validation path
  if (!session?.user?.id) return false;
  const cookie = await readAdminCookie();
  if (!cookie || cookie.userId !== session.user.id) return false;
  if (Date.now() > cookie.expiresAt) return false;

  const db = await getDb();
  const [record, user] = await Promise.all([
    db
      .collection<AdminSessionRecord>("admin_sessions")
      .findOne({ userId: new ObjectId(cookie.userId), expiresAt: { $gt: new Date() } }),
    db.collection("users").findOne({ _id: new ObjectId(cookie.userId) }),
  ]);
  if (!record) return false;
  const accountType = (user as { accountType?: string; role?: string } | null)?.accountType || (user as { role?: string } | null)?.role;
  if (accountType !== "admin") return false;
  if ((user as { isBanned?: boolean } | null)?.isBanned) return false;
  if ((user as { isActive?: boolean } | null)?.isActive === false) return false;

  return true;
}

