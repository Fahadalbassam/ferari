import { ObjectId } from "mongodb";
import { getDb } from "../db";

export async function ensureUserIndexes() {
  const db = await getDb();
  await db.collection("users").createIndex({ email: 1 }, { unique: true });
}

export async function createCredentialsUser(input: {
  email: string;
  passwordHash: string;
  name?: string;
  role?: string;
}) {
  const db = await getDb();
  await ensureUserIndexes();
  const now = new Date();
  const doc = {
    email: input.email,
    passwordHash: input.passwordHash,
    name: input.name || input.email,
    role: input.role || "user",
    emailVerified: null as Date | null,
    createdAt: now,
    updatedAt: now,
  };
  const res = await db.collection("users").insertOne(doc);
  return { ...doc, _id: res.insertedId as ObjectId };
}
