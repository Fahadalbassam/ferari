import { ObjectId } from "mongodb";
import { hash, compare } from "bcryptjs";
import { getDb } from "../db";

export type OtpPurpose = "password_reset" | "register";

export type OtpRecord = {
  _id: ObjectId;
  email: string;
  otpHash: string;
  purpose: OtpPurpose;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const OTP_TTL_MINUTES = 10;

export async function createOtp(email: string, purpose: OtpPurpose) {
  const db = await getDb();
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpHash = await hash(otp, 10);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + OTP_TTL_MINUTES * 60 * 1000);

  const doc: Omit<OtpRecord, "_id"> = {
    email: email.toLowerCase().trim(),
    otpHash,
    purpose,
    expiresAt,
    used: false,
    createdAt: now,
    updatedAt: now,
  };

  const res = await db.collection<OtpRecord>("otps").insertOne(doc as OtpRecord);
  return { otp, recordId: res.insertedId };
}

export async function verifyAndConsumeOtp(email: string, otp: string, purpose: OtpPurpose) {
  const db = await getDb();
  const now = new Date();
  const record = await db
    .collection<OtpRecord>("otps")
    .findOne({ email: email.toLowerCase().trim(), purpose, used: false, expiresAt: { $gt: now } }, { sort: { createdAt: -1 } });

  if (!record) return { ok: false, reason: "not_found_or_expired" } as const;

  const match = await compare(otp, record.otpHash);
  if (!match) return { ok: false, reason: "invalid" } as const;

  await db
    .collection<OtpRecord>("otps")
    .updateOne({ _id: record._id }, { $set: { used: true, updatedAt: new Date() } });

  return { ok: true, record } as const;
}


